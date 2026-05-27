import { TrendingUp, Award, Sparkles } from "lucide-react";
import { useCommunity } from "../../context/CommunityContext";
import { RevealSection } from "../ui/RevealSection";

const DEFAULT_TAGS = ["#React", "#Career", "#Freelancing", "#Design", "#AI", "#Node"];

export function CommunitySidebar() {
  const { getTrendingTags, getTopMentors } = useCommunity();
  const trending = getTrendingTags();
  const topMentors = getTopMentors();
  const tags = trending.length > 0 ? trending : DEFAULT_TAGS.map((tag) => ({ tag, count: 0 }));

  return (
    <aside className="hidden lg:block space-y-6">
      <RevealSection direction="right">
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-[var(--color-sky)]" />
            <h3 className="font-medium text-sm">Trending tags</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map(({ tag, count }) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-full bg-white/[0.05] text-[var(--color-muted)] hover:text-[var(--color-sky)] transition-colors"
              >
                {tag}
                {count > 0 && <span className="ml-1 opacity-60">{count}</span>}
              </span>
            ))}
          </div>
        </div>
      </RevealSection>

      <RevealSection direction="right" delay={0.05}>
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award size={16} className="text-[var(--color-warm)]" />
            <h3 className="font-medium text-sm">Top mentors</h3>
          </div>
          <div className="space-y-3">
            {topMentors.map((m, i) => (
              <div key={m.id} className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-[var(--color-muted)] w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.name}</p>
                  <p className="text-[11px] text-[var(--color-muted)]">
                    ★ {m.rating} · {m.priceType === "free" ? "Free" : `₹${m.pricePerHour}/hr`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      <RevealSection direction="right" delay={0.1}>
        <div className="glass rounded-xl p-5 border border-[var(--color-sky)]/15">
          <div className="flex items-center gap-2 text-[var(--color-sky)] mb-2">
            <Sparkles size={14} />
            <span className="text-xs font-medium uppercase tracking-wider">Community tip</span>
          </div>
          <p className="text-sm text-[var(--color-muted)] leading-relaxed">
            Engage weekly in challenges and mentorship to boost your profile visibility on SkillSync.
          </p>
        </div>
      </RevealSection>
    </aside>
  );
}
