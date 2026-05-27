import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Check, Sparkles, Code2, Brain, Loader2 } from "lucide-react";
import { RevealSection } from "../../components/ui/RevealSection";
import { skillTests } from "../../data/skillTests";
import { useUser } from "../../context/UserContext";

type Phase = "select" | "mcq" | "practical" | "grading" | "done" | "failed";

export function SkillVerification() {
  const { user, addVerifiedBadge } = useUser();
  const [skillId, setSkillId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("select");
  const [mcqIndex, setMcqIndex] = useState(0);
  const [mcqScore, setMcqScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [practicalAnswer, setPracticalAnswer] = useState("");
  const [gradingNote, setGradingNote] = useState("");

  const test = skillTests.find((t) => t.id === skillId);
  const currentMcq = test?.mcq[mcqIndex];

  const startTest = (id: string) => {
    if (user.verified.includes(skillTests.find((t) => t.id === id)!.badgeName)) return;
    setSkillId(id);
    setPhase("mcq");
    setMcqIndex(0);
    setMcqScore(0);
    setSelected(null);
    setPracticalAnswer("");
  };

  const submitMcq = () => {
    if (!test || selected === null || !currentMcq) return;
    const correct = selected === currentMcq.correct;
    const nextScore = correct ? mcqScore + 1 : mcqScore;

    if (mcqIndex < test.mcq.length - 1) {
      setMcqScore(nextScore);
      setMcqIndex((i) => i + 1);
      setSelected(null);
      return;
    }

    setMcqScore(nextScore);
    if (nextScore < test.passThreshold) {
      setPhase("failed");
      return;
    }
    setPhase("practical");
    setSelected(null);
  };

  const submitPractical = () => {
    if (!test) return;
    if (practicalAnswer.trim().length < test.practical.minLength) return;
    setPhase("grading");
    setGradingNote("");

    const lower = practicalAnswer.toLowerCase();
    const hits = test.practical.keywords.filter((k) => lower.includes(k)).length;
    const passedPractical = hits >= Math.min(2, test.practical.keywords.length);

    setTimeout(() => {
      if (passedPractical) {
        addVerifiedBadge(test.badgeName);
        setGradingNote(
          `Strong practical response — identified ${hits} key concepts. Badge issued.`
        );
        setPhase("done");
      } else {
        setGradingNote(
          "Your answer needs more technical depth. Include hooks, cleanup, or architecture details and try again."
        );
        setPhase("failed");
      }
    }, 2800);
  };

  const reset = () => {
    setPhase("select");
    setSkillId(null);
    setMcqIndex(0);
    setMcqScore(0);
    setSelected(null);
    setPracticalAnswer("");
  };

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="mx-auto max-w-[720px] px-4 md:px-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] mb-8"
        >
          <ArrowLeft size={16} /> Workspace
        </Link>

        <RevealSection>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-[var(--color-mint)]/10 flex items-center justify-center">
              <Shield className="text-[var(--color-mint)]" size={24} />
            </div>
            <div>
              <h1 className="text-display text-3xl font-medium">Skill Verification</h1>
              <p className="text-[var(--color-muted)] text-sm">
                Skill badges are verified through a short AI-generated skill test (MCQ + practical question) — "Verified React Developer".
              </p>
            </div>
          </div>
        </RevealSection>

        <AnimatePresence mode="wait">
          {phase === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-10 space-y-3"
            >
              <p className="text-sm text-[var(--color-muted)] mb-4">
                Choose a skill. Pass 2 MCQs and one practical question to unlock your badge on your profile.
              </p>
              {skillTests.map((t) => {
                const earned = user.verified.includes(t.badgeName);
                return (
                  <button
                    key={t.id}
                    onClick={() => !earned && startTest(t.id)}
                    disabled={earned}
                    className={`w-full text-left glass rounded-xl p-5 flex items-center gap-4 transition-all ${
                      earned
                        ? "opacity-70 border-[var(--color-mint)]/30"
                        : "hover:border-[var(--color-warm)]/30 hover:-translate-y-0.5"
                    }`}
                  >
                    <Code2 size={22} className="text-[var(--color-warm)] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{t.skill}</p>
                      <p className="text-sm text-[var(--color-muted)] truncate">{t.description}</p>
                      <p className="text-[11px] text-[var(--color-muted)] mt-1 font-mono">{t.badgeName}</p>
                    </div>
                    {earned ? (
                      <span className="text-[11px] text-[var(--color-mint)] flex items-center gap-1 shrink-0">
                        <Check size={12} /> Earned
                      </span>
                    ) : (
                      <span className="text-[11px] text-[var(--color-warm)] shrink-0">Start test →</span>
                    )}
                  </button>
                );
              })}
            </motion.div>
          )}

          {phase === "mcq" && test && currentMcq && (
            <motion.div key={`mcq-${mcqIndex}`} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="mt-10">
              <div className="flex gap-2 mb-6">
                {test.mcq.map((_, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full ${i <= mcqIndex ? "bg-[var(--color-mint)]" : "bg-white/10"}`} />
                ))}
                <div className="h-1 flex-1 rounded-full bg-white/10" title="Practical" />
              </div>
              <p className="text-[11px] uppercase tracking-wider text-[var(--color-muted)] flex items-center gap-1">
                <Brain size={12} /> AI MCQ · {test.skill} · {mcqIndex + 1}/{test.mcq.length}
              </p>
              <h2 className="text-xl font-medium mt-3 leading-relaxed">{currentMcq.q}</h2>
              <div className="mt-8 space-y-3">
                {currentMcq.options.map((opt, i) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSelected(i)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selected === i
                        ? "border-[var(--color-mint)] bg-[var(--color-mint)]/10"
                        : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={submitMcq}
                disabled={selected === null}
                className="mt-8 w-full py-3 rounded-xl bg-[var(--color-warm)] text-[#0a0a0b] font-medium disabled:opacity-40"
              >
                {mcqIndex < test.mcq.length - 1 ? "Next question" : "Continue to practical"}
              </button>
            </motion.div>
          )}

          {phase === "practical" && test && (
            <motion.div key="practical" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="mt-10">
              <p className="text-[11px] uppercase tracking-wider text-[var(--color-muted)] flex items-center gap-1">
                <Sparkles size={12} /> AI practical question · {test.skill}
              </p>
              <h2 className="text-lg font-medium mt-4 leading-relaxed">{test.practical.prompt}</h2>
              <p className="text-sm text-[var(--color-muted)] mt-2">{test.practical.hint}</p>
              <textarea
                value={practicalAnswer}
                onChange={(e) => setPracticalAnswer(e.target.value)}
                rows={8}
                className="mt-6 w-full bg-white/5 border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm leading-relaxed focus:outline-none focus:border-[var(--color-warm)]/40 resize-none"
                placeholder="Type your answer here..."
              />
              <p className="text-[10px] text-[var(--color-muted)] mt-1">
                {practicalAnswer.length} / {test.practical.minLength} min characters
              </p>
              <button
                type="button"
                onClick={submitPractical}
                disabled={practicalAnswer.trim().length < test.practical.minLength}
                className="mt-6 w-full py-3 rounded-xl bg-[var(--color-warm)] text-[#0a0a0b] font-medium disabled:opacity-40"
              >
                Submit for AI review
              </button>
            </motion.div>
          )}

          {phase === "grading" && (
            <motion.div key="grading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-16 text-center glass rounded-2xl p-12">
              <Loader2 size={36} className="mx-auto text-[var(--color-warm)] animate-spin" />
              <p className="mt-4 font-medium">SkillSync AI is reviewing your answer…</p>
              <p className="text-sm text-[var(--color-muted)] mt-2">Checking technical depth and keyword coverage</p>
            </motion.div>
          )}

          {phase === "done" && test && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="mt-10 glass rounded-2xl p-10 text-center border border-[var(--color-mint)]/25">
              <div className="h-16 w-16 rounded-full bg-[var(--color-mint)]/20 flex items-center justify-center mx-auto">
                <Check size={32} className="text-[var(--color-mint)]" />
              </div>
              <h2 className="text-display text-2xl font-medium mt-6">You're verified</h2>
              <p className="text-[var(--color-muted)] mt-2 text-sm max-w-md mx-auto">{gradingNote}</p>
              <span className="inline-flex items-center gap-2 mt-6 text-sm px-5 py-2.5 rounded-full bg-[var(--color-warm)]/15 text-[var(--color-warm)] border border-[var(--color-warm)]/30 font-medium">
                <Shield size={16} /> {test.badgeName}
              </span>
              <div className="flex flex-wrap gap-3 justify-center mt-8">
                <Link to="/profile/me" className="text-sm px-4 py-2 rounded-full border border-[var(--color-border-strong)] hover:border-[var(--color-warm)]/30">
                  View profile
                </Link>
                <button type="button" onClick={reset} className="text-sm px-4 py-2 rounded-full bg-white/5">
                  Verify another skill
                </button>
              </div>
            </motion.div>
          )}

          {phase === "failed" && (
            <motion.div key="failed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10 glass rounded-2xl p-8 text-center border border-red-500/20">
              <h2 className="text-xl font-medium">Not quite yet</h2>
              <p className="text-sm text-[var(--color-muted)] mt-2 max-w-md mx-auto">
                {gradingNote || `You need ${test?.passThreshold ?? 2}/${test?.mcq.length ?? 2} correct on the MCQ section. Review the material and try again.`}
              </p>
              <button type="button" onClick={reset} className="mt-6 px-6 py-2.5 rounded-full bg-[var(--color-warm)] text-[#0a0a0b] text-sm font-medium">
                Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {user.verified.filter((v) => v.startsWith("Verified ")).length > 0 && phase === "select" && (
          <div className="mt-12 pt-8 border-t border-[var(--color-border)]">
            <p className="text-[11px] uppercase tracking-wider text-[var(--color-muted)] mb-3">Your skill badges</p>
            <div className="flex flex-wrap gap-2">
              {user.verified
                .filter((v) => v.startsWith("Verified "))
                .map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full bg-[var(--color-warm)]/10 text-[var(--color-warm)] border border-[var(--color-warm)]/25"
                  >
                    <Shield size={12} /> {badge}
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
