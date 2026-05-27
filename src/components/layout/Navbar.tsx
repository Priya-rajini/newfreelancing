import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, ShieldCheck, LogOut, Plus } from "lucide-react";
import { useState } from "react";
import { MagneticButton } from "../ui/MagneticButton";
import { useUser } from "../../context/UserContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/talent", label: "Talent" },
  { to: "/projects", label: "Projects" },
  { to: "/community", label: "Community" },
  { to: "/mentorship", label: "Mentorship" },
  { to: "/dashboard", label: "Dashboard" },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { user, setActiveRoleView, logout } = useUser();

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/dashboard?auth=login");
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 md:px-8">
        <nav className="glass-strong mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-3 md:px-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative h-8 w-8 rounded-lg bg-[var(--color-elevated)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-warm)]/20 to-[var(--color-mint)]/10" />
              <span className="relative text-xs font-bold text-[var(--color-warm)]">S</span>
            </div>
            <span className="text-sm font-semibold tracking-tight">
              SkillSync<span className="text-[var(--color-muted)] font-normal"> AI</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {links.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-3.5 py-1.5 text-[13px] rounded-lg transition-colors ${
                    active ? "text-[var(--color-text)]" : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white/[0.06] rounded-lg"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <MagneticButton to="/talent" variant="ghost" className="!px-4 !py-2 text-[13px]">
              Browse
            </MagneticButton>
            
            {user.isRegistered ? (
              <div className="flex items-center gap-3 pl-3 border-l border-white/10">
                <Link
                  to="/post-project"
                  className="px-3 py-1.5 rounded-lg text-black hover:opacity-95 font-semibold text-[11px] transition-all flex items-center gap-1 shadow-sm shrink-0 mr-1"
                  style={{ backgroundColor: user.color }}
                >
                  <Plus size={11} /> Post Job
                </Link>
                {user.role === "both" && (
                  <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/5">
                    <button
                      onClick={() => setActiveRoleView("freelancer")}
                      className={`px-2 py-1 text-[10px] rounded font-semibold transition-all ${
                        user.activeRoleView === "freelancer"
                          ? "bg-[var(--color-warm)] text-black"
                          : "text-[var(--color-muted)] hover:text-white"
                      }`}
                    >
                      Freelancer
                    </button>
                    <button
                      onClick={() => setActiveRoleView("client")}
                      className={`px-2 py-1 text-[10px] rounded font-semibold transition-all ${
                        user.activeRoleView === "client"
                          ? "bg-[var(--color-warm)] text-black"
                          : "text-[var(--color-muted)] hover:text-white"
                      }`}
                    >
                      Client
                    </button>
                  </div>
                )}
                
                <Link
                  to={`/profile/me`}
                  className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5"
                >
                  <div
                    className="h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-bold relative"
                    style={{
                      background: `${user.color}22`,
                      color: user.color,
                      border: `1px solid ${user.color}33`,
                    }}
                  >
                    {user.avatar}
                    {user.verification.status === "verified" && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-[var(--color-mint)] border border-[var(--color-void)]" />
                    )}
                  </div>
                  <span className="text-[12px] font-medium text-[var(--color-text)] flex items-center gap-1">
                    {user.name.split(" ")[0] || "User"}
                    {user.verification.status === "verified" && (
                      <ShieldCheck size={11} className="text-[var(--color-mint)]" />
                    )}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-[var(--color-muted)] hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-colors shrink-0 text-[12px] font-medium"
                >
                  <LogOut size={14} />
                  Log out
                </button>
              </div>
            ) : (
              <>
                <MagneticButton
                  to="/dashboard?auth=login"
                  variant="ghost"
                  className="!px-4 !py-2 text-[13px]"
                >
                  Log in
                </MagneticButton>
                <MagneticButton to="/dashboard" variant="primary" className="!px-4 !py-2 text-[13px]">
                  Sign up
                </MagneticButton>
              </>
            )}
          </div>

          <button
            className="lg:hidden p-2 text-[var(--color-muted)]"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </header>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 z-40 lg:hidden pt-20 px-4"
        >
          <div className="glass-strong rounded-2xl p-6 space-y-2">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="block py-3 px-4 text-lg border-b border-[var(--color-border)]"
              >
                {link.label}
              </Link>
            ))}
            {user.isRegistered ? (
              <button
                onClick={handleLogout}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={16} />
                Log out
              </button>
            ) : (
              <div className="flex gap-2 mt-4 pt-2">
                <Link
                  to="/dashboard?auth=login"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-center py-3 rounded-xl border border-white/10 text-sm"
                >
                  Log in
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-center py-3 rounded-xl bg-[var(--color-warm)] text-black text-sm font-semibold"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
}
