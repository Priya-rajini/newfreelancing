import { useEffect, useRef, useState } from "react";
import { ImagePlus, Link2, Paperclip, Send, X, ChevronDown } from "lucide-react";
import type { PostAttachment } from "../../types/community";
import { extractHashtags, extractUrls, validatePostContent } from "../../utils/feedUtils";

interface PostComposerProps {
  onPost: (content: string, hashtags: string[], attachments: PostAttachment[]) => void;
  suggestion?: string;
  onSuggestionApplied?: () => void;
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function PostComposer({ onPost, suggestion, onSuggestionApplied }: PostComposerProps) {
  const [content, setContent] = useState("");

  useEffect(() => {
    if (suggestion) {
      setContent(suggestion);
      onSuggestionApplied?.();
    }
  }, [suggestion, onSuggestionApplied]);
  const [attachments, setAttachments] = useState<PostAttachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewHashtags = extractHashtags(content);
  const previewUrls = extractUrls(content);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAttachments((prev) => [
        ...prev,
        { id: uid(), type: "image", url: reader.result as string, name: file.name },
      ]);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
    setAttachMenuOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachments((prev) => [
      ...prev,
      { id: uid(), type: "file", name: file.name, url: undefined },
    ]);
    e.target.value = "";
    setAttachMenuOpen(false);
  };

  const addLink = () => {
    const url = linkInput.trim();
    if (!url) return;
    const normalized = url.match(/^https?:\/\//i) ? url : `https://${url}`;
    try {
      new URL(normalized);
    } catch {
      setError("Enter a valid URL");
      return;
    }
    if (attachments.some((a) => a.type === "link" && a.url === normalized)) {
      setLinkInput("");
      setShowLinkInput(false);
      return;
    }
    setAttachments((prev) => [...prev, { id: uid(), type: "link", url: normalized }]);
    setLinkInput("");
    setShowLinkInput(false);
    setError(null);
    setAttachMenuOpen(false);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = () => {
    const validationError = validatePostContent(content);
    if (validationError) {
      setError(validationError);
      return;
    }
    const hashtags = extractHashtags(content);
    onPost(content, hashtags, attachments);
    setContent("");
    setAttachments([]);
    setError(null);
    setShowLinkInput(false);
    setLinkInput("");
  };

  return (
    <div className="glass rounded-2xl p-5 md:p-6 border border-white/5">
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          if (error) setError(null);
        }}
        placeholder="Share something with the community... (min 10 characters, use #hashtags)"
        rows={4}
        className="w-full bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-muted)] resize-none outline-none text-sm leading-relaxed"
      />

      {previewHashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {previewHashtags.map((tag) => (
            <span key={tag} className="text-xs text-[var(--color-sky)]">
              {tag}
            </span>
          ))}
        </div>
      )}

      {previewUrls.length > 0 && (
        <p className="text-[11px] text-[var(--color-muted)] mt-2">
          {previewUrls.length} link{previewUrls.length !== 1 ? "s" : ""} will be auto-detected in your post
        </p>
      )}

      {attachments.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="relative group flex items-center gap-2 rounded-lg bg-white/[0.04] border border-white/5 p-2 pr-8"
            >
              {att.type === "image" && att.url && (
                <img src={att.url} alt={att.name ?? "Preview"} className="h-14 w-14 rounded-md object-cover" />
              )}
              {att.type === "link" && (
                <div className="flex items-center gap-2 px-1">
                  <Link2 size={14} className="text-[var(--color-sky)] shrink-0" />
                  <span className="text-xs text-[var(--color-muted)] max-w-[160px] truncate">{att.url}</span>
                </div>
              )}
              {att.type === "file" && (
                <div className="flex items-center gap-2 px-1">
                  <Paperclip size={14} className="text-[var(--color-warm)] shrink-0" />
                  <span className="text-xs text-[var(--color-muted)] max-w-[140px] truncate">{att.name}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeAttachment(att.id)}
                className="absolute top-1 right-1 p-0.5 rounded-full bg-black/50 text-white hover:bg-red-500/80 transition-colors"
                aria-label="Remove attachment"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showLinkInput && (
        <div className="mt-3 flex gap-2">
          <input
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addLink()}
            placeholder="https://..."
            className="flex-1 bg-white/[0.04] border border-white/5 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-sky)]/40"
          />
          <button
            type="button"
            onClick={addLink}
            className="px-3 py-2 rounded-lg text-sm bg-[var(--color-sky)]/15 text-[var(--color-sky)]"
          >
            Add
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => setAttachMenuOpen((o) => !o)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/5 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border-strong)]"
          >
            <Paperclip size={14} />
            Add attachment
            <ChevronDown size={12} className={`transition-transform ${attachMenuOpen ? "rotate-180" : ""}`} />
          </button>
          {attachMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setAttachMenuOpen(false)} />
              <div className="absolute left-0 top-full mt-1 z-20 py-1 rounded-xl glass border border-white/10 shadow-xl min-w-[180px]">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-white/[0.06]"
                >
                  <ImagePlus size={14} />
                  Upload image
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLinkInput(true);
                    setAttachMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-white/[0.06]"
                >
                  <Link2 size={14} />
                  Paste link
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left hover:bg-white/[0.06]"
                >
                  <Paperclip size={14} />
                  Attach file
                </button>
              </div>
            </>
          )}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-warm)] text-[#0a0a0b] text-sm font-medium"
        >
          <Send size={14} />
          Post
        </button>
      </div>
    </div>
  );
}
