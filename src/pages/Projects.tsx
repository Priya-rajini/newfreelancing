import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { RevealSection } from "../components/ui/RevealSection";
import { useUser } from "../context/UserContext";
import { useProjects } from "../context/ProjectContext";
import { useTalent } from "../context/TalentContext";
import { Plus, Briefcase, Send, Clock, CheckCircle2, XCircle } from "lucide-react";

type Tab = "open" | "active" | "submitted";

function formatBudget(project: { projectType: string; budget: number }) {
  return project.projectType === "Fixed"
    ? `$${project.budget.toLocaleString()}`
    : `$${project.budget}/hr`;
}

function formatDeadline(deadline: string) {
  try {
    const diff = new Date(deadline).getTime() - Date.now();
    const days = Math.ceil(diff / 86400000);
    if (days <= 0) return "Passed";
    if (days < 7) return `${days} days left`;
    const weeks = Math.round(days / 7);
    return `${weeks} weeks left`;
  } catch {
    return deadline;
  }
}

export function Projects() {
  const { user } = useUser();
  const { projects: contextProjects } = useProjects();
  const { myTalentId } = useTalent();
  const [tab, setTab] = useState<Tab>("open");

  // Compute lists dynamically
  const openProjectsList = useMemo(() => {
    return contextProjects.filter((p) => p.status === "Open");
  }, [contextProjects]);

  const activeProjectsList = useMemo(() => {
    // Show projects that are Active where the current freelancer has an approved proposal
    return contextProjects.filter(
      (p) => p.status === "Active" && p.proposals?.some((prop) => prop.freelancerId === myTalentId && prop.status === "approved")
    );
  }, [contextProjects, myTalentId]);

  const myProposals = useMemo(() => {
    const list: any[] = [];
    contextProjects.forEach((proj) => {
      const prop = proj.proposals?.find((p) => p.freelancerId === myTalentId || p.freelancerEmail === user.email);
      if (prop) {
        list.push({
          id: prop.id,
          projectId: proj.id,
          projectTitle: proj.title,
          clientName: proj.clientName || "Client",
          clientEmail: proj.clientEmail || "client@example.com",
          bidAmount: prop.bidAmount,
          timeline: prop.timeline,
          coverMessage: prop.coverMessage,
          status: prop.status === "approved" ? "accepted" : prop.status === "denied" ? "declined" : "pending",
          score: prop.matchScore,
        });
      }
    });
    return list;
  }, [contextProjects, myTalentId, user.email]);

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <RevealSection>
            <h1 className="text-display text-4xl md:text-5xl font-medium">Projects</h1>
            <p className="text-[var(--color-muted)] mt-2 max-w-lg">
              Browse open listings, submit proposals with your bid and timeline, or track active work.
            </p>
          </RevealSection>
          <RevealSection delay={0.1}>
            <Link
              to="/post-project"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--color-border-strong)] text-sm hover:border-[var(--color-warm)]/40 transition-colors self-start text-white"
            >
              <Plus size={16} /> Post a project
            </Link>
          </RevealSection>
        </div>

        <div className="flex flex-wrap gap-2 mt-10 p-1 glass rounded-xl w-fit">
          {(
            [
              { id: "open" as Tab, label: "Open for proposals", count: openProjectsList.length },
              { id: "submitted" as Tab, label: "My proposals", count: myProposals.length },
              { id: "active" as Tab, label: "Active work", count: activeProjectsList.length },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                tab === t.id ? "bg-white/[0.08] text-[var(--color-text)]" : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className="ml-1.5 text-[10px] opacity-60">({t.count})</span>
              )}
            </button>
          ))}
        </div>

        {tab === "open" && (
          <div className="mt-12 space-y-5">
            {openProjectsList.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center max-w-lg mx-auto">
                <Briefcase size={32} className="mx-auto text-[var(--color-muted)]" />
                <p className="mt-4 text-[var(--color-muted)]">No open projects found.</p>
              </div>
            ) : (
              openProjectsList.map((p, i) => (
                <RevealSection key={p.id} delay={i * 0.05}>
                  <Link
                    to={`/projects/open/${p.id}`}
                    className="group block glass rounded-2xl p-6 md:p-8 hover:border-[var(--color-border-strong)] transition-all hover:-translate-y-0.5"
                    style={{ marginLeft: i % 3 === 1 ? 24 : 0, maxWidth: i % 3 === 1 ? "calc(100% - 24px)" : "100%" }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6 justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-mint)]/10 text-[var(--color-mint)] border border-[var(--color-mint)]/20">
                            Open
                          </span>
                          <span className="text-[11px] text-[var(--color-muted)]">
                            Deadline: {new Date(p.deadline).toLocaleDateString()}
                          </span>
                        </div>
                        <h2 className="text-xl font-medium group-hover:text-[var(--color-warm)] transition-colors">
                          {p.title}
                        </h2>
                        <p className="text-sm text-[var(--color-muted)] mt-1">{p.clientName || "Client"}</p>
                        <p className="text-sm text-[var(--color-muted)] mt-3 line-clamp-2 max-w-2xl">{p.description}</p>
                        <div className="flex flex-wrap gap-2 mt-4">
                          {p.requiredSkills.slice(0, 4).map((s) => (
                            <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[var(--color-muted)]">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="lg:text-right shrink-0 space-y-2">
                        <p className="text-lg font-medium text-[var(--color-warm)]">{formatBudget(p)}</p>
                        <p className="text-sm text-[var(--color-muted)] flex items-center lg:justify-end gap-1">
                          <Clock size={12} /> {formatDeadline(p.deadline)}
                        </p>
                        <p className="text-[11px] text-[var(--color-muted)]">{p.proposalsCount} proposals</p>
                        <span className="inline-flex items-center gap-1 mt-2 text-sm text-[var(--color-mint)] group-hover:underline">
                          <Send size={14} /> Submit proposal
                        </span>
                      </div>
                    </div>
                  </Link>
                </RevealSection>
              ))
            )}
          </div>
        )}

        {tab === "submitted" && (
          <div className="mt-12">
            {myProposals.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center max-w-lg mx-auto">
                <Briefcase size={32} className="mx-auto text-[var(--color-muted)]" />
                <p className="mt-4 text-[var(--color-muted)]">No proposals yet.</p>
                <button
                  type="button"
                  onClick={() => setTab("open")}
                  className="mt-4 text-sm text-[var(--color-warm)] hover:underline"
                >
                  Browse open projects →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myProposals.map((prop, i) => (
                  <RevealSection key={prop.id} delay={i * 0.05}>
                    <div className="glass rounded-xl p-6">
                      <div className="flex flex-wrap justify-between gap-4">
                        <div>
                          <h3 className="font-medium">{prop.projectTitle}</h3>
                          <p className="text-sm text-[var(--color-muted)]">{prop.clientName}</p>
                        </div>
                        <div className="text-right text-sm">
                          <p>
                            <span className="text-[var(--color-muted)]">Bid:</span> {prop.bidAmount}
                          </p>
                          <p>
                            <span className="text-[var(--color-muted)]">Timeline:</span> {prop.timeline}
                          </p>
                          <p className="text-[var(--color-mint)] font-bold mt-1">AI score {prop.score}%</p>
                        </div>
                      </div>
                      <p className="text-sm text-[var(--color-muted)] mt-4 line-clamp-2 border-t border-[var(--color-border)] pt-4">
                        {prop.coverMessage}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 mt-4 text-[11px]">
                        <span className={`px-2.5 py-0.5 rounded-full capitalize font-semibold flex items-center gap-1 ${
                          prop.status === "accepted" ? "bg-[var(--color-mint)]/10 text-[var(--color-mint)] border border-[var(--color-mint)]/20" :
                          prop.status === "declined" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-white/5 text-[var(--color-muted)]"
                        }`}>
                          {prop.status === "accepted" ? (
                            <>
                              <CheckCircle2 size={10} /> Approved
                            </>
                          ) : prop.status === "declined" ? (
                            <>
                              <XCircle size={10} /> Denied
                            </>
                          ) : (
                            <>
                              <Clock size={10} /> Pending
                            </>
                          )}
                        </span>
                        {prop.status === "accepted" && (
                          <span className="text-[var(--color-mint)] font-medium">
                            Client Email: <strong className="text-white font-semibold">{prop.clientEmail}</strong>
                          </span>
                        )}
                        <Link to={`/projects/open/${prop.projectId}`} className="text-[var(--color-warm)] hover:underline">
                          View project
                        </Link>
                        <Link to={`/ai/proposal-evaluator?freelancerId=${myTalentId || user.email}&projectId=${prop.projectId}`} className="text-[var(--color-muted)] hover:text-[var(--color-text)]">
                          AI evaluation
                        </Link>
                      </div>
                    </div>
                  </RevealSection>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "active" && (
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeProjectsList.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center max-w-lg mx-auto md:col-span-2 lg:col-span-3">
                <Briefcase size={32} className="mx-auto text-[var(--color-muted)]" />
                <p className="mt-4 text-[var(--color-muted)]">No active projects yet.</p>
              </div>
            ) : (
              activeProjectsList.map((p, i) => (
                <RevealSection key={p.id} delay={i * 0.08}>
                  <Link
                    to={`/projects/${p.id}`}
                    className={`block glass rounded-2xl p-8 h-full hover:border-[var(--color-border-strong)] transition-all hover:-translate-y-1 ${
                      i === 0 ? "md:col-span-2 lg:col-span-1 min-h-[240px] flex flex-col justify-between" : ""
                    }`}
                  >
                    <div>
                      <span className="text-[11px] text-[var(--color-muted)]">{p.clientName || "Client"}</span>
                      <h2 className="text-xl font-medium mt-2">{p.title}</h2>
                    </div>
                    <div className="mt-8">
                      <div className="h-1 rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[var(--color-warm)] to-[var(--color-mint)]"
                          style={{ width: `50%` }} // Default 50% for new active ones
                        />
                      </div>
                      <div className="flex justify-between mt-4 text-sm text-[var(--color-muted)]">
                        <span>{p.status}</span>
                        <span>{formatBudget(p)}</span>
                      </div>
                    </div>
                  </Link>
                </RevealSection>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
