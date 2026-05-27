import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare, Trophy, GraduationCap } from "lucide-react";
import { RevealSection } from "../components/ui/RevealSection";
import { PublicFeed } from "../components/community/PublicFeed";
import { SkillChallenges } from "../components/community/SkillChallenges";
import { MentorshipMatching } from "../components/community/MentorshipMatching";
import { CommunitySidebar } from "../components/community/CommunitySidebar";
import type { CommunityTab } from "../types/community";

const TABS: { id: CommunityTab; label: string; icon: typeof MessageSquare }[] = [
  { id: "feed", label: "Feed", icon: MessageSquare },
  { id: "challenges", label: "Challenges", icon: Trophy },
  { id: "mentorship", label: "Mentorship", icon: GraduationCap },
];

export function Community() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") as CommunityTab | null;
  const activeTab: CommunityTab =
    tabParam && TABS.some((t) => t.id === tabParam) ? tabParam : "feed";

  const setTab = (tab: CommunityTab) => {
    setSearchParams(tab === "feed" ? {} : { tab });
  };

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <RevealSection>
              <p className="text-[13px] uppercase tracking-[0.15em] text-[var(--color-muted)]">
                Community & Mentorship
              </p>
              <h1 className="text-display text-3xl md:text-4xl font-medium mt-2">
                Learn, compete, and grow together
              </h1>
              <p className="text-[var(--color-muted)] mt-2 max-w-xl">
                Share wins, take on weekly challenges, and connect with mentors — beyond hiring alone.
              </p>
            </RevealSection>

            <RevealSection delay={0.05} className="mt-8">
              <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/5 w-fit flex-wrap">
                {TABS.map(({ id, label, icon: Icon }) => {
                  const active = activeTab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setTab(id)}
                      className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                        active ? "text-[var(--color-text)]" : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
                      }`}
                    >
                      {active && (
                        <motion.div
                          layoutId="community-tab"
                          className="absolute inset-0 bg-white/[0.08] rounded-lg"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                        />
                      )}
                      <span className="relative flex items-center gap-2">
                        <Icon size={16} />
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </RevealSection>

            <div className="mt-8">
              {activeTab === "feed" && <PublicFeed />}
              {activeTab === "challenges" && <SkillChallenges />}
              {activeTab === "mentorship" && <MentorshipMatching />}
            </div>
          </div>

          <CommunitySidebar />
        </div>
      </div>
    </div>
  );
}
