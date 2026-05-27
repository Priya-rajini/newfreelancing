import type { ProposalAttachment, ProposalAttachmentType } from "../context/ProjectContext";

const IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const RESUME_MIME = new Set(["application/pdf"]);

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

export async function fileToProposalAttachment(
  file: File,
  type: ProposalAttachmentType
): Promise<{ attachment?: ProposalAttachment; error?: string }> {
  const maxBytes = type === "image" ? MAX_IMAGE_BYTES : MAX_RESUME_BYTES;
  const allowed = type === "image" ? IMAGE_MIME : RESUME_MIME;

  if (!allowed.has(file.type)) {
    return {
      error:
        type === "image"
          ? "Image must be JPEG, PNG, or WebP."
          : "Resume must be a PDF file.",
    };
  }

  if (file.size > maxBytes) {
    return {
      error: `File is too large (max ${formatFileSize(maxBytes)}).`,
    };
  }

  try {
    const dataUrl = await readFileAsDataUrl(file);
    const attachment: ProposalAttachment = {
      id: `att-${type}-${Date.now()}`,
      type,
      fileName: file.name,
      mimeType: file.type,
      dataUrl,
      sizeBytes: file.size,
    };
    return { attachment };
  } catch {
    return { error: "Failed to process file. Try again." };
  }
}

/** Short-lived blob URL — safer than opening huge data: URLs in a new tab */
export function dataUrlToBlobUrl(dataUrl: string): string | null {
  if (!dataUrl.startsWith("data:")) return null;
  try {
    const comma = dataUrl.indexOf(",");
    if (comma === -1) return null;
    const header = dataUrl.slice(0, comma);
    const base64 = dataUrl.slice(comma + 1);
    const mime = header.match(/data:([^;]+)/)?.[1] ?? "application/octet-stream";
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return URL.createObjectURL(new Blob([bytes], { type: mime }));
  } catch {
    return null;
  }
}

export function revokeBlobUrl(url: string | null) {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
}

export function openAttachmentInNewTab(attachment: ProposalAttachment) {
  const blobUrl = dataUrlToBlobUrl(attachment.dataUrl);
  if (!blobUrl) return;
  const tab = window.open(blobUrl, "_blank", "noopener,noreferrer");
  if (!tab) {
    revokeBlobUrl(blobUrl);
    return;
  }
  window.setTimeout(() => revokeBlobUrl(blobUrl), 60_000);
}

export function downloadAttachment(attachment: ProposalAttachment) {
  const blobUrl = dataUrlToBlobUrl(attachment.dataUrl) ?? attachment.dataUrl;
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = attachment.fileName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  if (blobUrl.startsWith("blob:")) {
    window.setTimeout(() => revokeBlobUrl(blobUrl), 1000);
  }
}

export function validateProposalAttachments(
  attachments: ProposalAttachment[]
): string | null {
  const images = attachments.filter((a) => a.type === "image");
  const resumes = attachments.filter((a) => a.type === "resume");

  if (images.length > 1) return "Only one image attachment is allowed.";
  if (resumes.length > 1) return "Only one resume attachment is allowed.";
  if (attachments.length > 2) return "Maximum two attachments (one image and one resume).";

  for (const att of attachments) {
    const max = att.type === "image" ? MAX_IMAGE_BYTES : MAX_RESUME_BYTES;
    if (att.sizeBytes > max) {
      return `${att.fileName} exceeds the size limit.`;
    }
  }

  return null;
}
