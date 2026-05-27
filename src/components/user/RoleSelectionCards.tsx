import { motion } from "framer-motion";
import { Briefcase, Users, Globe, Check } from "lucide-react";
import { useUser, type UserRole } from "../../context/UserContext";

const ROLES: {
  id: UserRole;
  title: string;
  description: string;
  icon: typeof Briefcase;
  accent: string;
}[] = [
  {
    id: "freelancer",
    title: "Freelancer",
    description: "Offer services, build your portfolio, and apply to client projects.",
    icon: Briefcase,
    accent: "var(--color-warm)",
  },
  {
    id: "client",
    title: "Client",
    description: "Post projects, review proposals, and hire verified talent.",
    icon: Users,
    accent: "var(--color-mint)",
  },
  {
    id: "both",
    title: "Both",
    description: "Freelance and hire under one account. Switch dashboard views anytime.",
    icon: Globe,
    accent: "var(--color-sky)",
  },
];

interface RoleSelectionCardsProps {
  onRoleSelected?: (role: UserRole) => void;
  compact?: boolean;
}

export function RoleSelectionCards({ onRoleSelected, compact = false }: RoleSelectionCardsProps) {
  const { user, setRole } = useUser();

  const handleSelect = (role: UserRole) => {
    if (!role) return;
    setRole(role);
    onRoleSelected?.(role);
  };

  return (
    <div className={`grid gap-4 ${compact ? "sm:grid-cols-3" : "md:grid-cols-3"}`}>
      {ROLES.map((r, i) => {
        const selected = user.role === r.id;
        const Icon = r.icon;
        return (
          <motion.button
            key={r.id}
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            onClick={() => handleSelect(r.id)}
            className={`text-left p-5 rounded-2xl border transition-all relative overflow-hidden ${
              selected
                ? "border-[var(--color-warm)]/50 bg-[var(--color-warm)]/8"
                : "border-white/5 bg-white/[0.02] hover:border-white/15"
            }`}
          >
            {selected && (
              <span className="absolute top-3 right-3 h-6 w-6 rounded-full bg-[var(--color-mint)]/20 flex items-center justify-center">
                <Check size={14} className="text-[var(--color-mint)]" />
              </span>
            )}
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center mb-4 border border-white/10"
              style={{
                backgroundColor: `${r.accent === "var(--color-warm)" ? "#e8a87c" : r.accent === "var(--color-mint)" ? "#6ee7b7" : "#7dd3fc"}22`,
                color: r.accent,
              }}
            >
              <Icon size={20} />
            </div>
            <h3 className="font-semibold text-sm capitalize">{r.title}</h3>
            <p className="text-xs text-[var(--color-muted)] mt-2 leading-relaxed">{r.description}</p>
          </motion.button>
        );
      })}
    </div>
  );
}
