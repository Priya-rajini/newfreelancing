import { motion } from "framer-motion";
import { freelancers } from "../../data/mockData";
import { RevealSection } from "../../components/ui/RevealSection";
import { Link } from "react-router-dom";
import { ArrowLeft, Lock, Sparkles } from "lucide-react";
import { useUser } from "../../context/UserContext";
import { AI_MATCHING_UNLOCK_PERCENT } from "../../utils/profileCompleteness";

const dimensions = [
  { label: "Skills overlap", value: 96, color: "var(--color-warm)" },
  { label: "Portfolio fit", value: 91, color: "var(--color-mint)" },
  { label: "Availability", value: 88, color: "var(--color-sky)" },
  { label: "Rate alignment", value: 85, color: "#f472b6" },
  { label: "Communication style", value: 92, color: "var(--color-warm)" },
];

export function SmartMatch() {
  const { completeness } = useUser();
  const match = freelancers[0];
  const overall = 94;
  const unlocked = completeness.unlockedAiMatching;

  if (!unlocked) {
    return (
      <div className="pt-28 pb-24 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center glass rounded-2xl p-8 border border-[var(--color-sky)]/20">
          <Lock size={32} className="mx-auto text-[var(--color-sky)] mb-4" />
          <h1 className="text-display text-2xl font-medium">AI Matching Locked</h1>
          <p className="text-sm text-[var(--color-muted)] mt-3">
            Unlock Smart Match at {AI_MATCHING_UNLOCK_PERCENT}% profile completion. You&apos;re currently at{" "}
            {completeness.score}%.
          </p>
          <Link
            to="/settings"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full bg-[var(--color-warm)] text-[#0a0a0b] text-sm font-medium"
          >
            <Sparkles size={16} />
            Complete your profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="mx-auto max-w-[1000px] px-4 md:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] mb-8">
          <ArrowLeft size={16} /> Back
        </Link>

        <RevealSection>
          <h1 className="text-display text-4xl font-medium">Smart Match</h1>
          <p className="text-[var(--color-muted)] mt-2">AI compatibility visualization for your project.</p>
        </RevealSection>

        <div className="mt-16 grid md:grid-cols-2 gap-12 items-center">
          <RevealSection>
            <div className="relative aspect-square max-w-[360px] mx-auto">
              <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                <motion.circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="none"
                  stroke="url(#matchGrad)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={534}
                  initial={{ strokeDashoffset: 534 }}
                  animate={{ strokeDashoffset: 534 - (534 * overall) / 100 }}
                  transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                />
                <defs>
                  <linearGradient id="matchGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--color-warm)" />
                    <stop offset="100%" stopColor="var(--color-mint)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  className="text-5xl font-bold text-display"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {overall}%
                </motion.span>
                <span className="text-sm text-[var(--color-muted)] mt-1">compatibility</span>
              </div>
            </div>
            <Link to={`/profile/${match.id}`} className="block mt-8 glass rounded-xl p-4 text-center hover:border-[var(--color-warm)]/30 transition-colors">
              <p className="font-medium">{match.name}</p>
              <p className="text-sm text-[var(--color-muted)]">{match.role}</p>
            </Link>
          </RevealSection>

          <RevealSection direction="right" delay={0.2}>
            <div className="space-y-6">
              {dimensions.map((d, i) => (
                <div key={d.label}>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{d.label}</span>
                    <span className="text-[var(--color-muted)]">{d.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: d.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${d.value}%` }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm text-[var(--color-muted)] leading-relaxed">
              Maya's portfolio shows 4 fintech projects with similar complexity. Her design system experience aligns with your component library requirements.
            </p>
          </RevealSection>
        </div>
      </div>
    </div>
  );
}
