import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Sparkles, Lock, Unlock } from "lucide-react";
import { useUser } from "../../context/UserContext";
import {
  AI_MATCHING_UNLOCK_PERCENT,
  PROFILE_CHECKLIST_ITEMS,
  PROFILE_SECTION_COUNT,
  PROFILE_SECTION_WEIGHT,
} from "../../utils/profileCompleteness";

interface ProfileCompletenessPanelProps {
  compact?: boolean;
}

export function ProfileCompletenessPanel({ compact = false }: ProfileCompletenessPanelProps) {
  const { completeness } = useUser();
  const navigate = useNavigate();
  const { score, checklist, unlockedAiMatching } = completeness;

  const circumference = 2 * Math.PI * 28;

  const goToSection = (sectionId: string) => {
    navigate(`/settings#${sectionId}`);
  };

  return (
    <div className={`glass rounded-2xl border border-white/5 ${compact ? "p-4" : "p-6"} bg-white/[0.01]`}>
      <div className={`flex items-center gap-5 ${compact ? "pb-4" : "pb-6"} border-b border-white/5`}>
        <div className="relative h-16 w-16 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" aria-hidden>
            <circle cx="32" cy="32" r="28" className="stroke-white/5" strokeWidth="4" fill="transparent" />
            <motion.circle
              cx="32"
              cy="32"
              r="28"
              className="stroke-[var(--color-warm)]"
              strokeWidth="4"
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference - (circumference * score) / 100 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </svg>
          <motion.span
            key={score}
            initial={{ scale: 0.9, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute text-sm font-semibold font-mono"
          >
            {score}%
          </motion.span>
        </div>
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            Profile Completeness
            {score === 100 && <Sparkles size={14} className="text-[var(--color-warm)]" />}
          </h3>
          <p className="text-xs text-[var(--color-muted)] mt-1">
            {score === 100
              ? "Your profile is complete."
              : `${PROFILE_SECTION_COUNT - Object.values(checklist).filter(Boolean).length} steps remaining (${PROFILE_SECTION_WEIGHT}% each)`}
          </p>
        </div>
      </div>

      <div
        className={`mt-4 p-3 rounded-xl border flex items-center gap-2 text-xs ${
          unlockedAiMatching
            ? "border-[var(--color-mint)]/30 bg-[var(--color-mint)]/5 text-[var(--color-mint)]"
            : "border-[var(--color-sky)]/20 bg-[var(--color-sky)]/5 text-[var(--color-muted)]"
        }`}
      >
        {unlockedAiMatching ? (
          <>
            <Unlock size={14} className="shrink-0" />
            <span>AI Matching unlocked — visit Smart Match to find opportunities.</span>
          </>
        ) : (
          <>
            <Lock size={14} className="text-[var(--color-sky)] shrink-0" />
            <span>
              Unlock AI Matching at <strong className="text-[var(--color-sky)]">{AI_MATCHING_UNLOCK_PERCENT}%</strong>{" "}
              completion ({AI_MATCHING_UNLOCK_PERCENT - score}% to go)
            </span>
          </>
        )}
      </div>

      <ul className={`mt-4 space-y-2 ${compact ? "" : "mt-5"}`}>
        {PROFILE_CHECKLIST_ITEMS.map((item) => {
          const done = checklist[item.key];
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => goToSection(item.id)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left text-xs transition-colors ${
                  done
                    ? "text-[var(--color-muted)] hover:bg-white/[0.02]"
                    : "text-white font-medium hover:bg-white/[0.04]"
                }`}
              >
                <CheckCircle
                  size={16}
                  className={done ? "text-[var(--color-mint)] shrink-0" : "text-white/15 shrink-0"}
                />
                <span className={done ? "line-through opacity-70" : ""}>{item.label}</span>
                {!done && (
                  <span className="ml-auto text-[10px] text-[var(--color-warm)]">+{PROFILE_SECTION_WEIGHT}%</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
