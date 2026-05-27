import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Star,
  Filter,
  CheckCircle2,
  Users,
  User,
  MessageSquare,
} from "lucide-react";
import { useCommunity } from "../../context/CommunityContext";
import { useUser } from "../../context/UserContext";
import type { MyMentorSettings, SessionType, MentorPriceType } from "../../types/community";

export function MentorshipMatching() {
  const { user } = useUser();
  const {
    mentors,
    requestMentorship,
    updateMyMentorSettings,
    getMyMentorSettings,
    pendingRequestForMentor,
  } = useCommunity();

  const [skillFilter, setSkillFilter] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isClient =
    user.role === "client" || (user.role === "both" && user.activeRoleView === "client");
  const canBecomeMentor = user.isRegistered;
  const canRequest = user.isRegistered;

  const defaultMentorForm = (): MyMentorSettings => ({
    available: false,
    skills: user.skills.slice(0, 5),
    priceType: "free",
    pricePerHour: 50,
    sessionType: "1:1",
  });

  const [mentorForm, setMentorForm] = useState<MyMentorSettings>(defaultMentorForm);

  useEffect(() => {
    if (!user.email) {
      setMentorForm(defaultMentorForm());
      return;
    }
    const saved = getMyMentorSettings(user.email);
    setMentorForm(saved ?? defaultMentorForm());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when email or saved settings change
  }, [user.email, user.skills]);

  const allSkills = Array.from(new Set(mentors.flatMap((m) => m.skills))).sort();
  const filtered = mentors.filter(
    (m) =>
      !skillFilter ||
      m.skills.some((s) => s.toLowerCase().includes(skillFilter.toLowerCase()))
  );

  const handleRequest = (mentorId: string) => {
    setRequestError(null);
    const err = requestMentorship(mentorId, user.name || "User", user.email);
    if (err) {
      setRequestError(err);
      return;
    }
    setConfirmId(mentorId);
    setTimeout(() => setConfirmId(null), 4000);
  };

  const saveMentorProfile = () => {
    setSaveError(null);
    setSaveSuccess(false);
    if (!canBecomeMentor) {
      setSaveError("Please sign in from the Dashboard to save your mentor profile.");
      return;
    }
    const err = updateMyMentorSettings(user.email, mentorForm, user.name);
    if (err) {
      setSaveError(err);
      return;
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const formatPrice = (m: (typeof mentors)[0]) => {
    if (m.priceType === "free") return "Free";
    return `₹${m.pricePerHour ?? 0} / hr`;
  };

  return (
    <div className="space-y-8">
      {!canBecomeMentor && (
        <p className="text-sm text-center text-[var(--color-muted)] glass rounded-xl p-4 border border-white/5">
          <a href="/dashboard" className="text-[var(--color-warm)] hover:underline">
            Sign in
          </a>{" "}
          to become a mentor and save your profile.
        </p>
      )}

      {canBecomeMentor && (
        <div className="glass rounded-2xl p-5 md:p-6 border border-[var(--color-warm)]/20">
          <h3 className="font-medium flex items-center gap-2">
            <GraduationCap size={18} className="text-[var(--color-warm)]" />
            Become a mentor
          </h3>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            {isClient
              ? "Clients can mentor on hiring, briefs, and working with freelancers. Enable availability, then post on the feed to let others know."
              : "Freelancers and clients can both mentor. Mark yourself available and help others grow."}
          </p>

          <label className="flex items-center gap-3 mt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={mentorForm.available}
              onChange={(e) => setMentorForm((f) => ({ ...f, available: e.target.checked }))}
              className="rounded accent-[var(--color-warm)]"
            />
            <span className="text-sm">Available for mentorship</span>
          </label>

          {mentorForm.available && (
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs text-[var(--color-muted)] uppercase tracking-wider">
                  Skills <span className="text-red-400">*</span>
                </label>
                <input
                  value={mentorForm.skills.join(", ")}
                  onChange={(e) =>
                    setMentorForm((f) => ({
                      ...f,
                      skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    }))
                  }
                  placeholder="React, Node, Career... (required, comma-separated)"
                  className="mt-1 w-full bg-white/[0.04] border border-white/5 rounded-lg px-3 py-2 text-sm outline-none"
                />
                {mentorForm.skills.length === 0 && (
                  <p className="text-xs text-[var(--color-muted)] mt-1">
                    Add at least one skill to save your mentor profile.
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs text-[var(--color-muted)] uppercase tracking-wider">Price</label>
                <select
                  value={mentorForm.priceType}
                  onChange={(e) =>
                    setMentorForm((f) => ({
                      ...f,
                      priceType: e.target.value as MentorPriceType,
                    }))
                  }
                  className="mt-1 w-full bg-white/[0.04] border border-white/5 rounded-lg px-3 py-2 text-sm outline-none"
                >
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              {mentorForm.priceType === "paid" && (
                <div>
                  <label className="text-xs text-[var(--color-muted)] uppercase tracking-wider">₹ per hour</label>
                  <input
                    type="number"
                    min={0}
                    value={mentorForm.pricePerHour}
                    onChange={(e) =>
                      setMentorForm((f) => ({ ...f, pricePerHour: Number(e.target.value) }))
                    }
                    className="mt-1 w-full bg-white/[0.04] border border-white/5 rounded-lg px-3 py-2 text-sm outline-none"
                  />
                </div>
              )}
              <div>
                <label className="text-xs text-[var(--color-muted)] uppercase tracking-wider">Session type</label>
                <select
                  value={mentorForm.sessionType}
                  onChange={(e) =>
                    setMentorForm((f) => ({
                      ...f,
                      sessionType: e.target.value as SessionType,
                    }))
                  }
                  className="mt-1 w-full bg-white/[0.04] border border-white/5 rounded-lg px-3 py-2 text-sm outline-none"
                >
                  <option value="1:1">1:1</option>
                  <option value="group">Group</option>
                </select>
              </div>
            </div>
          )}

          {saveError && <p className="mt-3 text-sm text-red-400">{saveError}</p>}
          {saveSuccess && (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-[var(--color-mint)]">
              <CheckCircle2 size={14} />
              Mentor profile saved successfully.
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={saveMentorProfile}
              className="px-5 py-2 rounded-full border border-[var(--color-border-strong)] text-sm hover:border-[var(--color-warm)]/40 bg-[var(--color-warm)]/10 hover:bg-[var(--color-warm)]/20"
            >
              Save mentor profile
            </button>
            {mentorForm.available && (
              <Link
                to="/community?tab=feed"
                className="inline-flex items-center gap-2 text-sm text-[var(--color-warm)] hover:underline"
              >
                <MessageSquare size={14} />
                Post on feed to announce availability
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Filter size={16} className="text-[var(--color-muted)]" />
        <select
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
          className="bg-white/[0.04] border border-white/5 rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="">All skills</option>
          {allSkills.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {requestError && (
        <p className="text-sm text-red-400 px-1">{requestError}</p>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((mentor) => {
          const pending = user.email ? pendingRequestForMentor(mentor.id, user.email) : false;
          const confirmed = confirmId === mentor.id;

          return (
            <motion.div
              key={mentor.id}
              layout
              className="glass rounded-2xl p-5 md:p-6 hover:border-[var(--color-border-strong)] transition-colors"
            >
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-xl bg-[var(--color-warm)]/15 flex items-center justify-center shrink-0">
                  <GraduationCap size={22} className="text-[var(--color-warm)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">{mentor.name}</h3>
                  <div className="flex items-center gap-1 mt-1 text-sm text-[var(--color-warm)]">
                    <Star size={12} className="fill-current" />
                    {mentor.rating.toFixed(1)}
                    <span className="text-[var(--color-muted)] text-xs ml-1">
                      · {mentor.sessionsCompleted} sessions
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {mentor.skills.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-[var(--color-muted)]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-[var(--color-muted)]">
                    <span className="text-[var(--color-mint)] font-medium">{formatPrice(mentor)}</span>
                    <span className="flex items-center gap-1">
                      {mentor.sessionType === "1:1" ? <User size={12} /> : <Users size={12} />}
                      {mentor.sessionType}
                    </span>
                  </div>
                  {canRequest && mentor.userEmail !== user.email && (
                    <button
                      onClick={() => handleRequest(mentor.id)}
                      disabled={pending}
                      className="mt-4 w-full sm:w-auto px-5 py-2 rounded-full bg-[var(--color-warm)] text-[#0a0a0b] text-sm font-medium disabled:opacity-50"
                    >
                      {pending ? "Request sent" : "Request session"}
                    </button>
                  )}
                  <AnimatePresence>
                    {confirmed && (
                      <motion.p
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-2 flex items-center gap-1 text-sm text-[var(--color-mint)]"
                      >
                        <CheckCircle2 size={14} />
                        Mentorship request confirmed!
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-[var(--color-muted)] py-8">No mentors match this filter.</p>
      )}

      {!canRequest && (
        <p className="text-sm text-center text-[var(--color-muted)]">
          <a href="/dashboard" className="text-[var(--color-warm)] hover:underline">Sign in</a> to request mentorship sessions.
        </p>
      )}
    </div>
  );
}
