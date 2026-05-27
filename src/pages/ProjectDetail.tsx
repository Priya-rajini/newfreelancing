import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  useProjects,
  type ProposalAttachment,
  type ProposalStatus,
} from "../context/ProjectContext";
import { useTalent } from "../context/TalentContext";
import { useUser } from "../context/UserContext";
import { computeMatch } from "../utils/matching";
import { RevealSection } from "../components/ui/RevealSection";
import { ProposalAttachmentPicker } from "../components/ui/ProposalAttachmentPicker";
import { ProposalAttachmentList } from "../components/ui/ProposalAttachmentList";
import { ArrowLeft, X, FileText, Send, CheckCircle2, XCircle, Clock, Users } from "lucide-react";

function proposalStatusLabel(status: ProposalStatus) {
  if (status === "approved") return "Approved";
  if (status === "denied") return "Denied";
  return "Pending review";
}

function ProposalStatusBadge({ status }: { status: ProposalStatus }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-mint)]/10 text-[var(--color-mint)] border border-[var(--color-mint)]/20">
        <CheckCircle2 size={10} /> Approved
      </span>
    );
  }
  if (status === "denied") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
        <XCircle size={10} /> Denied
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[var(--color-muted)] border border-white/10">
      <Clock size={10} /> Pending
    </span>
  );
}

function formatBudget(project: { projectType: string; budget: number }) {
  return project.projectType === "Fixed"
    ? `$${project.budget.toLocaleString()}`
    : `$${project.budget}/hr`;
}

function formatDeadline(deadline: string) {
  try {
    return new Date(deadline).toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return deadline;
  }
}

function formatCommentTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Just now";
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const incomingProposals = [
  { name: "Maya Chen", score: 94, rate: "$95/hr", timeline: "6 weeks" },
  { name: "James Okafor", score: 78, rate: "$120/hr", timeline: "5 weeks" },
  { name: "Elena Voss", score: 72, rate: "$140/hr", timeline: "8 weeks" },
];

export function ProjectDetail() {
  const { id } = useParams();
  const { projects, submitProposal } = useProjects();
  const { getTalentById, myTalentId } = useTalent();
  const { user } = useUser();
  const project = projects.find((p) => p.id === id);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [freelancerEmail, setFreelancerEmail] = useState(user.email || "");
  const [proposalMessage, setProposalMessage] = useState("");
  const [proposalImage, setProposalImage] = useState<ProposalAttachment | null>(null);
  const [proposalResume, setProposalResume] = useState<ProposalAttachment | null>(null);
  const [proposalError, setProposalError] = useState("");
  const [proposalSuccess, setProposalSuccess] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const isClient =
    user.role === "client" || (user.role === "both" && user.activeRoleView === "client");
  const isFreelancer =
    user.role === "freelancer" || (user.role === "both" && user.activeRoleView === "freelancer");

  const comments = project?.comments ?? [];
  const proposals = project?.proposals ?? [];
  const myProposal = useMemo(
    () => (myTalentId ? proposals.find((p) => p.freelancerId === myTalentId) : undefined),
    [proposals, myTalentId]
  );


  const handleSubmitProposal = () => {
    if (!project || !myTalentId) return;
    setProposalError("");

    if (!freelancerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(freelancerEmail.trim())) {
      setProposalError("Please enter a valid email address.");
      return;
    }

    const attachments = [proposalImage, proposalResume].filter(
      (a): a is ProposalAttachment => a !== null
    );
    const err = submitProposal(
      project.id,
      myTalentId,
      freelancerEmail.trim(),
      proposalMessage,
      project.projectType === "Fixed" ? `$${project.budget.toLocaleString()}` : `$${project.budget}/hr`,
      "4 weeks",
      attachments
    );
    if (err) {
      setProposalError(err);
      return;
    }
    setProposalMessage("");
    setProposalImage(null);
    setProposalResume(null);
    setProposalSuccess(true);
  };

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments.length]);

  if (!project) {
    return (
      <div className="pt-28 pb-24 min-h-screen">
        <div className="mx-auto max-w-[900px] px-4 md:px-8">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
          >
            <ArrowLeft size={16} /> All projects
          </Link>
          <p className="mt-8 text-[var(--color-muted)]">Project not found.</p>
        </div>
      </div>
    );
  }



  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="mx-auto max-w-[900px] px-4 md:px-8">
        <Link
          to={isClient ? "/dashboard" : "/projects"}
          className="inline-flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] mb-6"
        >
          <ArrowLeft size={16} /> Back
        </Link>

        <RevealSection>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p className="text-[var(--color-muted)] text-sm">{project.status}</p>
              <h1 className="text-display text-3xl md:text-4xl font-medium mt-2">{project.title}</h1>
            </div>
            {isClient && (
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl glass border border-[var(--color-border-strong)] text-sm hover:border-[var(--color-warm)]/30 transition-colors shrink-0 self-start"
              >
                <Users size={16} />
                View proposals ({incomingProposals.length})
              </button>
            )}
            {!isClient && user.role !== "client" && (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm bg-[var(--color-warm)]/15 text-[var(--color-warm)] border border-[var(--color-warm)]/25 shrink-0 self-start"
              >
                <FileText size={16} />
                Manage in workspace
              </Link>
            )}
          </div>
        </RevealSection>

        <article className="mt-12 prose-custom">
          <RevealSection delay={0.1}>
            <h2 className="text-lg font-medium mb-4">Overview</h2>
            <p className="text-[var(--color-muted)] leading-[1.8] text-[17px]">{project.description}</p>
          </RevealSection>

          <RevealSection delay={0.15} className="mt-12">
            <h2 className="text-lg font-medium mb-4">Details</h2>
            <ul className="space-y-3 text-[var(--color-muted)] text-[17px] leading-relaxed">
              <li className="flex gap-3">
                <span className="text-[var(--color-warm)]">→</span>
                Budget: {formatBudget(project)}
              </li>
              <li className="flex gap-3">
                <span className="text-[var(--color-warm)]">→</span>
                Deadline: {formatDeadline(project.deadline)}
              </li>
              <li className="flex gap-3">
                <span className="text-[var(--color-warm)]">→</span>
                {project.proposalsCount} proposal{project.proposalsCount === 1 ? "" : "s"} received
              </li>
            </ul>
          </RevealSection>

          {project.requiredSkills.length > 0 && (
            <RevealSection delay={0.2} className="mt-12">
              <h2 className="text-lg font-medium mb-4">Required skills</h2>
              <div className="flex flex-wrap gap-2">
                {project.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="text-sm px-3 py-1 rounded-full bg-white/5 text-[var(--color-muted)]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </RevealSection>
          )}

          {isFreelancer && project.status === "Open" && (
            <RevealSection delay={0.22} className="mt-12">
              <h2 className="text-lg font-medium mb-4">Submit a proposal</h2>
              {!user.isRegistered ? (
                <div className="glass rounded-xl p-6 text-sm text-[var(--color-muted)]">
                  <Link to="/dashboard" className="text-[var(--color-warm)] hover:underline">
                    Sign in
                  </Link>{" "}
                  as a freelancer to apply for this project.
                </div>
              ) : !myTalentId ? (
                <div className="glass rounded-xl p-6 text-sm text-[var(--color-muted)]">
                  Complete your freelancer profile (add at least one skill on the dashboard) before
                  applying.
                </div>
              ) : myProposal ? (
                <div className="glass rounded-xl p-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">Your proposal</p>
                    <ProposalStatusBadge status={myProposal.status} />
                  </div>
                  <p className="text-sm text-[var(--color-muted)] mt-3 leading-relaxed whitespace-pre-wrap">
                    {myProposal.coverMessage}
                  </p>
                  <ProposalAttachmentList attachments={myProposal.attachments} compact />
                  <p className="text-[11px] text-[var(--color-muted)] mt-3">
                    {proposalStatusLabel(myProposal.status)} · Match score {myProposal.matchScore}%
                  </p>
                  {myProposal.status === "approved" && (
                    <div className="mt-3 text-xs text-[var(--color-mint)] font-medium border-t border-white/5 pt-3">
                      Client Contact Email: <strong className="text-white font-semibold">{project.clientEmail || "client@example.com"}</strong>
                    </div>
                  )}
                </div>
              ) : (
                <div className="glass rounded-xl p-6">
                  <p className="text-sm text-[var(--color-muted)] mb-4">
                    Tell the client why you are a good fit. Your proposal will appear in their
                    dashboard with AI match metrics.
                  </p>
                  
                  <div className="mb-4">
                    <label className="text-[11px] uppercase tracking-wider text-[var(--color-muted)] mb-1.5 block">
                      Your Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={freelancerEmail}
                      onChange={(e) => {
                        setFreelancerEmail(e.target.value);
                        setProposalError("");
                      }}
                      placeholder="you@example.com"
                      className="w-full bg-white/5 border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-warm)]/40 text-white placeholder-white/20"
                      required
                    />
                  </div>

                  <textarea
                    value={proposalMessage}
                    onChange={(e) => {
                      setProposalMessage(e.target.value);
                      setProposalError("");
                      setProposalSuccess(false);
                    }}
                    rows={5}
                    placeholder="Describe your approach, relevant experience, and timeline..."
                    className="w-full bg-white/5 border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-warm)]/40 text-white placeholder:text-white/30 resize-y min-h-[120px]"
                  />
                  <ProposalAttachmentPicker
                    image={proposalImage}
                    resume={proposalResume}
                    onImageChange={setProposalImage}
                    onResumeChange={setProposalResume}
                  />
                  {proposalError && (
                    <p className="text-xs text-red-400 mt-2">{proposalError}</p>
                  )}
                  {proposalSuccess && (
                    <p className="text-xs text-[var(--color-mint)] mt-2">
                      Proposal sent. The client can review and evaluate it from their dashboard.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleSubmitProposal}
                    disabled={!proposalMessage.trim()}
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#0a0a0b] bg-[var(--color-warm)] disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                  >
                    <Send size={16} /> Send proposal
                  </button>
                </div>
              )}
            </RevealSection>
          )}

          <RevealSection delay={0.25} className="mt-16">
            <h2 className="text-lg font-medium mb-6">Discussion</h2>
            <p className="text-sm text-[var(--color-muted)] mb-4">
              {isClient
                ? "Thread with your hired freelancer."
                : "Reply in Dashboard → Messages for full contract chat."}
            </p>
            <div className="space-y-4">
              {comments.length === 0 ? (
                [
                  { author: "Alex (Vault)", text: "Love the direction on the transfer flow. Can we explore a denser data table variant?", time: "Yesterday" },
                  { author: "Maya Chen", text: "Absolutely — I'll add a compact view toggle in the next iteration.", time: "5h ago" },
                ].map((c) => (
                  <div key={c.time} className="glass rounded-xl p-4">
                    <p className="text-sm font-medium">{c.author}</p>
                    <p className="text-[var(--color-muted)] mt-2 text-sm leading-relaxed">{c.text}</p>
                    <p className="text-[11px] text-[var(--color-muted)] mt-2">{c.time}</p>
                  </div>
                ))
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="glass rounded-xl p-4">
                    <p className="text-sm font-medium">{c.author}</p>
                    <p className="text-[var(--color-muted)] mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                      {c.text}
                    </p>
                    <p className="text-[11px] text-[var(--color-muted)] mt-2">
                      {formatCommentTime(c.createdAt)}
                    </p>
                  </div>
                ))
              )}
              <div ref={commentsEndRef} />
            </div>
            {!isClient && (
              <Link
                to="/dashboard?section=messages"
                className="inline-block mt-4 text-sm text-[var(--color-warm)] hover:underline"
              >
                Open Messages in workspace →
              </Link>
            )}
          </RevealSection>
        </article>
      </div>

      {isClient && (
        <button
          onClick={() => setDrawerOpen(true)}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 flex items-center gap-2 px-5 py-3 rounded-full glass-strong shadow-2xl hover:border-[var(--color-warm)]/30 transition-colors z-30"
        >
          <FileText size={18} />
          <span className="text-sm font-medium">
            Proposals ({project.proposalsCount})
          </span>
        </button>
      )}

      <AnimatePresence>
        {isClient && drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md glass-strong border-l border-[var(--color-border)] z-50 overflow-y-auto"
            >
              <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center">
                <h3 className="font-medium">Proposals</h3>
                <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                {proposals.length === 0 ? (
                  <p className="text-sm text-[var(--color-muted)]">
                    No proposals yet. When freelancers apply, their proposals will appear here.
                  </p>
                ) : (
                  proposals.map((proposal) => {
                    const freelancer = getTalentById(proposal.freelancerId);
                    const liveScore = freelancer
                      ? computeMatch(project, freelancer).matchScore
                      : proposal.matchScore;
                    return (
                      <div
                        key={proposal.id}
                        className="glass rounded-xl p-5 border border-white/5 hover:border-[var(--color-warm)]/20 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="h-10 w-10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                              style={{
                                background: `${freelancer?.color ?? "#6ee7b7"}22`,
                                color: freelancer?.color ?? "#6ee7b7",
                              }}
                            >
                              {freelancer?.avatar ?? "?"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm text-white truncate">
                                {freelancer?.name ?? "Freelancer"}
                              </p>
                              <p className="text-[11px] text-[var(--color-muted)] truncate">
                                Email: {proposal.freelancerEmail}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-sm font-bold text-[var(--color-mint)]">
                              {liveScore}%
                            </span>
                            <ProposalStatusBadge status={proposal.status} />
                          </div>
                        </div>
                        <p className="text-sm text-[var(--color-muted)] mt-3 leading-relaxed">
                          {proposal.coverMessage}
                        </p>
                        <ProposalAttachmentList
                          attachments={proposal.attachments}
                          compact
                        />
                        <Link
                          to={`/ai/proposal-evaluator?freelancerId=${proposal.freelancerId}&projectId=${project.id}`}
                          onClick={() => setDrawerOpen(false)}
                          className="inline-block mt-3 text-xs text-[var(--color-warm)] hover:underline"
                        >
                          Review & evaluate →
                        </Link>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
