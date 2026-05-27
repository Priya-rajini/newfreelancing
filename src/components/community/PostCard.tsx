import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageSquare,
  Send,
  ExternalLink,
  FileText,
  X,
  Link2,
  Trash2,
} from "lucide-react";
import type { CommunityPost, PostRole } from "../../types/community";
import { extractUrls, hostnameFromUrl } from "../../utils/feedUtils";

interface PostCardProps {
  post: CommunityPost;
  accentColor: string;
  liked: boolean;
  canInteract: boolean;
  commentDraft: string;
  showComments: boolean;
  onLike: () => void;
  onToggleComments: () => void;
  onCommentChange: (value: string) => void;
  onComment: () => void;
  isRegistered: boolean;
  canDelete?: boolean;
  onDelete?: () => void;
}

function formatTime(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function displayRole(role: PostRole) {
  return role === "freelancer" ? "Freelancer" : "Client";
}

const URL_PART = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/gi;
const HASHTAG_PART = /(#[\w-]+)/gi;

function renderContentWithHighlights(text: string) {
  const parts = text.split(/(https?:\/\/[^\s<>"{}|\\^`[\]]+|#[\w-]+)/gi);
  return parts.map((part, i) => {
    if (part.match(URL_PART)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--color-sky)] hover:underline break-all"
        >
          {part}
        </a>
      );
    }
    if (part.match(HASHTAG_PART)) {
      return (
        <span key={i} className="text-[var(--color-sky)] font-medium">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function PostCard({
  post,
  accentColor,
  liked,
  canInteract,
  commentDraft,
  showComments,
  onLike,
  onToggleComments,
  onCommentChange,
  onComment,
  isRegistered,
  canDelete = false,
  onDelete,
}: PostCardProps) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const urlsInContent = extractUrls(post.content);
  const imageAttachments = post.attachments.filter((a) => a.type === "image");
  const linkAttachments = post.attachments.filter(
    (a) =>
      a.type === "link" &&
      a.url &&
      !urlsInContent.some((u) => u === a.url || u.replace(/\/$/, "") === a.url?.replace(/\/$/, ""))
  );
  const fileAttachments = post.attachments.filter((a) => a.type === "file");

  return (
    <>
      <motion.article
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-5 md:p-6 border border-white/5 hover:border-[var(--color-border-strong)] transition-colors"
      >
        <div className="flex items-start gap-3">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
            style={{ backgroundColor: `${accentColor}22`, color: accentColor }}
          >
            {post.authorName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-sm w-full">
              <span className="font-medium">{post.authorName}</span>
              <span
                className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  post.role === "freelancer"
                    ? "bg-[var(--color-warm)]/15 text-[var(--color-warm)]"
                    : "bg-[var(--color-mint)]/15 text-[var(--color-mint)]"
                }`}
              >
                {displayRole(post.role)}
              </span>
              <span className="text-[var(--color-muted)] text-xs">· {formatTime(post.timestamp)}</span>
            </div>

            {post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {post.hashtags.map((tag) => (
                  <span key={tag} className="text-xs text-[var(--color-sky)]">
                    {tag.startsWith("#") ? tag : `#${tag}`}
                  </span>
                ))}
              </div>
            )}

            <p className="mt-3 text-[15px] leading-relaxed whitespace-pre-wrap">
              {renderContentWithHighlights(post.content)}
            </p>

            {imageAttachments.length > 0 && (
              <div className={`mt-4 grid gap-2 ${imageAttachments.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                {imageAttachments.map((att) => (
                  <button
                    key={att.id}
                    type="button"
                    onClick={() => att.url && setLightboxUrl(att.url)}
                    className="rounded-xl overflow-hidden border border-white/5 hover:border-[var(--color-warm)]/30 transition-colors text-left"
                  >
                    <img
                      src={att.url}
                      alt={att.name ?? "Attachment"}
                      className="w-full max-h-72 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {linkAttachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {linkAttachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/5 hover:border-[var(--color-sky)]/30 transition-colors group"
                  >
                    <div className="h-9 w-9 rounded-lg bg-[var(--color-sky)]/15 flex items-center justify-center shrink-0">
                      <Link2 size={16} className="text-[var(--color-sky)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-[var(--color-sky)]">
                        {att.url ? hostnameFromUrl(att.url) : "Link"}
                      </p>
                      <p className="text-xs text-[var(--color-muted)] truncate">{att.url}</p>
                    </div>
                    <ExternalLink size={14} className="text-[var(--color-muted)] shrink-0" />
                  </a>
                ))}
              </div>
            )}

            {fileAttachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {fileAttachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/5"
                  >
                    <div className="h-9 w-9 rounded-lg bg-[var(--color-warm)]/15 flex items-center justify-center shrink-0">
                      <FileText size={16} className="text-[var(--color-warm)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{att.name ?? "Attached file"}</p>
                      <p className="text-xs text-[var(--color-muted)]">File attachment</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={onLike}
                disabled={!canInteract}
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                  liked ? "text-[var(--color-warm)]" : "text-[var(--color-muted)] hover:text-[var(--color-warm)]"
                }`}
              >
                <Heart size={16} className={liked ? "fill-current" : ""} />
                {post.likes}
              </button>
              <button
                type="button"
                onClick={onToggleComments}
                className="flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
              >
                <MessageSquare size={16} />
                {post.comments.length}
              </button>
              {canDelete && onDelete && (
                <div className="ml-auto flex items-center gap-2">
                  {confirmDelete ? (
                    <>
                      <span className="text-xs text-[var(--color-muted)]">Delete this post?</span>
                      <button
                        type="button"
                        onClick={() => {
                          onDelete();
                          setConfirmDelete(false);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/25 text-red-400 text-sm font-medium hover:bg-red-500/35"
                      >
                        <Trash2 size={14} />
                        Yes, delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="px-3 py-1.5 rounded-lg text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] border border-white/10"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-400/30 text-sm text-red-400/90 hover:bg-red-500/10 hover:border-red-400/50 transition-colors"
                      aria-label="Delete post"
                    >
                      <Trash2 size={14} />
                      Delete post
                    </button>
                  )}
                </div>
              )}
            </div>

            {showComments && (
              <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                {post.comments.map((c) => (
                  <div key={c.id} className="flex gap-2 text-sm">
                    <span className="font-medium shrink-0">{c.authorName}</span>
                    <span className="text-[10px] text-[var(--color-muted)] shrink-0 pt-0.5">
                      {displayRole(c.role)}
                    </span>
                    <p className="text-[var(--color-muted)] flex-1">{c.content}</p>
                  </div>
                ))}
                {isRegistered && (
                  <div className="flex gap-2 mt-2">
                    <input
                      value={commentDraft}
                      onChange={(e) => onCommentChange(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && onComment()}
                      placeholder="Add a comment..."
                      className="flex-1 bg-white/[0.04] border border-white/5 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-warm)]/30"
                    />
                    <button
                      type="button"
                      onClick={onComment}
                      className="p-2 rounded-lg text-[var(--color-warm)] hover:bg-[var(--color-warm)]/10"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.article>

      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
            onClick={() => setLightboxUrl(null)}
          >
            <button
              type="button"
              onClick={() => setLightboxUrl(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
              aria-label="Close"
            >
              <X size={24} />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={lightboxUrl}
              alt="Full size"
              className="max-w-full max-h-[90vh] rounded-xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
