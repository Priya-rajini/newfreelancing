import { useMemo } from "react";
import { RevealSection } from "../../components/ui/RevealSection";
import { MatchMetricBars } from "../../components/ui/MatchMetricBars";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { useLiveEvaluation } from "../../hooks/useLiveEvaluation";
import { useProjects, type ProposalStatus } from "../../context/ProjectContext";
import { useUser } from "../../context/UserContext";
import { ProposalAttachmentList } from "../../components/ui/ProposalAttachmentList";

function ProposalStatusBanner({ status }: { status: ProposalStatus }) {
  if (status === "approved") {
    return (
      <p className="text-sm text-[var(--color-mint)] flex items-center gap-2">
        <CheckCircle2 size={16} /> You approved this proposal.
      </p>
    );
  }
  if (status === "denied") {
    return (
      <p className="text-sm text-red-400 flex items-center gap-2">
        <XCircle size={16} /> You declined this proposal.
      </p>
    );
  }
  return (
    <p className="text-sm text-[var(--color-muted)]">
      Pending your decision — review the proposal and AI metrics below.
    </p>
  );
}

export function ProposalEvaluator() {
  const [searchParams] = useSearchParams();
  const freelancerId = searchParams.get("freelancerId");
  const projectId = searchParams.get("projectId");
  const evaluation = useLiveEvaluation(projectId, freelancerId);
  const { projects, updateProposalStatus } = useProjects();
  const { user } = useUser();

  const isClient =
    user.role === "client" || (user.role === "both" && user.activeRoleView === "client");

  const proposal = useMemo(() => {
    if (!projectId || !freelancerId) return undefined;
    const project = projects.find((p) => p.id === projectId);
    return project?.proposals?.find((p) => p.freelancerId === freelancerId);
  }, [projects, projectId, freelancerId]);

  if (!freelancerId || !projectId) {
    return (
      <div className="pt-28 pb-24 min-h-screen">
        <div className="mx-auto max-w-[640px] px-4 md:px-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] mb-8"
          >
            <ArrowLeft size={16} /> Back to dashboard
          </Link>
          <p className="text-[var(--color-muted)]">
            Select a proposal from your dashboard or project page to review it.
          </p>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="pt-28 pb-24 min-h-screen">
        <div className="mx-auto max-w-[640px] px-4 md:px-8">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] mb-8">
            <ArrowLeft size={16} /> Back to dashboard
          </Link>
          <p className="text-[var(--color-muted)]">
            Unable to load proposal evaluation. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const { freelancer, project, match, metrics, summary } = evaluation;
  const canDecide = isClient && proposal && proposal.status === "pending";

  const handleApprove = () => {
    if (!proposal) return;
    updateProposalStatus(project.id, proposal.id, "approved");
  };

  const handleDeny = () => {
    if (!proposal) return;
    updateProposalStatus(project.id, proposal.id, "denied");
  };

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="mx-auto max-w-[800px] px-4 md:px-8">
        <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] mb-8">
          <ArrowLeft size={16} /> Projects
        </Link>

        <RevealSection>
          <h1 className="text-display text-3xl font-medium">Proposal evaluation</h1>
          <p className="text-[var(--color-muted)] mt-2">
            {freelancer.name} · {project.title}
          </p>
          {proposal && isClient && (
            <div className="mt-3">
              <ProposalStatusBanner status={proposal.status} />
            </div>
          )}
        </RevealSection>

        {proposal ? (
          <RevealSection delay={0.05} className="mt-6">
            <div className="glass rounded-2xl p-6">
              <h2 className="text-sm font-medium text-white mb-3">Proposal message</h2>
              <p className="text-sm text-[var(--color-muted)] leading-relaxed whitespace-pre-wrap">
                {proposal.coverMessage}
              </p>
              <ProposalAttachmentList attachments={proposal.attachments} />
              <div className="mt-4 pt-3 border-t border-white/5 text-xs text-[var(--color-muted)]">
                Freelancer Email: <strong className="text-white font-semibold">{proposal.freelancerEmail}</strong>
              </div>
            </div>
          </RevealSection>
        ) : (
          <RevealSection delay={0.05} className="mt-6">
            <div className="glass rounded-2xl p-6 text-sm text-[var(--color-muted)]">
              No formal proposal submitted yet. Metrics below are based on profile and project fit.
            </div>
          </RevealSection>
        )}

        <RevealSection delay={0.1} className="mt-6">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-sm font-medium text-white mb-3">AI summary</h2>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">{summary}</p>
            <p className="text-xs text-[var(--color-muted)] mt-4">
              {freelancer.headline}
              {freelancer.location ? ` · ${freelancer.location}` : ""}
              {freelancer.availability !== "Not specified"
                ? ` · ${freelancer.availability}`
                : ""}
            </p>
            {match.matchedSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {match.matchedSkills.map((skill: string) => (
                  <span
                    key={skill}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-mint)]/10 text-[var(--color-mint)] border border-[var(--color-mint)]/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </RevealSection>

        <RevealSection delay={0.15} className="mt-6">
          <div className="glass rounded-2xl p-6">
            <MatchMetricBars metrics={metrics} headlineScore={match.matchScore} />
          </div>
        </RevealSection>

        {canDecide && (
          <RevealSection delay={0.2} className="mt-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleApprove}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-[#0a0a0b] bg-[var(--color-mint)] hover:opacity-90 transition-opacity"
              >
                <CheckCircle2 size={18} /> Approve proposal
              </button>
              <button
                type="button"
                onClick={handleDeny}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <XCircle size={18} /> Deny proposal
              </button>
            </div>
          </RevealSection>
        )}

        {!isClient && user.isRegistered && (
          <p className="mt-8 text-sm text-[var(--color-muted)]">
            Switch to client view on your{" "}
            <Link to="/dashboard" className="text-[var(--color-warm)] hover:underline">
              dashboard
            </Link>{" "}
            to approve or deny proposals.
          </p>
        )}
      </div>
    </div>
  );
}
