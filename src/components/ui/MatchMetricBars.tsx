import { motion } from "framer-motion";
import type { ProposalMetrics } from "../../utils/matching";

const metricLabels: { key: keyof ProposalMetrics; label: string }[] = [
  { key: "skillsOverlap", label: "Skills overlap" },
  { key: "experienceFit", label: "Experience fit" },
  { key: "profileStrength", label: "Profile strength" },
  { key: "overall", label: "Overall match" },
];

interface MatchMetricBarsProps {
  metrics: ProposalMetrics;
  headlineScore?: number;
}

export function MatchMetricBars({ metrics, headlineScore }: MatchMetricBarsProps) {
  const score = headlineScore ?? metrics.overall;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-medium text-white">Match metrics</h2>
          <p className="text-[10px] text-[var(--color-mint)] mt-1 font-mono uppercase tracking-wide">
            Live · updates with project & profile data
          </p>
        </div>
        <span className="text-2xl font-bold text-[var(--color-warm)]">{score}%</span>
      </div>
      <div className="space-y-5">
        {metricLabels.map((item, i) => {
          const value = metrics[item.key];
          return (
            <div key={item.key}>
              <div className="flex justify-between text-sm mb-2">
                <span>{item.label}</span>
                <span className="text-[var(--color-muted)]">{value}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  key={`${item.key}-${value}`}
                  className="h-full rounded-full bg-gradient-to-r from-[var(--color-warm)] to-[var(--color-mint)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.45, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
