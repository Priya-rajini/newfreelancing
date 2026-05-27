import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export type FreelancerSection =
  | "overview"
  | "contracts"
  | "earnings"
  | "reviews"
  | "messages"
  | "settings";

export interface NavItem {
  id: FreelancerSection;
  icon: LucideIcon;
  label: string;
}

interface FreelancerSidebarProps {
  items: NavItem[];
  active: FreelancerSection;
  onSelect: (id: FreelancerSection) => void;
}

export function FreelancerSidebar({ items, active, onSelect }: FreelancerSidebarProps) {
  return (
    <aside className="hidden lg:flex w-[220px] shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]/30 min-h-[calc(100vh-5rem)] p-4">
      <p className="text-[11px] uppercase tracking-wider text-[var(--color-muted)] px-3 mb-4 font-mono">
        Freelancer Space
      </p>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 transition-colors w-full text-left ${
            active === item.id
              ? "bg-white/[0.06] text-[var(--color-text)]"
              : "text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/[0.03]"
          }`}
        >
          <item.icon size={18} />
          {item.label}
        </button>
      ))}

      <div className="mt-auto pt-6 border-t border-white/5">
        <Link
          to="/portfolio"
          className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-[var(--color-muted)] hover:text-white transition-all hover:bg-white/[0.04]"
        >
          <span className="font-semibold">My Portfolio</span>
          <ChevronRight size={14} />
        </Link>
      </div>
    </aside>
  );
}
