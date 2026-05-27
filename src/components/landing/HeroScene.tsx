import { motion } from "framer-motion";
import { useMouseParallax } from "../../hooks/useMouseParallax";
import { freelancers } from "../../data/mockData";
import { Sparkles, ArrowUpRight, Briefcase } from "lucide-react";
import { MagneticButton } from "../ui/MagneticButton";

const heroCards = [
  {
    type: "match" as const,
    x: "68%",
    y: "14%",
    rot: 3,
    delay: 0.15,
  },
  {
    type: "project" as const,
    x: "72%",
    y: "52%",
    rot: -4,
    delay: 0.25,
  },
];

export function HeroScene() {
  const parallax = useMouseParallax(0.012);
  const topFreelancer = freelancers[0];

  return (
    <section className="relative min-h-[92vh] overflow-hidden pt-28 pb-16 md:pt-32 md:pb-24">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% -15%, rgba(232,168,124,0.14), transparent), radial-gradient(ellipse 50% 40% at 85% 70%, rgba(110,231,183,0.07), transparent)",
        }}
      />

      <div className="relative mx-auto max-w-[1200px] px-4 md:px-8">
        <div className="grid lg:grid-cols-[1fr_0.85fr] gap-12 items-center">
          <div className="z-10 max-w-xl">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[12px] uppercase tracking-[0.2em] text-[var(--color-muted)] mb-6"
            >
              SkillSync AI · Talent marketplace
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="text-display text-[clamp(2.25rem,5.5vw,4.25rem)] font-medium leading-[1.08] tracking-tight"
            >
              Find Talent.
              <br />
              <span className="text-[var(--color-warm)]">Build Faster.</span>
              <br />
              Powered by AI.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mt-6 text-lg md:text-xl text-[var(--color-muted)] leading-relaxed max-w-md"
            >
              Hire verified freelancers, get AI-powered matches, and manage projects seamlessly.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <MagneticButton to="/talent" variant="primary">
                Explore Talent <ArrowUpRight size={16} />
              </MagneticButton>
              <MagneticButton to="/post-project" variant="outline">
                Post a Project
              </MagneticButton>
            </motion.div>
          </div>

          <div className="relative hidden lg:block h-[420px]">
            {heroCards.map((card, i) => (
              <motion.div
                key={card.type}
                className="absolute"
                style={{ left: card.x, top: card.y }}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: parallax.x * (i + 1) * 0.4,
                  y: parallax.y * (i + 1) * 0.4,
                }}
                transition={{ delay: 0.4 + card.delay, duration: 0.5 }}
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
                  style={{ rotate: card.rot }}
                >
                  {card.type === "match" && (
                    <div className="glass rounded-2xl p-4 w-[220px] border border-[var(--color-mint)]/20 shadow-lg">
                      <div className="flex items-center gap-2 text-[var(--color-mint)] text-xs font-medium mb-3">
                        <Sparkles size={14} />
                        AI match
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className="h-11 w-11 rounded-xl flex items-center justify-center text-sm font-bold"
                          style={{
                            background: `${topFreelancer.color}22`,
                            color: topFreelancer.color,
                          }}
                        >
                          {topFreelancer.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{topFreelancer.name}</p>
                          <p className="text-2xl font-semibold text-[var(--color-mint)] mt-0.5">
                            {topFreelancer.match}% match
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {card.type === "project" && (
                    <div className="glass rounded-2xl p-4 w-[200px] border-l-2 border-l-[var(--color-warm)]">
                      <div className="flex items-center gap-2 text-[var(--color-muted)] text-xs mb-2">
                        <Briefcase size={14} />
                        Active project
                      </div>
                      <p className="text-sm font-medium">Vault Finance UI</p>
                      <p className="text-sm text-[var(--color-warm)] mt-1">$12,000 · Fixed</p>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="lg:hidden mt-12 flex gap-3 overflow-x-auto pb-2"
        >
          <div className="glass shrink-0 rounded-xl p-4 min-w-[200px] border border-[var(--color-mint)]/20">
            <p className="text-xs text-[var(--color-mint)] mb-1">94% match</p>
            <p className="text-sm font-medium">{topFreelancer.name}</p>
          </div>
          <div className="glass shrink-0 rounded-xl p-4 min-w-[180px] border-l-2 border-l-[var(--color-warm)]">
            <p className="text-xs text-[var(--color-muted)]">Active project</p>
            <p className="text-sm font-medium mt-1">Vault Finance UI</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
