import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { MessageSquare, Sparkles, GraduationCap } from "lucide-react";
import { useCommunity } from "../../context/CommunityContext";
import { useUser } from "../../context/UserContext";
import type { PostRole, PostAttachment } from "../../types/community";
import { isPostAuthor } from "../../utils/emailUtils";
import { PostComposer } from "./PostComposer";
import { PostCard } from "./PostCard";

const AI_POST_IDEAS = [
  "Just shipped a #React dashboard — here's what I learned after 3 weeks of iteration...",
  "My biggest #Freelancing win this month: landed a repeat client by sharing a case study upfront.",
  "Resource drop: this #Career article changed how I price discovery calls (link below).",
  "Ask the community: how do you handle scope creep on fixed-price projects?",
  "Proof of work: redesigned onboarding flow — 40% faster time-to-first-action. Screenshots attached!",
];

const MENTOR_POST_IDEAS = [
  "I'm available for #Mentorship — book a 1:1 on React, career growth, or portfolio reviews.",
  "Offering free #Mentorship sessions this week for new freelancers. DM me your goals!",
  "Client perspective: happy to mentor on hiring, briefs, and what makes proposals stand out. #Mentorship",
];

export function PublicFeed() {
  const { user } = useUser();
  const { posts, createPost, deletePost, toggleLikePost, addComment, getMyMentorSettings } =
    useCommunity();
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [postSuggestion, setPostSuggestion] = useState<string | undefined>();

  const isClient =
    user.role === "client" || (user.role === "both" && user.activeRoleView === "client");
  const isFreelancer =
    user.role === "freelancer" || (user.role === "both" && user.activeRoleView === "freelancer");
  const mentorSettings = user.email ? getMyMentorSettings(user.email) : null;
  const isMentorAvailable = mentorSettings?.available === true;
  const canPost =
    user.isRegistered && (isFreelancer || (isClient && isMentorAvailable));
  const postRole: PostRole = isClient ? "client" : "freelancer";
  const authorName = user.name || "Guest";
  const authorEmail = user.email || "";

  const sortedPosts = [...posts].sort((a, b) => b.timestamp - a.timestamp);

  const handlePost = (content: string, hashtags: string[], attachments: PostAttachment[]) => {
    createPost(content, hashtags, attachments, authorName, authorEmail, postRole);
  };

  const handleComment = (postId: string) => {
    const draft = commentDrafts[postId]?.trim();
    if (!draft || !user.isRegistered) return;
    addComment(postId, draft, authorName, authorEmail, postRole);
    setCommentDrafts((d) => ({ ...d, [postId]: "" }));
    setExpandedComments((e) => ({ ...e, [postId]: true }));
  };

  return (
    <div className="space-y-6">
      {canPost && (
        <PostComposer
          onPost={handlePost}
          suggestion={postSuggestion}
          onSuggestionApplied={() => setPostSuggestion(undefined)}
        />
      )}

      {!user.isRegistered && (
        <p className="text-sm text-[var(--color-muted)] text-center py-4">
          <a href="/dashboard" className="text-[var(--color-warm)] hover:underline">
            Sign in
          </a>{" "}
          to like and comment on posts.
        </p>
      )}

      {user.isRegistered && isClient && !isMentorAvailable && (
        <div className="glass rounded-xl p-4 border border-[var(--color-warm)]/20 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-start gap-2 flex-1">
            <GraduationCap size={18} className="text-[var(--color-warm)] shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--color-muted)]">
              Interested in mentoring? Enable mentorship on the{" "}
              <Link to="/community?tab=mentorship" className="text-[var(--color-warm)] hover:underline">
                Mentorship tab
              </Link>{" "}
              to post and share your expertise with the community.
            </p>
          </div>
        </div>
      )}

      {sortedPosts.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <MessageSquare size={32} className="mx-auto text-[var(--color-muted)] mb-3" />
          <p className="text-[var(--color-muted)]">
            No posts yet. Share project screenshots, resources, or wins with attachments.
          </p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {sortedPosts.map((post) => {
            const liked = authorEmail ? post.likedBy.includes(authorEmail) : false;
            const showComments = expandedComments[post.id] ?? post.comments.length > 0;

            return (
              <PostCard
                key={post.id}
                post={post}
                accentColor={user.color}
                liked={liked}
                canInteract={user.isRegistered}
                commentDraft={commentDrafts[post.id] ?? ""}
                showComments={showComments}
                onLike={() => user.isRegistered && toggleLikePost(post.id, authorEmail)}
                onToggleComments={() =>
                  setExpandedComments((e) => ({ ...e, [post.id]: !showComments }))
                }
                onCommentChange={(value) =>
                  setCommentDrafts((d) => ({ ...d, [post.id]: value }))
                }
                onComment={() => handleComment(post.id)}
                isRegistered={user.isRegistered}
                canDelete={
                  user.isRegistered && isPostAuthor(post, authorEmail, authorName)
                }
                onDelete={() => {
                  if (!deletePost(post.id, authorEmail, authorName)) {
                    window.alert("Could not delete this post. Make sure you are signed in as the author.");
                  }
                }}
              />
            );
          })}
        </AnimatePresence>
      )}

      <div className="glass rounded-xl p-4 border border-[var(--color-sky)]/20">
        <div className="flex items-center gap-2 text-[var(--color-sky)] mb-2">
          <Sparkles size={14} />
          <span className="text-xs font-medium uppercase tracking-wider">AI suggested post ideas</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(isMentorAvailable ? [...MENTOR_POST_IDEAS, ...AI_POST_IDEAS] : AI_POST_IDEAS).map(
            (idea) => (
              <button
                key={idea}
                type="button"
                disabled={!canPost}
                onClick={() => canPost && setPostSuggestion(idea)}
                className="text-xs px-3 py-1.5 rounded-full bg-white/[0.04] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/[0.08] transition-colors disabled:opacity-50 text-left"
              >
                {idea.length > 72 ? `${idea.slice(0, 72)}…` : idea}
              </button>
            )
          )}
        </div>
        <p className="text-[11px] text-[var(--color-muted)] mt-2">
          Tip: include #hashtags and paste URLs — they are auto-detected when you post.
        </p>
      </div>
    </div>
  );
}
