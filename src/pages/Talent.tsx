import { Link } from "react-router-dom";
import { freelancers } from "../data/mockData";
import { RevealSection } from "../components/ui/RevealSection";
import { Sparkles } from "lucide-react";

export function Talent() {
  return (
    <div className="pt-28 pb-20 min-h-screen">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="grid lg:grid-cols-[1fr_380px] gap-16 items-start">
          <div>
            <RevealSection>
              <p className="text-[13px] uppercase tracking-[0.15em] text-[var(--color-muted)]">Talent</p>
              <h1 className="text-display text-4xl md:text-6xl font-medium mt-4 max-w-[12ch]">
                People who ship.
              </h1>
              <p className="mt-6 text-[var(--color-muted)] max-w-md text-lg">
                Curated freelancers with AI-verified skills. No spam profiles.
              </p>
            </RevealSection>

            <div className="mt-16 space-y-6">
              {freelancers.map((f, i) => (
                <RevealSection key={f.id} delay={i * 0.08}>
                  <Link
                    to={`/profile/${f.id}`}
                    className="group flex flex-col sm:flex-row gap-6 p-6 md:p-8 rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-border-strong)] bg-[var(--color-surface)]/50 transition-all hover:-translate-y-0.5"
                    style={{ marginLeft: i % 2 === 1 ? "auto" : 0, maxWidth: i % 2 === 1 ? "92%" : "100%" }}
                  >
                    <div
                      className="h-16 w-16 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0"
                      style={{ background: `${f.color}18`, color: f.color }}
                    >
                      {f.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline gap-3">
                        <h2 className="text-xl font-medium">{f.name}</h2>
                        <span className="text-[var(--color-muted)] text-sm">{f.location}</span>
                      </div>
                      <p className="text-[var(--color-muted)] mt-1">{f.role}</p>
                      <p className="mt-3 text-sm text-[var(--color-muted)] line-clamp-2">{f.bio}</p>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {f.skills.map((s) => (
                          <span key={s} className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-[var(--color-muted)]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="sm:text-right shrink-0">
                      <p className="text-lg font-medium">{f.rate}</p>
                      <p className="text-sm text-[var(--color-mint)] mt-1 flex items-center sm:justify-end gap-1">
                        <Sparkles size={12} /> {f.match}% match
                      </p>
                    </div>
                  </Link>
                </RevealSection>
              ))}
            </div>
          </div>

          <aside className="lg:sticky lg:top-28">
            <RevealSection direction="right" delay={0.2}>
              <div className="glass rounded-2xl p-6">
                <h3 className="font-medium mb-4">Filter by AI</h3>
                <input
                  type="text"
                  placeholder="e.g. React expert for fintech MVP"
                  className="w-full bg-white/5 border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-warm)]/40"
                />
                <p className="text-[11px] text-[var(--color-muted)] mt-3">
                  Natural language search powered by SkillSync AI
                </p>
              </div>
            </RevealSection>
          </aside>
        </div>
      </div>
    </div>
  );
}
