import { useRef, useState } from "react";
import type { ProposalAttachment } from "../../context/ProjectContext";
import { fileToProposalAttachment, formatFileSize } from "../../utils/proposalAttachments";
import { FileText, ImagePlus, X } from "lucide-react";

interface ProposalAttachmentPickerProps {
  image: ProposalAttachment | null;
  resume: ProposalAttachment | null;
  onImageChange: (attachment: ProposalAttachment | null) => void;
  onResumeChange: (attachment: ProposalAttachment | null) => void;
}

export function ProposalAttachmentPicker({
  image,
  resume,
  onImageChange,
  onResumeChange,
}: ProposalAttachmentPickerProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const handleFile = async (
    file: File | undefined,
    type: "image" | "resume",
    onChange: (a: ProposalAttachment | null) => void
  ) => {
    if (!file) return;
    setError("");
    const { attachment, error: err } = await fileToProposalAttachment(file, type);
    if (err) {
      setError(err);
      return;
    }
    if (attachment) onChange(attachment);
  };

  return (
    <div className="mt-4 space-y-3">
      <p className="text-xs text-[var(--color-muted)]">
        Optional: attach a portfolio image and/or PDF resume (max{" "}
        {formatFileSize(2 * 1024 * 1024)} image, {formatFileSize(5 * 1024 * 1024)} PDF).
      </p>

      <div className="flex flex-wrap gap-2">
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            void handleFile(e.target.files?.[0], "image", onImageChange);
            e.target.value = "";
          }}
        />
        <input
          ref={resumeInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            void handleFile(e.target.files?.[0], "resume", onResumeChange);
            e.target.value = "";
          }}
        />

        {!image && (
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs border border-white/10 bg-white/[0.03] hover:border-[var(--color-warm)]/30 transition-colors"
          >
            <ImagePlus size={14} /> Add image
          </button>
        )}
        {!resume && (
          <button
            type="button"
            onClick={() => resumeInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs border border-white/10 bg-white/[0.03] hover:border-[var(--color-warm)]/30 transition-colors"
          >
            <FileText size={14} /> Add resume (PDF)
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {image && (
        <div className="flex items-start gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.02]">
          <img
            src={image.dataUrl}
            alt={image.fileName}
            className="h-16 w-16 rounded-lg object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{image.fileName}</p>
            <p className="text-[10px] text-[var(--color-muted)]">
              Image · {formatFileSize(image.sizeBytes)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onImageChange(null)}
            className="p-1 text-[var(--color-muted)] hover:text-red-400"
            aria-label="Remove image"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {resume && (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.02]">
          <div className="h-10 w-10 rounded-lg bg-[var(--color-warm)]/10 flex items-center justify-center shrink-0">
            <FileText size={18} className="text-[var(--color-warm)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{resume.fileName}</p>
            <p className="text-[10px] text-[var(--color-muted)]">
              Resume · {formatFileSize(resume.sizeBytes)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onResumeChange(null)}
            className="p-1 text-[var(--color-muted)] hover:text-red-400"
            aria-label="Remove resume"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
