import { motion } from "framer-motion";
import { RevealSection } from "../ui/RevealSection";
import { MagneticButton } from "../ui/MagneticButton";
import {
  Sparkles,
  ShieldCheck,
  LayoutGrid,
  ArrowUpRight,
  Trophy,
  Users,
  MessageSquare,
} from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Smart Matching",
    desc: "Get top freelancers instantly based on skills and project needs.",
    iconClass: "text-[var(--color-warm)] bg-[var(--color-warm)]/10 border-[var(--color-warm)]/20",
  },
  {
    icon: ShieldCheck,
    title: "Verified Talent",
    desc: "Work with trusted and verified professionals.",
    iconClass: "text-[var(--color-mint)] bg-[var(--color-mint)]/10 border-[var(--color-mint)]/20",
  },
  {
    icon: LayoutGrid,
    title: "Seamless Collaboration",
    desc: "Manage projects, payments, and communication in one place.",
    iconClass: "text-[var(--color-sky)] bg-[var(--color-sky)]/10 border-[var(--color-sky)]/20",
  },
];

const STEPS = [
  { num: "01", title: "Post a Project", desc: "Describe what you need in minutes." },
  { num: "02", title: "Get AI Matches", desc: "See ranked freelancers instantly." },
  { num: "03", title: "Hire & Collaborate", desc: "Work together in one workspace." },
];

const COMMUNITY_POINTS = [
  { icon: MessageSquare, label: "Share wins" },
  { icon: Trophy, label: "Join challenges" },
  { icon: Users, label: "Connect with mentors" },
];

export function StorySections() {
  return (
    <>
      {/* Core features — 3 cards */}
      <section className="py-20 md:py-28 border-t border-white/5">
        <div className="mx-auto max-w-[1200px] px-4 md:px-8">
          <RevealSection className="text-center max-w-lg mx-auto mb-14">
            <p className="text-[12px] uppercase tracking-[0.18em] text-[var(--color-muted)] mb-3">
              Why SkillSync
            </p>
            <h2 className="text-display text-3xl md:text-4xl font-medium">
              Everything you need. Nothing you don&apos;t.
            </h2>
          </RevealSection>

          <div className="grid md:grid-cols-3 gap-5 md:gap-6">
            {FEATURES.map((f, i) => (
              <RevealSection key={f.title} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="group glass h-full rounded-2xl p-6 md:p-8 border border-white/5 hover:border-[var(--color-border-strong)] transition-colors"
                >
                  <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center mb-6 border transition-colors group-hover:scale-105 ${f.iconClass}`}
                  >
                    <f.icon size={22} />
                  </div>
                  <h3 className="text-lg font-medium mb-2">{f.title}</h3>
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed">{f.desc}</p>
                </motion.div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — horizontal */}
      <section className="py-20 md:py-28 bg-white/[0.02]">
        <div className="mx-auto max-w-[1200px] px-4 md:px-8">
          <RevealSection className="text-center mb-14">
            <h2 className="text-display text-3xl md:text-4xl font-medium">How it works</h2>
            <p className="text-[var(--color-muted)] text-sm mt-3">Three steps to your next hire</p>
          </RevealSection>

          <div className="grid md:grid-cols-3 gap-8 md:gap-6 relative">
            <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {STEPS.map((step, i) => (
              <RevealSection key={step.num} delay={i * 0.1} className="text-center relative">
                <div className="inline-flex h-14 w-14 rounded-full border border-[var(--color-warm)]/30 bg-[var(--color-warm)]/10 items-center justify-center text-sm font-mono text-[var(--color-warm)] mb-5">
                  {step.num}
                </div>
                <h3 className="text-lg font-medium">{step.title}</h3>
                <p className="text-sm text-[var(--color-muted)] mt-2 max-w-[200px] mx-auto">{step.desc}</p>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Community highlight */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-4 md:px-8">
          <RevealSection>
            <div className="glass rounded-3xl p-8 md:p-12 border border-[var(--color-warm)]/15 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div className="max-w-md">
                <p className="text-[12px] uppercase tracking-[0.15em] text-[var(--color-muted)] mb-3">
                  Community & Mentorship
                </p>
                <h2 className="text-display text-2xl md:text-3xl font-medium leading-snug">
                  More than hiring — grow with the community
                </h2>
                <ul className="mt-6 flex flex-wrap gap-4">
                  {COMMUNITY_POINTS.map((item) => (
                    <li
                      key={item.label}
                      className="flex items-center gap-2 text-sm text-[var(--color-muted)]"
                    >
                      <item.icon size={16} className="text-[var(--color-warm)] shrink-0" />
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
              <MagneticButton to="/community" variant="outline" className="shrink-0 self-start md:self-center">
                Explore Community <ArrowUpRight size={16} />
              </MagneticButton>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 md:py-32 border-t border-white/5">
        <div className="mx-auto max-w-[1200px] px-4 md:px-8 text-center">
          <RevealSection>
            <h2 className="text-display text-3xl md:text-[2.75rem] font-medium leading-tight max-w-2xl mx-auto">
              Start building with the right talent today
            </h2>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <MagneticButton to="/dashboard" variant="primary">
                Get Started <ArrowUpRight size={16} />
              </MagneticButton>
              <MagneticButton to="/talent" variant="outline">
                Browse Talent
              </MagneticButton>
            </div>
          </RevealSection>
        </div>
      </section>
    </>
  );
}
