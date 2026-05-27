import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ProposalAttachment } from "../../context/ProjectContext";
import {
  downloadAttachment,
  formatFileSize,
  openAttachmentInNewTab,
} from "../../utils/proposalAttachments";
import { Download, Expand, FileText, X } from "lucide-react";

interface ProposalAttachmentListProps {
  attachments?: ProposalAttachment[];
  compact?: boolean;
}

export function ProposalAttachmentList({
  attachments = [],
  compact = false,
}: ProposalAttachmentListProps) {
  const [lightboxImage, setLightboxImage] = useState<ProposalAttachment | null>(null);

  useEffect(() => {
    if (!lightboxImage) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxImage(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxImage]);

  if (attachments.length === 0) return null;

  const image = attachments.find((a) => a.type === "image");
  const resume = attachments.find((a) => a.type === "resume");

  return (
    <>
      <div className={`space-y-3 ${compact ? "mt-2" : "mt-4"}`}>
        <p className="text-[10px] uppercase tracking-wider text-[var(--color-muted)] font-mono">
          Attachments
        </p>

        {image && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setLightboxImage(image)}
              className="group block rounded-xl overflow-hidden border border-white/10 hover:border-[var(--color-warm)]/30 transition-colors max-w-xs text-left w-full"
            >
              <img
                src={image.dataUrl}
                alt={image.fileName}
                className={`w-full object-cover ${compact ? "max-h-32" : "max-h-48"}`}
              />
              <span className="flex items-center gap-1.5 px-3 py-2 text-[10px] text-[var(--color-muted)] bg-white/[0.02] border-t border-white/5 group-hover:text-[var(--color-warm)] transition-colors">
                <Expand size={12} /> Tap to view full size
              </span>
            </button>
            <p className="text-[10px] text-[var(--color-muted)]">
              {image.fileName} · {formatFileSize(image.sizeBytes)}
            </p>
          </div>
        )}

        {resume && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => openAttachmentInNewTab(resume)}
              className="flex-1 min-w-[200px] flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.02] hover:border-[var(--color-warm)]/30 transition-colors text-left"
            >
              <div className="h-9 w-9 rounded-lg bg-[var(--color-warm)]/10 flex items-center justify-center shrink-0">
                <FileText size={16} className="text-[var(--color-warm)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{resume.fileName}</p>
                <p className="text-[10px] text-[var(--color-muted)]">
                  PDF resume · {formatFileSize(resume.sizeBytes)} · View
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => downloadAttachment(resume)}
              className="inline-flex items-center gap-2 px-3 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:border-[var(--color-warm)]/30 transition-colors text-xs text-[var(--color-muted)]"
              aria-label="Download resume"
            >
              <Download size={14} />
              Download
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/85"
            onClick={() => setLightboxImage(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Attachment preview"
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
              aria-label="Close preview"
            >
              <X size={22} />
            </button>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-full max-h-full flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightboxImage.dataUrl}
                alt={lightboxImage.fileName}
                className="max-w-[min(100vw-2rem,900px)] max-h-[min(80vh,700px)] object-contain rounded-lg shadow-2xl"
              />
              <p className="mt-3 text-sm text-white/70 text-center">
                {lightboxImage.fileName} · {formatFileSize(lightboxImage.sizeBytes)}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
