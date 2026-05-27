import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  ArrowBigUp,
  Link2,
  ChevronDown,
  ChevronUp,
  Trash2,
  UserPlus,
  CheckCircle2,
  Send,
  Users,
} from "lucide-react";
import { useCommunity } from "../../context/CommunityContext";
import { useUser } from "../../context/UserContext";
import { emailsMatch } from "../../utils/emailUtils";
import type { ChallengeDifficulty, SkillChallenge } from "../../types/community";
import { ChallengeComposer } from "./ChallengeComposer";

const DIFFICULTY_STYLES: Record<ChallengeDifficulty, string> = {
  Easy: "bg-[var(--color-mint)]/15 text-[var(--color-mint)]",
  Medium: "bg-[var(--color-warm)]/15 text-[var(--color-warm)]",
  Hard: "bg-red-400/15 text-red-300",
};

function sortChallenges(list: SkillChallenge[]) {
  return [...list].sort((a, b) => {
    const aCreated = a.createdAt ?? 0;
    const bCreated = b.createdAt ?? 0;
    if (aCreated !== bCreated) return bCreated - aCreated;
    return 0;
  });
}

export function SkillChallenges() {
  const { user } = useUser();
  const {
    challenges,
    createChallenge,
    deleteChallenge,
    enrollInChallenge,
    withdrawFromChallenge,
    isEnrolledInChallenge,
    hasSubmittedToChallenge,
    addSubmission,
    toggleLikeSubmission,
    getTopSubmission,
  } = useCommunity();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [submitDrafts, setSubmitDrafts] = useState<Record<string, string>>({});
  const [showSubmitForm, setShowSubmitForm] = useState<Record<string, boolean>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [enrollSuccessId, setEnrollSuccessId] = useState<string | null>(null);

  const sortedChallenges = useMemo(() => sortChallenges(challenges), [challenges]);

  const canParticipate = user.isRegistered;
  const canPostChallenge = user.isRegistered;
  const userEmail = user.email || "";
  const userName = user.name || "Anonymous";

  const handleCreateChallenge = (
    title: string,
    description: string,
    difficulty: ChallengeDifficulty,
    deadlineIso: string
  ) => createChallenge(title, description, difficulty, deadlineIso, userName, userEmail);

  const handleEnroll = (challengeId: string) => {
    setActionError(null);
    const err = enrollInChallenge(challengeId, userName, userEmail);
    if (err) {
      setActionError(err);
      return;
    }
    setEnrollSuccessId(challengeId);
    setTimeout(() => setEnrollSuccessId(null), 3000);
  };

  const handleWithdraw = (challengeId: string) => {
    setActionError(null);
    const err = withdrawFromChallenge(challengeId, userEmail);
    if (err) setActionError(err);
    setShowSubmitForm((s) => ({ ...s, [challengeId]: false }));
  };

  const handleSubmit = (challengeId: string) => {
    setActionError(null);
    const text = submitDrafts[challengeId]?.trim();
    if (!text) return;
    const err = addSubmission(challengeId, text, userName, userEmail);
    if (err) {
      setActionError(err);
      return;
    }
    setSubmitDrafts((d) => ({ ...d, [challengeId]: "" }));
    setShowSubmitForm((s) => ({ ...s, [challengeId]: false }));
    setExpanded((e) => ({ ...e, [challengeId]: true }));
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--color-muted)]">
        Enroll in a challenge, then submit your work before the deadline. Clients and freelancers can both participate.
      </p>

      {actionError && (
        <p className="text-sm text-red-400 px-1 glass rounded-lg p-3 border border-red-400/20">{actionError}</p>
      )}

      {canPostChallenge ? (
        <ChallengeComposer onPost={handleCreateChallenge} />
      ) : (
        <p className="text-sm text-[var(--color-muted)] glass rounded-xl p-4 border border-white/5">
          <a href="/dashboard" className="text-[var(--color-warm)] hover:underline">
            Sign in
          </a>{" "}
          to post, enroll, or submit challenges.
        </p>
      )}

      {sortedChallenges.map((challenge) => {
        const isCreator =
          user.isRegistered &&
          (emailsMatch(challenge.createdByEmail ?? "", userEmail) ||
            (!challenge.createdByEmail && challenge.createdByName === userName));
        const enrolled = canParticipate && isEnrolledInChallenge(challenge.id, userEmail);
        const submitted = canParticipate && hasSubmittedToChallenge(challenge.id, userEmail);
        const isOpen = expanded[challenge.id] ?? false;
        const top = getTopSubmission(challenge.id);
        const sortedSubs = [...challenge.submissions].sort((a, b) => b.timestamp - a.timestamp);
        const enrollmentCount = challenge.enrollments?.length ?? 0;

        return (
          <motion.div
            key={challenge.id}
            layout
            className="glass rounded-2xl overflow-hidden border border-white/5"
          >
            <div className="p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Trophy size={16} className="text-[var(--color-warm)]" />
                    <span
                      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${DIFFICULTY_STYLES[challenge.difficulty]}`}
                    >
                      {challenge.difficulty}
                    </span>
                    {enrolled && (
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-mint)]/15 text-[var(--color-mint)] flex items-center gap-1">
                        <CheckCircle2 size={10} />
                        Enrolled
                      </span>
                    )}
                    {submitted && (
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-sky)]/15 text-[var(--color-sky)]">
                        Submitted
                      </span>
                    )}
                  </div>
                  <h3 className="text-display text-xl font-medium">{challenge.title}</h3>
                  {challenge.createdByName && (
                    <p className="text-xs text-[var(--color-muted)] mt-1">
                      Posted by {challenge.createdByName}
                      {challenge.createdAt ? " · Community challenge" : ""}
                    </p>
                  )}
                  <p className="text-sm text-[var(--color-muted)] mt-2 max-w-2xl leading-relaxed">
                    {challenge.description}
                  </p>
                </div>
                <div className="text-right text-sm shrink-0">
                  <p className="text-[var(--color-muted)]">Deadline</p>
                  <p className="font-medium">{challenge.deadline}</p>
                  <p className="text-[var(--color-muted)] text-xs mt-1 flex items-center justify-end gap-1">
                    <Users size={12} />
                    {enrollmentCount} enrolled
                  </p>
                  <p className="text-[var(--color-muted)] text-xs">
                    {challenge.submissions.length} submission{challenge.submissions.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {enrollSuccessId === challenge.id && (
                <p className="mt-3 text-sm text-[var(--color-mint)] flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  You&apos;re enrolled! Submit your work when ready.
                </p>
              )}

              <div className="flex flex-wrap gap-3 mt-5">
                {canParticipate && !enrolled && (
                  <button
                    type="button"
                    onClick={() => handleEnroll(challenge.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-mint)] text-[#0a0a0b] text-sm font-medium"
                  >
                    <UserPlus size={16} />
                    Enroll
                  </button>
                )}
                {canParticipate && enrolled && !submitted && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setShowSubmitForm((s) => ({ ...s, [challenge.id]: !s[challenge.id] }))
                      }
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-warm)] text-[#0a0a0b] text-sm font-medium"
                    >
                      <Send size={16} />
                      Submit entry
                    </button>
                    <button
                      type="button"
                      onClick={() => handleWithdraw(challenge.id)}
                      className="px-4 py-2 rounded-full border border-white/10 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
                    >
                      Withdraw
                    </button>
                  </>
                )}
                {canParticipate && enrolled && submitted && (
                  <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-sky)]/15 text-[var(--color-sky)] text-sm">
                    <CheckCircle2 size={16} />
                    Entry submitted
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setExpanded((e) => ({ ...e, [challenge.id]: !isOpen }))}
                  className="flex items-center gap-1 px-4 py-2 rounded-full border border-[var(--color-border-strong)] text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
                >
                  {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  View submissions
                </button>
                {isCreator && (
                  <div className="flex items-center gap-1">
                    {confirmDeleteId === challenge.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            deleteChallenge(challenge.id, userEmail, userName);
                            setConfirmDeleteId(null);
                          }}
                          className="flex items-center gap-1 px-3 py-2 rounded-full bg-red-500/20 text-red-400 text-xs"
                        >
                          <Trash2 size={12} />
                          Confirm delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-3 py-2 rounded-full text-xs text-[var(--color-muted)]"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(challenge.id)}
                        className="flex items-center gap-1 px-3 py-2 rounded-full border border-white/5 text-xs text-[var(--color-muted)] hover:text-red-400"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>

              <AnimatePresence>
                {showSubmitForm[challenge.id] && enrolled && !submitted && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 overflow-hidden"
                  >
                    <label className="text-xs text-[var(--color-muted)] uppercase tracking-wider">
                      Your submission
                    </label>
                    <textarea
                      value={submitDrafts[challenge.id] ?? ""}
                      onChange={(e) =>
                        setSubmitDrafts((d) => ({ ...d, [challenge.id]: e.target.value }))
                      }
                      placeholder="Paste your project link, demo URL, or describe what you built..."
                      rows={3}
                      className="mt-1 w-full bg-white/[0.04] border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--color-warm)]/30 resize-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleSubmit(challenge.id)}
                      disabled={!submitDrafts[challenge.id]?.trim()}
                      className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-warm)] text-[#0a0a0b] text-sm font-medium disabled:opacity-40"
                    >
                      <Send size={14} />
                      Submit for challenge
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-t border-white/5 bg-white/[0.02] px-5 md:px-6 py-4 space-y-3"
                >
                  {sortedSubs.length === 0 ? (
                    <p className="text-sm text-[var(--color-muted)] py-4 text-center">
                      No submissions yet. Be the first to enroll and submit!
                    </p>
                  ) : (
                    sortedSubs.map((sub) => {
                      const isTop = top?.id === sub.id && sub.likes > 0;
                      const liked = userEmail ? sub.likedBy.includes(userEmail) : false;

                      return (
                        <div
                          key={sub.id}
                          className={`flex items-start gap-3 p-4 rounded-xl ${
                            isTop ? "bg-[var(--color-warm)]/8 border border-[var(--color-warm)]/25" : "bg-white/[0.03]"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              user.isRegistered && toggleLikeSubmission(challenge.id, sub.id, userEmail)
                            }
                            disabled={!user.isRegistered}
                            className={`flex flex-col items-center gap-0.5 shrink-0 ${
                              liked ? "text-[var(--color-warm)]" : "text-[var(--color-muted)]"
                            }`}
                          >
                            <ArrowBigUp size={18} />
                            <span className="text-xs font-medium">{sub.likes}</span>
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium text-sm">{sub.userName}</span>
                              {isTop && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-warm)]/20 text-[var(--color-warm)]">
                                  🏆 Featured
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-[var(--color-muted)] mt-1 break-all flex items-start gap-1">
                              <Link2 size={12} className="shrink-0 mt-1" />
                              {sub.linkOrText}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {!user.isRegistered && (
        <p className="text-sm text-center text-[var(--color-muted)]">
          <a href="/dashboard" className="text-[var(--color-warm)] hover:underline">
            Sign in
          </a>{" "}
          to enroll and submit challenges.
        </p>
      )}
    </div>
  );
}
