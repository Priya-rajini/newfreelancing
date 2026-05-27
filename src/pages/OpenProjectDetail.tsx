import { Link, useParams } from "react-router-dom";
import { RevealSection } from "../components/ui/RevealSection";
import { ProposalForm } from "../components/proposals/ProposalForm";
import { useProjects } from "../context/ProjectContext";
import { ArrowLeft, MapPin, Clock, Users, Zap } from "lucide-react";

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

export function OpenProjectDetail() {
  const { id } = useParams();
  const { projects } = useProjects();
  const project = projects.find((p) => p.id === id) || projects.find((p) => p.id === "arcadia-react-dashboard") || projects[0];

  if (!project) {
    return (
      <div className="pt-24 pb-20 min-h-screen">
        <div className="mx-auto max-w-[1200px] px-4 md:px-8">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-var(--color-text) mb-8"
          >
            <ArrowLeft size={16} /> All open projects
          </Link>
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-[var(--color-muted)]">Project not found.</p>
          </div>
        </div>
      </div>
    );
  }

  const urgency = (project as any).urgency ?? "medium";
  const clientName = project.clientName ?? "Client";
  const budgetStr = typeof project.budget === "number" ? `$${project.budget.toLocaleString()}` : project.budget;
  const budgetHint = (project as any).budgetHint ?? (project.projectType === "Fixed" ? "Fixed price" : "Hourly rate");
  const timelineStr = (project as any).timeline ?? formatDeadline(project.deadline);
  const locationStr = (project as any).location ?? "Remote";
  const skills = project.requiredSkills ?? [];
  const scope = (project as any).scope ?? [
    "Review core deliverables and align with the client on standard project goals.",
    "Implement design guidelines and code standards as specified.",
    "Submit regular project updates and milestone progress checkpoints.",
  ];
  const postedStr = (project as any).posted ?? "Just now";

  const urgencyStyles: Record<string, string> = {
    high: "bg-[var(--color-warm)]/15 text-[var(--color-warm)]",
    medium: "bg-white/5 text-[var(--color-muted)]",
    low: "bg-[var(--color-mint)]/10 text-[var(--color-mint)]",
  };

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="mx-auto max-w-[1200px] px-4 md:px-8">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] mb-8"
        >
          <ArrowLeft size={16} /> All open projects
        </Link>

        <div className="grid lg:grid-cols-[1fr_400px] gap-12 lg:gap-16 items-start">
          <div>
            <RevealSection>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--color-mint)]/10 text-[var(--color-mint)] border border-[var(--color-mint)]/20">
                  Open for proposals
                </span>
                <span className={`text-[11px] px-2.5 py-1 rounded-full ${urgencyStyles[urgency] || urgencyStyles.medium}`}>
                  {urgency} priority
                </span>
              </div>
              <h1 className="text-display text-3xl md:text-4xl font-medium leading-tight text-white">{project.title}</h1>
              <p className="text-[var(--color-muted)] mt-2">{clientName}</p>

              <div className="flex flex-wrap gap-5 mt-6 text-sm text-[var(--color-muted)]">
                <span className="flex items-center gap-1.5">
                  <span className="text-[var(--color-warm)] font-medium">{budgetStr}</span>
                  <span className="text-[11px]">({budgetHint})</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} /> {timelineStr}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} /> {locationStr}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users size={14} /> {project.proposalsCount} proposals
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mt-6">
                {skills.map((s) => (
                  <span key={s} className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-[var(--color-muted)]">
                    {s}
                  </span>
                ))}
              </div>
            </RevealSection>

            <RevealSection delay={0.1} className="mt-12">
              <h2 className="text-lg font-medium mb-4 text-white">About this project</h2>
              <p className="text-[var(--color-muted)] leading-[1.85] text-[17px]">{project.description}</p>
            </RevealSection>

            <RevealSection delay={0.15} className="mt-12">
              <h2 className="text-lg font-medium mb-4 text-white">Deliverables</h2>
              <ul className="space-y-3">
                {scope.map((item: string) => (
                  <li key={item} className="flex gap-3 text-[var(--color-muted)] text-[17px] leading-relaxed">
                    <Zap size={16} className="text-[var(--color-warm)] shrink-0 mt-1" />
                    {item}
                  </li>
                ))}
              </ul>
            </RevealSection>

            <p className="text-[11px] text-[var(--color-muted)] mt-8">Posted {postedStr}</p>
          </div>

          <aside className="lg:sticky lg:top-28">
            <RevealSection direction="right">
              <div className="glass rounded-2xl p-6 md:p-8 border border-[var(--color-border-strong)]">
                <h2 className="font-medium text-lg mb-1 text-white">Submit your proposal</h2>
                <p className="text-sm text-[var(--color-muted)] mb-6">
                  Custom bid, timeline, and cover message — scored by SkillSync AI.
                </p>
                <ProposalForm
                  projectId={project.id}
                  projectTitle={project.title}
                  clientName={clientName}
                  suggestedBudget={budgetStr}
                  suggestedTimeline={timelineStr}
                />
              </div>
            </RevealSection>
          </aside>
        </div>
      </div>
    </div>
  );
}
