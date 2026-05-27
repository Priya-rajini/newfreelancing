import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, User, Sparkles } from "lucide-react";
import { useUser } from "../context/UserContext";
import { useToast } from "../context/ToastContext";
import { RoleSelectionCards } from "../components/user/RoleSelectionCards";
import { IdentityVerificationSection } from "../components/user/IdentityVerificationSection";
import { ProfileCompletenessPanel } from "../components/user/ProfileCompletenessPanel";
import { AI_MATCHING_UNLOCK_PERCENT } from "../utils/profileCompleteness";

export function Settings() {
  const { user, completeness, setActiveRoleView, updateBio, addSkill, removeSkill } = useUser();
  const { showToast } = useToast();
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash]);

  if (!user.isRegistered) {
    return (
      <div className="pt-28 pb-24 min-h-screen flex items-center justify-center px-4">
        <p className="text-[var(--color-muted)] text-center">
          <Link to="/dashboard" className="text-[var(--color-warm)] hover:underline">
            Sign in
          </Link>{" "}
          to manage your profile and settings.
        </p>
      </div>
    );
  }

  const showDualViewToggle = user.role === "both";

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="mx-auto max-w-[900px] px-4 md:px-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] mb-8"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-10">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[var(--color-muted)] font-mono">
              Account & Profile
            </p>
            <h1 className="text-display text-3xl font-medium mt-1">Profile Settings</h1>
            <p className="text-sm text-[var(--color-muted)] mt-2">
              Complete your profile to unlock AI matching and build trust on the marketplace.
            </p>
          </div>
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0"
            style={{ backgroundColor: `${user.color}22`, color: user.color }}
          >
            {user.avatar || <User size={22} />}
          </div>
        </div>

        {!completeness.unlockedAiMatching && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-xl border border-[var(--color-sky)]/25 bg-[var(--color-sky)]/5 flex items-start gap-3"
          >
            <Sparkles size={18} className="text-[var(--color-sky)] shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--color-muted)]">
              <span className="text-[var(--color-sky)] font-medium">
                Unlock AI Matching at {AI_MATCHING_UNLOCK_PERCENT}% profile completion
              </span>
              {" — "}
              You&apos;re at {completeness.score}%. Finish the checklist below to access Smart Match and better
              proposal rankings.
            </p>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-8">
            <section id="role" className="glass rounded-2xl p-5 md:p-6 border border-white/5 scroll-mt-28">
              <h2 className="font-medium text-lg mb-1">Account role</h2>
              <p className="text-sm text-[var(--color-muted)] mb-5">
                Single account — choose how you use SkillSync. Select &quot;Both&quot; to switch freelancer and client
                dashboards.
              </p>
              <RoleSelectionCards
                onRoleSelected={() => showToast("Role updated", "success")}
              />
              {showDualViewToggle && (
                <div className="mt-6 pt-6 border-t border-white/5">
                  <p className="text-xs text-[var(--color-muted)] mb-3">Active dashboard view</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveRoleView("freelancer");
                        showToast("Switched to Freelancer dashboard", "info");
                      }}
                      className={`px-4 py-2 rounded-lg text-xs font-medium border transition-colors ${
                        user.activeRoleView === "freelancer"
                          ? "border-[var(--color-warm)] text-[var(--color-warm)]"
                          : "border-white/5 text-[var(--color-muted)]"
                      }`}
                    >
                      Freelancer Dashboard
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveRoleView("client");
                        showToast("Switched to Client dashboard", "info");
                      }}
                      className={`px-4 py-2 rounded-lg text-xs font-medium border transition-colors ${
                        user.activeRoleView === "client"
                          ? "border-[var(--color-mint)] text-[var(--color-mint)]"
                          : "border-white/5 text-[var(--color-muted)]"
                      }`}
                    >
                      Client Dashboard
                    </button>
                  </div>
                </div>
              )}
            </section>

            <IdentityVerificationSection />

            <section id="bio" className="glass rounded-2xl p-5 md:p-6 border border-white/5 scroll-mt-28">
              <h2 className="font-medium text-lg mb-1">Bio</h2>
              <p className="text-sm text-[var(--color-muted)] mb-4">Tell the community about yourself or your company.</p>
              <textarea
                defaultValue={user.bio}
                key={user.bio}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v !== user.bio) {
                    updateBio(v);
                    showToast("Profile updated", "success");
                  }
                }}
                rows={4}
                placeholder="Your experience, focus areas, and what you're looking for..."
                className="w-full bg-white/[0.04] border border-white/5 rounded-xl px-4 py-3 text-sm outline-none resize-none focus:border-[var(--color-warm)]/30"
              />
            </section>

            <section id="skills" className="glass rounded-2xl p-5 md:p-6 border border-white/5 scroll-mt-28">
              <h2 className="font-medium text-lg mb-1">Skills</h2>
              <p className="text-sm text-[var(--color-muted)] mb-4">Add skills that describe your expertise.</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {user.skills.map((sk) => (
                  <span
                    key={sk}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-white/5 border border-white/5"
                  >
                    {sk}
                    <button
                      type="button"
                      onClick={() => {
                        removeSkill(sk);
                        showToast("Profile updated", "success");
                      }}
                      className="text-[var(--color-muted)] hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = (e.currentTarget.elements.namedItem("skill") as HTMLInputElement).value.trim();
                  if (input) {
                    addSkill(input);
                    (e.currentTarget.elements.namedItem("skill") as HTMLInputElement).value = "";
                    showToast("Profile updated", "success");
                  }
                }}
                className="flex gap-2"
              >
                <input
                  name="skill"
                  placeholder="e.g. React, Figma, Product Strategy"
                  className="flex-1 bg-white/[0.04] border border-white/5 rounded-lg px-3 py-2 text-sm outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[var(--color-warm)]/20 text-[var(--color-warm)] text-sm font-medium"
                >
                  Add
                </button>
              </form>
            </section>
          </div>

          <aside className="lg:sticky lg:top-28 h-fit">
            <ProfileCompletenessPanel />
          </aside>
        </div>
      </div>
    </div>
  );
}
