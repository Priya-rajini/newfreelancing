import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { Bell, Lock, CreditCard, User } from "lucide-react";

export function SettingsPanel() {
  const { user } = useUser();

  const rows = [
    { icon: User, label: "Profile", desc: "Bio, skills, portfolio", to: "/profile/me" },
    { icon: Bell, label: "Notifications", desc: "Email and in-app alerts", to: "#" },
    { icon: Lock, label: "Security", desc: "Password and 2FA", to: "#" },
    { icon: CreditCard, label: "Payout methods", desc: "Bank, PayPal, Wise", to: "#" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-wider text-[var(--color-muted)] font-mono">Settings</p>
        <p className="text-sm text-[var(--color-muted)] mt-1">Account preferences for {user.name}.</p>
      </div>
      <div className="space-y-2">
        {rows.map((row) => (
          <Link
            key={row.label}
            to={row.to}
            className="flex items-center gap-4 p-4 rounded-xl glass hover:border-[var(--color-border-strong)] transition-colors"
          >
            <row.icon size={18} className="text-[var(--color-muted)]" />
            <div className="flex-1">
              <p className="font-medium text-sm">{row.label}</p>
              <p className="text-xs text-[var(--color-muted)]">{row.desc}</p>
            </div>
          </Link>
        ))}
      </div>
      <p className="text-[11px] text-[var(--color-muted)]">Rate: {user.hourlyRate} · {user.location}</p>
    </div>
  );
}
