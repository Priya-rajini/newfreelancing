import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, type UserRole } from "../context/UserContext";
import { CompletenessWidget } from "../components/ui/CompletenessWidget";
import { TaskChecklist } from "../components/ui/TaskChecklist";
import { useProjects } from "../context/ProjectContext";
import { useTalent } from "../context/TalentContext";
import { computeMatches } from "../utils/matching";
import {
  getAssistantResponse,
  getWelcomeMessage,
  type WorkspaceAssistantContext,
} from "../utils/workspaceAssistant";
import {
  LayoutGrid,
  MessageSquare,
  Settings,
  Send,
  Sparkles,
  ChevronRight,
  Users,
  Plus,
  ShieldCheck,
  UserPlus,
  MapPin,
  Palette,
  LogIn,
  Mail,
  Lock,
  LogOut,
  FolderKanban,
  Briefcase,
  Globe,
  Wallet,
  Star,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { FreelancerOverviewPanel } from "../components/dashboard/FreelancerOverviewPanel";
import { ActiveContractsPanel } from "../components/dashboard/ActiveContractsPanel";
import { EarningsPanel } from "../components/dashboard/EarningsPanel";
import { ReviewsPanel } from "../components/dashboard/ReviewsPanel";
import { MessagesPanel } from "../components/dashboard/MessagesPanel";
import { SettingsPanel } from "../components/dashboard/SettingsPanel";

type FreelancerSection = "overview" | "contracts" | "earnings" | "reviews" | "messages" | "settings";


const sectionTitles: Record<FreelancerSection, string> = {
  overview: "Overview",
  contracts: "Active contracts",
  earnings: "Earnings",
  reviews: "Reviews",
  messages: "Messages",
  settings: "Settings",
};

const colorPalettes = [
  { value: "#e8a87c", name: "Warm Amber" },
  { value: "#6ee7b7", name: "Mint Green" },
  { value: "#7dd3fc", name: "Sky Blue" },
  { value: "#f472b6", name: "Rose Pink" },
  { value: "#c084fc", name: "Lavender" },
];

export function Dashboard() {
  const { user, signup, login, logout, setRole, setActiveRoleView, completeness } = useUser();
  const { projects: clientProjects } = useProjects();
  const { talentPool, myTalentId } = useTalent();
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [aiInput, setAiInput] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Auto-select the first project when projects load or change
  useEffect(() => {
    if (clientProjects.length > 0) {
      setSelectedProjectId((prev) => {
        if (!prev) return clientProjects[0].id;
        const exists = clientProjects.some((p) => p.id === prev);
        return exists ? prev : clientProjects[0].id;
      });
    } else {
      setSelectedProjectId(null);
    }
  }, [clientProjects]);

  const selectedProject = useMemo(() => {
    return clientProjects.find((p) => p.id === selectedProjectId) || null;
  }, [clientProjects, selectedProjectId]);

  const matches = useMemo(() => {
    if (!selectedProject) return [];
    return computeMatches(talentPool, selectedProject, myTalentId ?? undefined).slice(0, 5);
  }, [selectedProject, talentPool, myTalentId]);

  const receivedProposals = useMemo(() => {
    if (!selectedProject) return [];
    return (selectedProject.proposals ?? []).filter((p) => p.status !== "denied");
  }, [selectedProject]);

  const myApplications = useMemo(() => {
    return clientProjects
      .flatMap((p) =>
        (p.proposals ?? [])
          .filter((prop) => prop.freelancerId === myTalentId || prop.freelancerEmail === user.email)
          .map((prop) => ({ project: p, proposal: prop }))
      )
      .sort(
        (a, b) =>
          new Date(b.proposal.submittedAt).getTime() - new Date(a.proposal.submittedAt).getTime()
      );
  }, [clientProjects, myTalentId, user.email]);
  const [messages, setMessages] = useState<{ role: "ai" | "user"; text: string }[]>([]);
  const [aiTyping, setAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Signup fields
  const [signupName, setSignupName] = useState("");
  const [signupLocation, setSignupLocation] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupColor, setSignupColor] = useState("#e8a87c");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const isFreelancerViewForCtx =
    user.role === "freelancer" || (user.role === "both" && user.activeRoleView === "freelancer");

  const assistantContext = useMemo((): WorkspaceAssistantContext => {
    const roleView: "client" | "freelancer" = isFreelancerViewForCtx ? "freelancer" : "client";
    const received = selectedProject?.proposals ?? [];
    return {
      user,
      roleView,
      completenessScore: completeness.score,
      completenessChecklist: completeness.checklist,
      projects: clientProjects,
      myTalentId,
      myApplications,
      receivedProposals: received,
      pendingProposalsCount: received.filter((p) => p.status === "pending").length,
      talentPoolSize: talentPool.length,
      talentPool,
    };
  }, [
    user,
    isFreelancerViewForCtx,
    completeness,
    clientProjects,
    myTalentId,
    myApplications,
    selectedProject,
    talentPool,
  ]);

  useEffect(() => {
    if (!user.isRegistered || !user.role) return;
    setMessages((prev) => {
      if (prev.length > 0) return prev;
      return [{ role: "ai", text: getWelcomeMessage(assistantContext) }];
    });
  }, [user.isRegistered, user.role, assistantContext]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiTyping]);

  const sendAi = () => {
    const text = aiInput.trim();
    if (!text || aiTyping) return;

    setMessages((m) => [...m, { role: "user", text }]);
    setAiInput("");
    setAiTyping(true);

    window.setTimeout(() => {
      const reply = getAssistantResponse(text, assistantContext);
      setMessages((m) => [...m, { role: "ai", text: reply }]);
      setAiTyping(false);
    }, 400);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!signupName.trim()) {
      setAuthError("Please enter your full name.");
      return;
    }
    if (!signupLocation.trim()) {
      setAuthError("Please enter your location.");
      return;
    }
    if (!signupEmail.trim()) {
      setAuthError("Please enter your email.");
      return;
    }
    if (signupPassword.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }
    const err = signup(
      signupName.trim(),
      signupLocation.trim(),
      signupColor,
      signupEmail.trim(),
      signupPassword
    );
    if (err) setAuthError(err);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const err = login(loginEmail.trim(), loginPassword);
    if (err) setAuthError(err);
  };

  const handleRoleViewChange = (view: "freelancer" | "client") => {
    setActiveRoleView(view);
    setActiveSection("overview");
  };

  const handleLogout = () => {
    logout();
    navigate("/dashboard?auth=login");
  };

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setMessages((m) => [
      ...m,
      {
        role: "ai",
        text: `Awesome! You've set your role to ${selectedRole?.toUpperCase()}. I have tailored your workspace dashboard with relevant tools. Check out the Profile Completeness widget in the sidebar!`,
      },
    ]);
  };

  // -------------------------------------------------------------
  // STATE A: NOT REGISTERED (SIGN UP / LOGIN)
  // -------------------------------------------------------------
  if (!user.isRegistered) {
    const accentColor = authMode === "login" ? "#7dd3fc" : signupColor;

    return (
      <div className="pt-28 pb-20 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl relative overflow-hidden"
          >
            <div
              className="absolute -top-24 -right-24 h-48 w-48 rounded-full blur-[80px] opacity-20 transition-colors duration-500"
              style={{ backgroundColor: accentColor }}
            />

            <div className="flex items-center gap-3 mb-5">
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center transition-colors duration-300"
                style={{
                  backgroundColor: `${accentColor}22`,
                  border: `1px solid ${accentColor}44`,
                  color: accentColor,
                }}
              >
                {authMode === "login" ? <LogIn size={20} /> : <UserPlus size={20} />}
              </div>
              <div>
                <h1 className="text-display text-2xl font-semibold text-white">
                  {authMode === "login" ? "Welcome back" : "Create Account"}
                </h1>
                <p className="text-[var(--color-muted)] text-xs">
                  {authMode === "login"
                    ? "Log in to your SkillSync workspace"
                    : "Set up your SkillSync credentials"}
                </p>
              </div>
            </div>

            <div className="flex p-1 rounded-xl bg-white/5 border border-white/10 mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setAuthError("");
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  authMode === "signup" ? "bg-white/10 text-white" : "text-[var(--color-muted)]"
                }`}
              >
                Sign up
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setAuthError("");
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  authMode === "login" ? "bg-white/10 text-white" : "text-[var(--color-muted)]"
                }`}
              >
                Log in
              </button>
            </div>

            {authMode === "login" ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[var(--color-muted)] mb-2 font-mono">
                    Email
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@email.com"
                      autoComplete="email"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-warm)]/40 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[var(--color-muted)] mb-2 font-mono">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Your password"
                      autoComplete="current-password"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-warm)]/40 transition-colors"
                    />
                  </div>
                </div>
                {authError && (
                  <div className="text-xs text-red-400 bg-red-950/20 border border-red-900/30 p-3 rounded-lg flex items-center gap-2">
                    <span className="shrink-0">•</span>
                    <span>{authError}</span>
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-black font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-2"
                  style={{ backgroundColor: accentColor }}
                >
                  <LogIn size={16} /> Log in
                </button>
                <p className="text-center text-xs text-[var(--color-muted)]">
                  New here?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signup");
                      setAuthError("");
                    }}
                    className="text-[var(--color-warm)] hover:underline"
                  >
                    Create an account
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[var(--color-muted)] mb-2 font-mono">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    autoComplete="name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-warm)]/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[var(--color-muted)] mb-2 font-mono">
                    Email
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="you@email.com"
                      autoComplete="email"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-warm)]/40 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[var(--color-muted)] mb-2 font-mono">
                    Location / City
                  </label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                    <input
                      type="text"
                      value={signupLocation}
                      onChange={(e) => setSignupLocation(e.target.value)}
                      placeholder="e.g. San Francisco, CA"
                      autoComplete="address-level2"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-warm)]/40 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[var(--color-muted)] mb-2 font-mono">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                    <input
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-warm)]/40 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[var(--color-muted)] mb-2 font-mono">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                    <input
                      type="password"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-warm)]/40 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[var(--color-muted)] mb-2 flex items-center gap-1.5 font-mono">
                    <Palette size={13} /> Profile Theme Color
                  </label>
                  <div className="flex items-center gap-3 py-1">
                    {colorPalettes.map((pal) => (
                      <button
                        key={pal.value}
                        type="button"
                        onClick={() => setSignupColor(pal.value)}
                        title={pal.name}
                        className="h-7 w-7 rounded-full transition-all border-2 relative flex items-center justify-center"
                        style={{
                          backgroundColor: pal.value,
                          borderColor: signupColor === pal.value ? "white" : "transparent",
                          transform: signupColor === pal.value ? "scale(1.1)" : "scale(1)",
                        }}
                      >
                        {signupColor === pal.value && (
                          <span className="h-1.5 w-1.5 rounded-full bg-black" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                {authError && (
                  <div className="text-xs text-red-400 bg-red-950/20 border border-red-900/30 p-3 rounded-lg flex items-center gap-2">
                    <span className="shrink-0">•</span>
                    <span>{authError}</span>
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-black font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-2"
                  style={{ backgroundColor: signupColor }}
                >
                  Get Started
                </button>
                <p className="text-center text-xs text-[var(--color-muted)]">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("login");
                      setAuthError("");
                    }}
                    className="text-[var(--color-warm)] hover:underline"
                  >
                    Log in
                  </button>
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE B: NO ROLE SELECTED YET (SPLASH ROLE PICKER SCREEN)
  // -------------------------------------------------------------
  if (user.role === null) {
    return (
      <div className="pt-28 pb-20 min-h-screen flex items-center justify-center px-4 bg-[var(--color-void)]">
        <div className="max-w-4xl w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="px-3 py-1 rounded-full bg-[var(--color-warm)]/10 text-[var(--color-warm)] text-xs font-mono font-medium tracking-wide">
              Onboarding Step 2 of 2
            </span>
            <h1 className="text-display text-4xl md:text-5xl font-medium mt-4 mb-3">
              Define Your Account Role
            </h1>
            <p className="text-[var(--color-muted)] max-w-lg mx-auto text-sm leading-relaxed mb-12">
              SkillSync operates on a single-account architecture. Select the role that matches your workflow goals, and toggle views at any time.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            {/* CARD 1: FREELANCER */}
            <motion.div
              whileHover={{ y: -6, scale: 1.01 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, type: "spring" }}
              onClick={() => handleRoleSelect("freelancer")}
              className="glass p-6 rounded-2xl border border-white/5 cursor-pointer hover:border-[var(--color-warm)]/30 group transition-all relative overflow-hidden bg-white/[0.005]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-warm)]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="h-10 w-10 rounded-xl bg-[var(--color-warm)]/10 flex items-center justify-center text-[var(--color-warm)] mb-6 border border-[var(--color-warm)]/20">
                <Briefcase size={20} />
              </div>
              <h3 className="font-semibold text-lg mb-2 group-hover:text-[var(--color-warm)] transition-colors">
                Freelancer
              </h3>
              <p className="text-xs text-[var(--color-muted)] leading-relaxed mb-6">
                Deliver services, showcase vetted skill badges, build AI trust score, and work on high-tier projects.
              </p>
              <div className="mt-auto text-[10px] text-[var(--color-muted)] border-t border-white/5 pt-4 font-mono">
                ACTIVE JOBS: 1,480+ • AVG RATE: $95/HR
              </div>
            </motion.div>

            {/* CARD 2: CLIENT */}
            <motion.div
              whileHover={{ y: -6, scale: 1.01 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              onClick={() => handleRoleSelect("client")}
              className="glass p-6 rounded-2xl border border-white/5 cursor-pointer hover:border-[var(--color-mint)]/30 group transition-all relative overflow-hidden bg-white/[0.005]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-mint)]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="h-10 w-10 rounded-xl bg-[var(--color-mint)]/10 flex items-center justify-center text-[var(--color-mint)] mb-6 border border-[var(--color-mint)]/25">
                <Users size={20} />
              </div>
              <h3 className="font-semibold text-lg mb-2 group-hover:text-[var(--color-mint)] transition-colors">
                Client / Hirer
              </h3>
              <p className="text-xs text-[var(--color-muted)] leading-relaxed mb-6">
                Post custom project guidelines, search talent using AI-matching suitability score, and manage milestones.
              </p>
              <div className="mt-auto text-[10px] text-[var(--color-muted)] border-t border-white/5 pt-4 font-mono">
                TALENT CAP: 12K+ • DEPOSITED FUNDS: $4.5M
              </div>
            </motion.div>

            {/* CARD 3: BOTH */}
            <motion.div
              whileHover={{ y: -6, scale: 1.01 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, type: "spring" }}
              onClick={() => handleRoleSelect("both")}
              className="glass p-6 rounded-2xl border border-white/5 cursor-pointer hover:border-[var(--color-sky)]/30 group transition-all relative overflow-hidden bg-white/[0.005]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-sky)]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="h-10 w-10 rounded-xl bg-[var(--color-sky)]/10 flex items-center justify-center text-[var(--color-sky)] mb-6 border border-[var(--color-sky)]/25">
                <Globe size={20} />
              </div>
              <h3 className="font-semibold text-lg mb-2 group-hover:text-[var(--color-sky)] transition-colors">
                Dual Agency (Both)
              </h3>
              <p className="text-xs text-[var(--color-muted)] leading-relaxed mb-6">
                Deliver services as a freelancer and hire contractors as a buyer under one unified dashboard account.
              </p>
              <div className="mt-auto text-[10px] text-[var(--color-muted)] border-t border-white/5 pt-4 font-mono">
                HYBRID PIPELINE: UNIFIED SWITCH
              </div>
            </motion.div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-10 inline-flex items-center gap-2 text-xs text-[var(--color-muted)] hover:text-red-400 transition-colors"
          >
            <LogOut size={14} />
            Log out and use a different account
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE C: REGISTERED & ROLE ACTIVE (DASHBOARD RUNNING)
  // -------------------------------------------------------------
  const isFreelancerView = user.activeRoleView === "freelancer";

  const freelancerNavItems = [
    { id: "overview", icon: LayoutGrid, label: "Overview" },
    { id: "contracts", icon: FolderKanban, label: "Active contracts", count: user.contracts.length },
    { id: "earnings", icon: Wallet, label: "Earnings tracker" },
    { id: "reviews", icon: Star, label: "Client reviews", count: user.clientReviews.length },
    { id: "messages", icon: MessageSquare, label: "Messages" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  const clientNavItems = [
    { id: "overview", icon: LayoutGrid, label: "Overview" },
    { id: "messages", icon: MessageSquare, label: "Messages" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  const activeNavItems: { id: string; icon: any; label: string; count?: number }[] = isFreelancerView
    ? freelancerNavItems
    : clientNavItems;

  return (
    <div className="pt-20 min-h-screen flex flex-col lg:flex-row bg-[var(--color-void)] pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
      {/* Sidebar Nav */}
      <aside className="hidden lg:flex w-[220px] shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]/30 min-h-[calc(100vh-5rem)] p-4">
        <p className="text-[11px] uppercase tracking-wider text-[var(--color-muted)] px-3 mb-4 font-mono">
          {isFreelancerView ? "Freelancer Space" : "Client Portal"}
        </p>
        {activeNavItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm mb-1 transition-all w-full text-left ${
                isActive
                  ? "bg-white/[0.06] text-white font-medium border-l-2 border-[var(--color-warm)] pl-2.5"
                  : "text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/[0.03]"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} style={isActive ? { color: "var(--color-warm)" } : {}} />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white font-mono shrink-0">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}

        <div className="mt-auto pt-6 border-t border-white/5 space-y-2">
          <Link
            to="/portfolio"
            className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-[var(--color-muted)] hover:text-white transition-all hover:bg-white/[0.04]"
          >
            <span className="font-semibold">My Portfolio</span>
            <ChevronRight size={14} />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 p-2.5 rounded-lg border border-red-500/20 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={14} />
            <span className="font-semibold">Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Dashboard Space */}
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="max-w-3xl">
          {/* Dual Switch Header Banner */}
          {user.role === "both" && (
            <div className="mb-6 p-4 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[var(--color-warm)] animate-pulse" />
                <span className="text-xs text-[var(--color-muted)]">
                  Dual Account: You are currently viewing your dashboard as a{" "}
                  <strong className="text-white capitalize">{user.activeRoleView}</strong>
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRoleViewChange("freelancer")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    isFreelancerView
                      ? "border-[var(--color-warm)] bg-[var(--color-warm)]/10 text-[var(--color-warm)]"
                      : "border-white/5 text-[var(--color-muted)] hover:text-white"
                  }`}
                  style={{
                    borderColor: isFreelancerView ? user.color : "rgba(255,255,255,0.05)",
                    color: isFreelancerView ? user.color : "",
                    backgroundColor: isFreelancerView ? `${user.color}15` : "",
                  }}
                >
                  Freelance View
                </button>
                <button
                  onClick={() => handleRoleViewChange("client")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    !isFreelancerView
                      ? "border-[var(--color-warm)] bg-[var(--color-warm)]/10 text-[var(--color-warm)]"
                      : "border-white/5 text-[var(--color-muted)] hover:text-white"
                  }`}
                  style={{
                    borderColor: !isFreelancerView ? user.color : "rgba(255,255,255,0.05)",
                    color: !isFreelancerView ? user.color : "",
                    backgroundColor: !isFreelancerView ? `${user.color}15` : "",
                  }}
                >
                  Client View
                </button>
              </div>
            </div>
          )}

          {/* Heading */}
          <h1 className="text-display text-2xl md:text-3xl font-medium">
            {isFreelancerView
              ? activeSection === "overview"
                ? `Good evening, ${user.name.split(" ")[0]}`
                : sectionTitles[activeSection as FreelancerSection] || "Overview"
              : activeSection === "overview"
                ? `Good evening, ${user.name.split(" ")[0]}`
                : activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
          </h1>
          <p className="text-[var(--color-muted)] mt-1.5 text-sm flex items-center gap-2">
            {isFreelancerView && activeSection === "overview" ? (
              <>
                <span>
                  {myApplications.length} proposal{myApplications.length === 1 ? "" : "s"} sent
                  {myApplications.some((a) => a.proposal.status === "pending")
                    ? " · pending client review"
                    : ""}
                </span>
                {user.verification.status === "verified" && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-[var(--color-mint)] font-mono">
                    <ShieldCheck size={11} /> AI VERIFIED TALENT
                  </span>
                )}
              </>
            ) : (
              <>
                <span>{clientProjects.length} active job postings · {clientProjects.reduce((acc, p) => acc + p.proposalsCount, 0)} applications received</span>
                {user.verification.status === "verified" && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-[var(--color-mint)] font-mono">
                    <ShieldCheck size={11} /> VERIFIED HIRER
                  </span>
                )}
              </>
            )}
          </p>

          <AnimatePresence mode="wait">
            {isFreelancerView ? (
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-10"
              >
                {activeSection === "overview" && (
                  <FreelancerOverviewPanel
                    skillBadges={user.verified}
                    onNavigate={(sec) => setActiveSection(sec)}
                  />
                )}
                {activeSection === "contracts" && <ActiveContractsPanel />}
                {activeSection === "earnings" && <EarningsPanel />}
                {activeSection === "reviews" && <ReviewsPanel />}
                {activeSection === "messages" && <MessagesPanel />}
                {activeSection === "settings" && <SettingsPanel />}
              </motion.div>
            ) : (
              // VIEW B: CLIENT VIEWPORT
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-10"
              >
                {activeSection === "overview" && (
                  <div className="space-y-8">
                    {/* Active Postings */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <p className="text-[11px] uppercase tracking-wider text-[var(--color-muted)] font-mono">
                          Active Job Postings
                        </p>
                        <Link
                          to="/post-project"
                          className="text-[11px] font-semibold flex items-center gap-1 hover:underline text-[var(--color-mint)]"
                          style={{ color: user.color }}
                        >
                          <Plus size={12} /> Post a Job
                        </Link>
                      </div>

                      {clientProjects.length === 0 ? (
                        <div className="glass rounded-xl p-8 text-center border border-white/5 bg-white/[0.005]">
                          <p className="text-sm text-[var(--color-muted)] mb-4">No projects yet. Post your first project</p>
                          <Link
                            to="/post-project"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-black hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: user.color }}
                          >
                            <Plus size={12} /> Post a Job
                          </Link>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                          {clientProjects.map((proj) => {
                            const isSelected = proj.id === selectedProjectId;
                            return (
                              <div
                                key={proj.id}
                                onClick={() => setSelectedProjectId(proj.id)}
                                className="glass rounded-xl p-5 hover:border-[var(--color-border-strong)] transition-all flex flex-col justify-between cursor-pointer border"
                                style={{
                                  borderColor: isSelected ? user.color : "rgba(255, 255, 255, 0.05)",
                                  boxShadow: isSelected ? `0 0 15px ${user.color}25` : "none"
                                }}
                              >
                                <div>
                                  <span 
                                    className="text-[9px] font-mono px-2 py-0.5 rounded"
                                    style={{
                                      backgroundColor: `${user.color}15`,
                                      color: user.color,
                                      border: `1px solid ${user.color}25`
                                    }}
                                  >
                                    {proj.projectType === "Fixed" ? "FIXED BUDGET" : "HOURLY RATE"}
                                  </span>
                                  <h3 className="font-medium mt-3 text-white line-clamp-1">{proj.title}</h3>
                                  <p className="text-xs text-[var(--color-muted)] mt-1.5 line-clamp-2">
                                    {proj.description}
                                  </p>
                                </div>
                                
                                <div className="mt-5 pt-3 border-t border-white/5 flex flex-col gap-2">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-[var(--color-muted)]">Budget</span>
                                    <span className="font-semibold text-white">
                                      {proj.projectType === "Fixed" ? `$${proj.budget.toLocaleString()}` : `$${proj.budget}/hr`}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-[11px] text-[var(--color-muted)]">
                                    <span>{proj.proposalsCount} proposals</span>
                                    <span className="capitalize px-1.5 py-0.5 rounded bg-white/5 text-[10px]">
                                      {proj.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Received Proposals */}
                    <div className="glass rounded-xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm">Received Proposals</h3>
                        <Sparkles size={16} className="text-[var(--color-warm)]" style={{ color: user.color }} />
                      </div>
                      <div className="space-y-3">
                        {!selectedProject ? (
                          <div className="p-8 text-center border border-dashed border-white/10 rounded-xl text-xs text-[var(--color-muted)] flex flex-col items-center gap-3">
                            <span>Select a project to review applications</span>
                            <Link
                              to="/post-project"
                              className="px-4 py-2 rounded-xl text-xs font-semibold text-black hover:opacity-90 transition-opacity"
                              style={{ backgroundColor: user.color }}
                            >
                              Post a Job
                            </Link>
                          </div>
                        ) : receivedProposals.length === 0 ? (
                          <div className="p-8 text-center border border-dashed border-white/10 rounded-xl text-xs text-[var(--color-muted)]">
                            No proposals yet. Freelancers can apply from the Projects page once your job is open.
                          </div>
                        ) : (
                          receivedProposals.map((prop) => {
                            const applicant = talentPool.find((t) => t.id === prop.freelancerId);
                            return (
                              <div
                                key={prop.id}
                                className="p-3.5 rounded-lg border border-white/5 hover:border-white/10 bg-white/[0.005] transition-all"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div
                                      className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono shrink-0"
                                      style={{
                                        background: `${applicant?.color ?? "#6ee7b7"}22`,
                                        color: applicant?.color ?? "#6ee7b7",
                                      }}
                                    >
                                      {applicant?.avatar ??
                                        applicant?.name
                                          ?.split(" ")
                                          .map((n: string) => n[0])
                                          .join("") ??
                                        "?"}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-xs font-semibold text-white truncate">
                                        {applicant?.name ?? "Freelancer"}
                                      </div>
                                      <div className="text-[10px] text-[var(--color-muted)] mt-0.5 truncate">
                                        Email: {prop.freelancerEmail}
                                      </div>
                                      <div className="text-[10px] text-[var(--color-muted)] mt-0.5 capitalize">
                                        {prop.status} · AI match {prop.matchScore}%
                                      </div>
                                    </div>
                                  </div>
                                  <Link
                                    to={`/ai/proposal-evaluator?freelancerId=${prop.freelancerId}&projectId=${selectedProject.id}`}
                                    className="text-[10px] shrink-0 hover:underline"
                                    style={{ color: user.color }}
                                  >
                                    Review & evaluate
                                  </Link>
                                </div>
                                <p className="text-[10px] text-[var(--color-muted)] mt-2 line-clamp-2">
                                  {prop.coverMessage}
                                </p>
                                {(prop.attachments?.length ?? 0) > 0 && (
                                  <p className="text-[10px] text-[var(--color-warm)] mt-1">
                                    {(prop.attachments?.length ?? 0)} attachment
                                    {(prop.attachments?.length ?? 0) === 1 ? "" : "s"} included
                                  </p>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Talent pool preview (optional matches not yet applied) */}
                    {selectedProject && matches.length > 0 && receivedProposals.length === 0 && (
                      <div className="glass rounded-xl p-6 space-y-4 opacity-80">
                        <h3 className="font-medium text-sm text-[var(--color-muted)]">
                          Suggested talent (not yet applied)
                        </h3>
                        <div className="space-y-2">
                          {matches.slice(0, 3).map((candidate) => (
                            <div
                              key={candidate.id}
                              className="text-[10px] text-[var(--color-muted)] flex justify-between"
                            >
                              <span>{candidate.name}</span>
                              <span>{candidate.matchScore}% fit</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Checklist Client */}
                    <TaskChecklist roleView="client" title="Today's Hiring Checklist" />
                  </div>
                )}
                {activeSection === "messages" && <MessagesPanel />}
                {activeSection === "settings" && <SettingsPanel />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Sidebar Section */}
      <aside className="w-full lg:w-[360px] shrink-0 border-t lg:border-t-0 lg:border-l border-[var(--color-border)] bg-[var(--color-surface)]/50 flex flex-col p-6 space-y-6 lg:min-h-0 lg:overflow-y-auto">
        {/* Nudge Widget */}
        <CompletenessWidget />

        {/* AI assistant sidebar widgets */}
        <div className="glass rounded-2xl flex flex-col lg:flex-1 lg:min-h-[300px] overflow-hidden">
          <div className="shrink-0 p-4 border-b border-[var(--color-border)] flex items-center gap-2">
            <Sparkles size={16} className="text-[var(--color-warm)] animate-pulse" style={{ color: user.color }} />
            <span className="text-sm font-semibold">AI Assistant</span>
          </div>

          <div className="overflow-y-auto p-4 space-y-4 min-h-[100px] max-h-[min(40vh,280px)] lg:max-h-none lg:flex-1 lg:min-h-0">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-xs p-3 rounded-xl max-w-[90%] leading-relaxed whitespace-pre-wrap ${
                    msg.role === "ai"
                      ? "bg-white/[0.03] text-[var(--color-muted)] mr-auto border border-white/5"
                      : "bg-[var(--color-warm)]/15 text-[var(--color-text)] ml-auto"
                  }`}
                  style={{
                    backgroundColor: msg.role === "user" ? `${user.color}25` : "",
                  }}
                >
                  {msg.text}
                </motion.div>
              ))}
              {aiTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs p-3 rounded-xl bg-white/[0.03] text-[var(--color-muted)] mr-auto border border-white/5"
                >
                  Thinking…
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          <div className="shrink-0 p-4 border-t border-[var(--color-border)] bg-[var(--color-surface)]/80">
            <div className="flex gap-2">
              <input
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendAi()}
                placeholder={
                  isFreelancerView
                    ? "Ask about profile, projects, proposals…"
                    : "Ask about hiring, proposals, matching…"
                }
                disabled={aiTyping}
                className="flex-1 bg-white/5 border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-xs focus:outline-none text-white placeholder-white/20 min-h-[40px] disabled:opacity-50"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              />
              <button
                type="button"
                onClick={sendAi}
                disabled={aiTyping || !aiInput.trim()}
                className="p-2.5 rounded-xl text-[#0a0a0b] hover:opacity-90 transition-opacity shrink-0 disabled:opacity-40"
                style={{ backgroundColor: user.color }}
                aria-label="Send message"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile nav bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 glass-strong border-t border-[var(--color-border)] flex justify-around py-3 px-2 z-40 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
        {activeNavItems.slice(0, 5).map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex flex-col items-center gap-1 text-[10px] transition-all ${
                isActive ? "text-[var(--color-warm)] font-medium font-semibold" : "text-[var(--color-muted)] hover:text-white"
              }`}
            >
              <item.icon size={20} style={isActive ? { color: "var(--color-warm)" } : {}} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
