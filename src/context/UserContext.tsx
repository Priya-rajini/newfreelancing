import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { computeProfileCompleteness, type ProfileCompletenessResult } from "../utils/profileCompleteness";

export type UserRole = "freelancer" | "client" | "both" | null;
export type RoleView = "freelancer" | "client";
export type AvailabilityStatus = "available" | "unavailable" | "open";
export type VerificationStatus = "unverified" | "verifying" | "verified";
export type VerificationMethod = "student_id" | "linkedin" | null;

export interface EducationEntry {
  id: string;
  school: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  startYear: string;
  endYear: string;
  desc: string;
}

export interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  category: string;
  techUsed: string[];
  image: string;
  link: string;
  size?: string;
  metrics: {
    views: string;
    conversion: string;
  };
}

export interface Proposal {
  id: string;
  projectId: string;
  projectTitle: string;
  clientName: string;
  bidAmount: string;
  timeline: string;
  coverMessage: string;
  status: "pending" | "accepted" | "declined";
  score: number;
}

export interface UserProfile {
  email: string;
  name: string;
  avatar: string;
  color: string;
  role: UserRole;
  activeRoleView: RoleView;
  bio: string;
  location: string;
  skills: string[];
  verified: string[];
  portfolioItems: PortfolioItem[];
  verification: {
    status: VerificationStatus;
    method: VerificationMethod;
    value: string | null;
  };
  isRegistered: boolean;
  companyName?: string;
  hiringPreferences?: string;
  experienceYears?: string;
  hourlyRate: string;
  availability: AvailabilityStatus;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  proposals: Proposal[];
  contracts: ActiveContract[];
  earnings: {
    total: number;
    available: number;
    pending: number;
  };
  withdrawals: Withdrawal[];
  clientReviews: {
    id: string;
    author: string;
    company: string;
    rating: number;
    text: string;
    date: string;
  }[];
}

interface StoredAccount {
  email: string;
  password: string;
  profile: UserProfile;
}

const ACCOUNTS_KEY = "skillsync_accounts";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function loadAccounts(): StoredAccount[] {
  const saved = localStorage.getItem(ACCOUNTS_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved) as StoredAccount[];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function makeInitialProfile(): UserProfile {
  return {
    email: "",
    name: "",
    avatar: "",
    color: "#e8a87c",
    role: null,
    activeRoleView: "freelancer",
    bio: "",
    location: "",
    skills: [],
    verified: [],
    portfolioItems: [],
    verification: {
      status: "unverified",
      method: null,
      value: null,
    },
    isRegistered: false,
    companyName: "",
    hiringPreferences: "",
    experienceYears: "",
    hourlyRate: "$95/hr",
    availability: "available",
    education: [],
    experience: [],
    proposals: [],
    contracts: defaultContracts as ActiveContract[],
    earnings: defaultEarnings,
    withdrawals: defaultWithdrawals as Withdrawal[],
    clientReviews: defaultClientReviews,
  };
}

function initialsFromName(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface UserContextType {
  user: UserProfile;
  signup: (
    name: string,
    location: string,
    color: string,
    email: string,
    password: string
  ) => string | null;
  login: (email: string, password: string) => string | null;
  logout: () => void;
  setRole: (role: UserRole) => void;
  setActiveRoleView: (view: RoleView) => void;
  updateBio: (bio: string) => void;
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
  updateProfileDetails: (rate: string, availability: AvailabilityStatus) => void;
  addEducationEntry: (school: string, degree: string, field: string, startYear: string, endYear: string) => void;
  removeEducationEntry: (id: string) => void;
  addExperienceEntry: (company: string, role: string, startYear: string, endYear: string, desc: string) => void;
  removeExperienceEntry: (id: string) => void;
  addDetailedPortfolioItem: (title: string, description: string, category: string, techUsed: string[], image: string, link: string) => void;
  addPortfolioItem: (title: string, category: string, image: string) => void;
  removePortfolioItem: (id: number) => void;
  submitProposal: (projectId: string, projectTitle: string, clientName: string, bidAmount: string, timeline: string, coverMessage: string) => void;
  addVerifiedBadge: (badge: string) => void;
  startVerification: (method: VerificationMethod, value: string) => Promise<void>;
  resetVerification: () => void;
  updateProfileFields: (fields: Partial<UserProfile>) => void;
  updateDeliverableStatus: (contractId: string, deliverableId: string, status: DeliverableStatus) => void;
  uploadContractFile: (contractId: string, fileName: string, fileSize: string) => void;
  sendContractMessage: (contractId: string, text: string) => void;
  requestWithdrawal: (amount: number, method: string) => void;
  completeness: ProfileCompletenessResult & {
    checklist: ProfileCompletenessResult["checklist"] & {
      clientPrefsAdded: boolean;
      freelancerPrefsAdded: boolean;
    };
  };
  isVerified: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("skillsync_user_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as UserProfile;
        return {
          ...makeInitialProfile(),
          ...parsed,
          email: parsed.email ? normalizeEmail(parsed.email) : "",
        };
      } catch (e) {
        console.error("Failed to parse saved user profile", e);
      }
    }
    return {
      email: "",
      name: "",
      avatar: "",
      color: "#e8a87c",
      role: null,
      activeRoleView: "freelancer",
      bio: "",
      location: "",
      skills: ["Figma"],
      verified: [],
      portfolioItems: [],
      verification: {
        status: "unverified",
        method: null,
        value: null,
      },
      isRegistered: false,
      companyName: "",
      hiringPreferences: "",
      experienceYears: "",
      hourlyRate: "$95/hr",
      availability: "available",
      education: [],
      experience: [],
      proposals: [],
      contracts: defaultContracts as ActiveContract[],
      earnings: defaultEarnings,
      withdrawals: defaultWithdrawals as Withdrawal[],
      clientReviews: defaultClientReviews,
    };
  });

  useEffect(() => {
    if (user.isRegistered) {
      localStorage.setItem("skillsync_user_profile", JSON.stringify(user));
    }
  }, [user]);

  const signup = (
    name: string,
    location: string,
    color: string,
    email: string,
    password: string
  ): string | null => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return "Please enter a valid email address.";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters.";
    }
    if (loadAccounts().some((a) => normalizeEmail(a.email) === normalizedEmail)) {
      return "An account with this email already exists. Try logging in.";
    }

    const profile: UserProfile = {
      ...makeInitialProfile(),
      email: normalizedEmail,
      name,
      location,
      color,
      avatar: initialsFromName(name) || "U",
      isRegistered: true,
      role: null,
    };

    const accounts = loadAccounts();
    accounts.push({ email: normalizedEmail, password, profile });
    saveAccounts(accounts);

    setUser(profile);
    return null;
  };

  const logout = () => {
    setUser({
      email: "",
      name: "",
      avatar: "",
      color: "#e8a87c",
      role: null,
      activeRoleView: "freelancer",
      bio: "",
      location: "",
      skills: ["Figma"],
      verified: [],
      portfolioItems: [],
      verification: {
        status: "unverified",
        method: null,
        value: null,
      },
      isRegistered: false,
      companyName: "",
      hiringPreferences: "",
      experienceYears: "",
      hourlyRate: "$95/hr",
      availability: "available",
      education: [],
      experience: [],
      proposals: [],
      contracts: defaultContracts as ActiveContract[],
      earnings: defaultEarnings,
      withdrawals: defaultWithdrawals as Withdrawal[],
      clientReviews: defaultClientReviews,
    });
    localStorage.removeItem("skillsync_user_profile");
  };

  const login = (email: string, password: string): string | null => {
    const normalizedEmail = normalizeEmail(email);
    const accounts = loadAccounts();
    const account = accounts.find((a) => normalizeEmail(a.email) === normalizedEmail);
    
    if (!account) {
      return "No account found with this email address.";
    }
    
    if (account.password !== password) {
      return "Incorrect password.";
    }
    
    setUser(account.profile);
    return null;
  };

  const setRole = (role: UserRole) => {
    setUser((prev) => {
      const activeRoleView = role === "client" ? "client" : "freelancer";
      return { ...prev, role, activeRoleView };
    });
  };

  const setActiveRoleView = (activeRoleView: RoleView) => {
    setUser((prev) => ({ ...prev, activeRoleView }));
  };

  const updateBio = (bio: string) => {
    setUser((prev) => ({ ...prev, bio }));
  };

  const addSkill = (skill: string) => {
    setUser((prev) => {
      if (prev.skills.includes(skill)) return prev;
      return { ...prev, skills: [...prev.skills, skill] };
    });
  };

  const removeSkill = (skill: string) => {
    setUser((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const updateProfileDetails = (hourlyRate: string, availability: AvailabilityStatus) => {
    setUser((prev) => ({
      ...prev,
      hourlyRate,
      availability,
    }));
  };

  const addEducationEntry = (school: string, degree: string, field: string, startYear: string, endYear: string) => {
    const entry: EducationEntry = {
      id: Date.now().toString(),
      school,
      degree,
      field,
      startYear,
      endYear,
    };
    setUser((prev) => ({
      ...prev,
      education: [...prev.education, entry],
    }));
  };

  const removeEducationEntry = (id: string) => {
    setUser((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  };

  const addExperienceEntry = (company: string, role: string, startYear: string, endYear: string, desc: string) => {
    const entry: ExperienceEntry = {
      id: Date.now().toString(),
      company,
      role,
      startYear,
      endYear,
      desc,
    };
    setUser((prev) => ({
      ...prev,
      experience: [...prev.experience, entry],
    }));
  };

  const removeExperienceEntry = (id: string) => {
    setUser((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }));
  };

  const addDetailedPortfolioItem = (
    title: string,
    description: string,
    category: string,
    techUsed: string[],
    image: string,
    link: string
  ) => {
    const item: PortfolioItem = {
      id: Date.now(),
      title,
      description,
      category,
      techUsed,
      image: image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80",
      link: link || "#",
      metrics: {
        views: (Math.floor(Math.random() * 80) + 10) + "k",
        conversion: "+" + (Math.floor(Math.random() * 30) + 10) + "%",
      },
    };
    setUser((prev) => ({
      ...prev,
      portfolioItems: [...prev.portfolioItems, item],
    }));
  };

  const removePortfolioItem = (id: number) => {
    setUser((prev) => ({
      ...prev,
      portfolioItems: prev.portfolioItems.filter((item) => item.id !== id),
    }));
  };

  const addPortfolioItem = (title: string, category: string, image: string) => {
    addDetailedPortfolioItem(
      title,
      "Simulated work project demonstrating technical excellence.",
      category,
      ["Figma", "Design Systems"],
      image,
      "#"
    );
  };

  const submitProposal = (
    projectId: string,
    projectTitle: string,
    clientName: string,
    bidAmount: string,
    timeline: string,
    coverMessage: string
  ) => {
    const proposal: Proposal = {
      id: Date.now().toString(),
      projectId,
      projectTitle,
      clientName,
      bidAmount,
      timeline,
      coverMessage,
      status: "pending",
      score: Math.floor(Math.random() * 20) + 80, // Dynamic AI matching score
    };
    setUser((prev) => ({
      ...prev,
      proposals: [...prev.proposals, proposal],
    }));
  };

  const addVerifiedBadge = (badgeName: string) => {
    setUser((prev) => {
      if (prev.verified.includes(badgeName)) return prev;
      return {
        ...prev,
        verified: [...prev.verified, badgeName],
      };
    });
  };

  const startVerification = (method: VerificationMethod, value: string): Promise<void> => {
    return new Promise((resolve) => {
      setUser((prev) => ({
        ...prev,
        verification: { status: "verifying", method, value },
      }));

      setTimeout(() => {
        setUser((prev) => {
          const newVerifiedList = [...prev.verified];
          const badge = method === "student_id" ? "Student ID" : "LinkedIn";
          if (!newVerifiedList.includes(badge)) {
            newVerifiedList.push(badge);
          }
          if (!newVerifiedList.includes("Identity")) {
            newVerifiedList.push("Identity");
          }
          return {
            ...prev,
            verified: newVerifiedList,
            verification: {
              status: "verified",
              method,
              value,
            },
          };
        });
        resolve();
      }, 4500);
    });
  };

  const resetVerification = () => {
    setUser((prev) => ({
      ...prev,
      verified: prev.verified.filter((v) => v !== "Student ID" && v !== "LinkedIn" && v !== "Identity"),
      verification: {
        status: "unverified",
        method: null,
        value: null,
      },
    }));
  };

  const updateDeliverableStatus = (
    contractId: string,
    deliverableId: string,
    status: DeliverableStatus
  ) => {
    setUser((prev) => ({
      ...prev,
      contracts: prev.contracts.map((c) => {
        if (c.id !== contractId) return c;
        const deliverables = c.deliverables.map((d) =>
          d.id === deliverableId ? { ...d, status } : d
        );
        const done = deliverables.filter((d) => d.status === "approved").length;
        const progress = Math.round((done / deliverables.length) * 100);
        return { ...c, deliverables, progress };
      }),
    }));
  };

  const updateProfileFields = (fields: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...fields }));
  };

  const uploadContractFile = (contractId: string, fileName: string, fileSize: string) => {
    const file: ContractFile = {
      id: Date.now().toString(),
      name: fileName,
      size: fileSize,
      uploadedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
    setUser((prev) => ({
      ...prev,
      contracts: prev.contracts.map((c) =>
        c.id === contractId ? { ...c, files: [...c.files, file] } : c
      ),
    }));
  };

  const sendContractMessage = (contractId: string, text: string) => {
    const msg: ContractMessage = {
      id: Date.now().toString(),
      from: "freelancer",
      text,
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };
    setUser((prev) => ({
      ...prev,
      contracts: prev.contracts.map((c) =>
        c.id === contractId ? { ...c, messages: [...c.messages, msg] } : c
      ),
    }));
  };

  const requestWithdrawal = (amount: number, method: string) => {
    if (amount <= 0 || amount > user.earnings.available) return;
    const withdrawal: Withdrawal = {
      id: Date.now().toString(),
      amount,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: "processing",
      method,
    };
    setUser((prev) => ({
      ...prev,
      earnings: {
        ...prev.earnings,
        available: prev.earnings.available - amount,
      },
      withdrawals: [withdrawal, ...prev.withdrawals],
    }));
  };

  const baseCompleteness = useMemo(() => computeProfileCompleteness(user), [user]);

  const clientPrefsAdded =
    (user.companyName?.trim().length || 0) > 0 || (user.hiringPreferences?.trim().length || 0) > 0;
  const freelancerPrefsAdded =
    (user.experienceYears?.trim().length || 0) > 0 || (user.availability?.trim().length || 0) > 0;

  const completeness = useMemo(
    () => ({
      ...baseCompleteness,
      checklist: {
        ...baseCompleteness.checklist,
        clientPrefsAdded,
        freelancerPrefsAdded,
      },
    }),
    [baseCompleteness, clientPrefsAdded, freelancerPrefsAdded]
  );

  const isVerified = user.verification.status === "verified";

  return (
    <UserContext.Provider
      value={{
        user,
        signup,
        login,
        logout,
        setRole,
        setActiveRoleView,
        updateBio,
        addSkill,
        removeSkill,
        updateProfileDetails,
        addEducationEntry,
        removeEducationEntry,
        addExperienceEntry,
        removeExperienceEntry,
        addDetailedPortfolioItem,
        addPortfolioItem,
        removePortfolioItem,
        submitProposal,
        addVerifiedBadge,
        startVerification,
        resetVerification,
        updateProfileFields,
        updateDeliverableStatus,
        uploadContractFile,
        sendContractMessage,
        requestWithdrawal,
        completeness,
        isVerified,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

export interface ActiveContract {
  id: string;
  projectTitle: string;
  clientName: string;
  clientColor: string;
  budget: string;
  dueDate: string;
  progress: number;
  status: "active" | "completed" | "paused";
  deliverables: {
    id: string;
    title: string;
    status: "pending" | "submitted" | "approved";
  }[];
  files: ContractFile[];
  messages: ContractMessage[];
}

export interface ContractFile {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
}

export interface ContractMessage {
  id: string;
  from: "freelancer" | "client";
  text: string;
  time: string;
}

export interface Withdrawal {
  id: string;
  amount: number;
  date: string;
  status: "processing" | "completed";
  method: string;
}

export type DeliverableStatus = "pending" | "submitted" | "approved";

// Default Mock Data for workspaces
const defaultContracts: ActiveContract[] = [
  {
    id: "c-1",
    projectTitle: "Vault API Refactoring",
    clientName: "Vault FinTech",
    clientColor: "#c084fc",
    budget: "$4,500",
    dueDate: "June 15, 2026",
    progress: 33,
    status: "active",
    deliverables: [
      { id: "d-1", title: "API Endpoint Specs & Design", status: "approved" },
      { id: "d-2", title: "Middleware Integration & OAuth", status: "pending" },
      { id: "d-3", title: "Testing Suite & Documentation", status: "pending" },
    ],
    files: [
      { id: "f-1", name: "vault_api_docs_v2.pdf", size: "1.2 MB", uploadedAt: "May 20" },
    ],
    messages: [
      { id: "m-1", from: "client", text: "Welcome to the workspace! Let's get started on the middleware flow first.", time: "10:14 AM" },
      { id: "m-2", from: "freelancer", text: "Absolutely, I am drafting the schema mockups today.", time: "11:05 AM" },
    ],
  },
  {
    id: "c-2",
    projectTitle: "Marketing Landing Page Redesign",
    clientName: "EcoSphere Corp",
    clientColor: "#6ee7b7",
    budget: "$2,800",
    dueDate: "June 20, 2026",
    progress: 100,
    status: "completed",
    deliverables: [
      { id: "d-4", title: "Hero Section Prototypes", status: "approved" },
      { id: "d-5", title: "Interactive Tailwind Assembly", status: "approved" },
    ],
    files: [],
    messages: [],
  },
];

const defaultEarnings = {
  total: 7300,
  available: 2800,
  pending: 4500,
};

const defaultWithdrawals: Withdrawal[] = [
  { id: "w-1", amount: 4500, date: "May 10, 2026", status: "completed", method: "Bank Transfer (**** 4820)" },
];

const defaultClientReviews = [
  {
    id: "r-1",
    author: "Sarah Jenkins",
    company: "EcoSphere Corp",
    rating: 5,
    text: "Exceptional UI design and smooth communication. The landing page load speed is blazing fast now and our conversion rates increased immediately.",
    date: "May 12, 2026",
  },
  {
    id: "r-2",
    author: "Marcus Vance",
    company: "Vault FinTech",
    rating: 5,
    text: "Maya is an incredible product designer. Her refactoring of our onboarding flows reduced drop-off by 28% and set a new standard for our entire product design system.",
    date: "April 28, 2026",
  },
  {
    id: "r-3",
    author: "Dr. David Kincaid",
    company: "Peak Labs",
    rating: 5,
    text: "Brilliant components architecture and clean React/TypeScript code. Clean implementation, high attention to detail, and fast delivery of our analytics UI. Absolute professional!",
    date: "March 15, 2026",
  },
];
