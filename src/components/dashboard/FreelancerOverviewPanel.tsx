import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { useProjects } from "../../context/ProjectContext";
import { useTalent } from "../../context/TalentContext";
import { projects } from "../../data/mockData";
import { Clock, ChevronRight } from "lucide-react";

interface FreelancerOverviewPanelProps {
  skillBadges: string[];
  onNavigate: (section: "contracts" | "earnings" | "reviews") => void;
}

export function FreelancerOverviewPanel({ skillBadges, onNavigate }: FreelancerOverviewPanelProps) {
  const { user } = useUser();
  const { projects: contextProjects } = useProjects();
  const { myTalentId } = useTalent();

  const myProposals = useMemo(() => {
    const list: any[] = [];
    contextProjects.forEach((proj) => {
      const prop = proj.proposals?.find((p) => p.freelancerId === myTalentId || p.freelancerEmail === user.email);
      if (prop) {
        list.push({
          id: prop.id,
          projectTitle: proj.title,
          bidAmount: prop.bidAmount,
          status: prop.status === "approved" ? "accepted" : prop.status === "denied" ? "declined" : "pending",
          score: prop.matchScore,
          clientEmail: proj.clientEmail || "client@example.com",
        });
      }
    });
    return list;
  }, [contextProjects, myTalentId, user.email]);

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { label: "Active contracts", value: user.contracts.length, action: () => onNavigate("contracts") },
          {
            label: "Available balance",
            value: `$${user.earnings.available.toLocaleString()}`,
            action: () => onNavigate("earnings"),
          },
          { label: "Client reviews", value: user.clientReviews.length, action: () => onNavigate("reviews") },
        ].map((stat) => (
          <button
            key={stat.label}
            type="button"
            onClick={stat.action}
            className="glass rounded-xl p-4 text-left hover:border-[var(--color-border-strong)] transition-colors"
          >
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-muted)]">{stat.label}</p>
            <p className="text-xl font-semibold mt-1">{stat.value}</p>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <p className="text-[11px] uppercase tracking-wider text-[var(--color-muted)] font-mono">Quick access</p>
        {user.contracts.slice(0, 2).map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onNavigate("contracts")}
            className="w-full block glass rounded-xl p-5 hover:border-[var(--color-border-strong)] transition-all text-left"
          >
            <div className="flex justify-between">
              <h3 className="font-medium text-sm">{c.projectTitle}</h3>
              <span className="text-[11px] text-[var(--color-muted)]">{c.progress}%</span>
            </div>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">{c.clientName}</p>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <p className="text-[11px] uppercase tracking-wider text-[var(--color-muted)] font-mono">Current work</p>
        {projects.map((p, i) => (
          <Link
            key={p.id}
            to={`/projects/${p.id}`}
            className="block glass rounded-xl p-5 hover:border-[var(--color-border-strong)] transition-all group"
            style={{ transform: `translateX(${i * 4}px)` }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-sm group-hover:text-[var(--color-warm)]">{p.title}</h3>
                <p className="text-xs text-[var(--color-muted)]">{p.client}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5">{p.status}</span>
            </div>
            <div className="flex justify-between mt-3 text-[10px] text-[var(--color-muted)]">
              <span className="flex items-center gap-1">
                <Clock size={10} /> Due {p.due}
              </span>
              <ChevronRight size={12} className="opacity-0 group-hover:opacity-100" />
            </div>
          </Link>
        ))}
      </div>

      <div className="glass rounded-xl p-6 border-l-2 border-l-[var(--color-warm)]">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="font-medium text-sm">Skill badges</h3>
            <p className="text-xs text-[var(--color-muted)] mt-1">Earn verified badges via AI skill tests.</p>
          </div>
          <Link
            to="/ai/skill-verification"
            className="text-[11px] px-3 py-1.5 rounded-full bg-[var(--color-warm)]/15 text-[var(--color-warm)] shrink-0"
          >
            Take test
          </Link>
        </div>
        {skillBadges.length > 0 ? (
          <div className="flex flex-wrap gap-2 mt-4">
            {skillBadges.map((b) => (
              <span
                key={b}
                className="text-[10px] px-2.5 py-1 rounded-full bg-[var(--color-warm)]/10 text-[var(--color-warm)] border border-[var(--color-warm)]/20 font-mono"
              >
                {b}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-[var(--color-muted)] mt-3">No skill badges yet.</p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-[11px] uppercase tracking-wider text-[var(--color-muted)] font-mono">My proposals</p>
          <Link to="/projects" className="text-[11px] text-[var(--color-warm)] hover:underline">
            Browse open →
          </Link>
        </div>
        {myProposals.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)] glass rounded-xl p-5">
            Submit proposals on open project listings.
          </p>
        ) : (
          myProposals.slice(0, 2).map((prop) => (
            <div key={prop.id} className="glass rounded-xl p-4 text-sm">
              <p className="font-medium">{prop.projectTitle}</p>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                {prop.bidAmount} · <span className={
                  prop.status === "accepted" ? "text-[var(--color-mint)] font-medium" :
                  prop.status === "declined" ? "text-red-400 font-medium" : ""
                }>{prop.status === "accepted" ? "Approved" : prop.status === "declined" ? "Denied" : "Pending"}</span> · {prop.score}% match
              </p>
              {prop.status === "accepted" && (
                <p className="text-[11px] text-[var(--color-muted)] mt-1.5 border-t border-white/5 pt-1.5">
                  Client Email: <span className="text-white">{prop.clientEmail}</span>
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
