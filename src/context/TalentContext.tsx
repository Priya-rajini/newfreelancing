import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useUser, type UserProfile } from "./UserContext";
import type { TalentProfile } from "../utils/matching";
import { parseExperienceYears } from "../utils/matching";
import { LEGACY_SAMPLE_FREELANCER_ID } from "../utils/proposals";
import { freelancers as mockFreelancers } from "../data/mockData";

const POOL_KEY = "skillsync_talent_pool";
const TALENT_ID_KEY = "skillsync_talent_id";

function makeDefaultTalentPool(): TalentProfile[] {
  return mockFreelancers.map((f) => ({
    id: f.id,
    name: f.name,
    headline: f.role,
    location: f.location,
    avatar: f.avatar,
    color: f.color,
    skills: f.skills,
    verified: f.verified,
    bio: f.bio,
    experienceYears: f.experience,
    availability: "Available",
    isVerified: true,
    updatedAt: Date.now(),
  }));
}

function loadPool(): TalentProfile[] {
  const saved = localStorage.getItem(POOL_KEY);
  if (!saved) {
    const defaults = makeDefaultTalentPool();
    localStorage.setItem(POOL_KEY, JSON.stringify(defaults));
    return defaults;
  }
  try {
    return (JSON.parse(saved) as TalentProfile[]).filter(
      (t) => t.id !== LEGACY_SAMPLE_FREELANCER_ID
    );
  } catch {
    return [];
  }
}

function getOrCreateTalentId(): string {
  let id = localStorage.getItem(TALENT_ID_KEY);
  if (!id) {
    id = `talent-${Date.now()}`;
    localStorage.setItem(TALENT_ID_KEY, id);
  }
  return id;
}

function userToTalent(user: UserProfile, id: string): TalentProfile | null {
  if (!user.isRegistered || !user.name.trim()) return null;
  if (user.role !== "freelancer" && user.role !== "both") return null;

  const skills = user.skills.map((s) => s.trim()).filter(Boolean);
  if (skills.length === 0) return null;

  const primary = skills[0];
  const headline =
    user.role === "both"
      ? `${primary} · Freelancer & Client`
      : `${primary} Specialist`;

  return {
    id,
    name: user.name.trim(),
    headline,
    location: user.location.trim() || "Remote",
    avatar: user.avatar || user.name.slice(0, 2).toUpperCase(),
    color: user.color,
    skills,
    verified: user.verified,
    bio: user.bio.trim(),
    experienceYears: parseExperienceYears(user.experienceYears),
    availability: user.availability?.trim() || "Not specified",
    isVerified: user.verification.status === "verified",
    updatedAt: Date.now(),
  };
}

interface TalentContextType {
  talentPool: TalentProfile[];
  myTalentId: string | null;
  getTalentById: (id: string) => TalentProfile | undefined;
}

const TalentContext = createContext<TalentContextType | undefined>(undefined);

export function TalentProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [talentPool, setTalentPool] = useState<TalentProfile[]>(() => loadPool());
  const [myTalentId, setMyTalentId] = useState<string | null>(() =>
    localStorage.getItem(TALENT_ID_KEY)
  );

  const syncFromUser = useCallback(() => {
    const profile = userToTalent(user, getOrCreateTalentId());
    setMyTalentId(getOrCreateTalentId());

    if (!profile) return;

    setTalentPool((prev) => {
      const next = [...prev.filter((t) => t.id !== profile.id), profile].sort(
        (a, b) => b.updatedAt - a.updatedAt
      );
      localStorage.setItem(POOL_KEY, JSON.stringify(next));
      return next;
    });
  }, [user]);

  useEffect(() => {
    syncFromUser();
  }, [syncFromUser]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === POOL_KEY) {
        setTalentPool(loadPool());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const getTalentById = useCallback(
    (id: string) => talentPool.find((t) => t.id === id),
    [talentPool]
  );

  return (
    <TalentContext.Provider value={{ talentPool, myTalentId, getTalentById }}>
      {children}
    </TalentContext.Provider>
  );
}

export function useTalent() {
  const ctx = useContext(TalentContext);
  if (!ctx) {
    throw new Error("useTalent must be used within a TalentProvider");
  }
  return ctx;
}
