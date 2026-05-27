import { useState } from "react";
import { Plus, Send } from "lucide-react";
import type { ChallengeDifficulty } from "../../types/community";

interface ChallengeComposerProps {
  onPost: (
    title: string,
    description: string,
    difficulty: ChallengeDifficulty,
    deadlineIso: string
  ) => string | null;
}

function defaultDeadlineIso() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

export function ChallengeComposer({ onPost }: ChallengeComposerProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<ChallengeDifficulty>("Medium");
  const [deadline, setDeadline] = useState(defaultDeadlineIso);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDifficulty("Medium");
    setDeadline(defaultDeadlineIso());
    setError(null);
  };

  const handleSubmit = () => {
    setError(null);
    setSuccess(false);
    const err = onPost(title, description, difficulty, deadline);
    if (err) {
      setError(err);
      return;
    }
    resetForm();
    setSuccess(true);
    setOpen(false);
    setTimeout(() => setSuccess(false), 4000);
  };

  if (!open) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-warm)] text-[#0a0a0b] text-sm font-medium"
        >
          <Plus size={16} />
          Post a challenge
        </button>
        {success && (
          <span className="text-sm text-[var(--color-mint)]">Challenge posted successfully.</span>
        )}
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-5 md:p-6 border border-[var(--color-warm)]/20">
      <h3 className="font-medium flex items-center gap-2">
        <Plus size={18} className="text-[var(--color-warm)]" />
        Create a skill challenge
      </h3>
      <p className="text-sm text-[var(--color-muted)] mt-1">
        Set a brief, difficulty, and deadline for the community to compete on.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <label className="text-xs text-[var(--color-muted)] uppercase tracking-wider">Title</label>
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. Build a responsive pricing table"
            className="mt-1 w-full bg-white/[0.04] border border-white/5 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-warm)]/30"
          />
        </div>

        <div>
          <label className="text-xs text-[var(--color-muted)] uppercase tracking-wider">Description</label>
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Describe what participants should build or deliver, and how submissions will be judged..."
            rows={4}
            className="mt-1 w-full bg-white/[0.04] border border-white/5 rounded-lg px-3 py-2 text-sm outline-none resize-none focus:border-[var(--color-warm)]/30"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[var(--color-muted)] uppercase tracking-wider">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as ChallengeDifficulty)}
              className="mt-1 w-full bg-white/[0.04] border border-white/5 rounded-lg px-3 py-2 text-sm outline-none"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--color-muted)] uppercase tracking-wider">Deadline</label>
            <input
              type="date"
              value={deadline}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDeadline(e.target.value)}
              className="mt-1 w-full bg-white/[0.04] border border-white/5 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--color-warm)]/30"
            />
          </div>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          className="flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--color-warm)] text-[#0a0a0b] text-sm font-medium"
        >
          <Send size={14} />
          Post challenge
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="px-5 py-2 rounded-full border border-[var(--color-border-strong)] text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
