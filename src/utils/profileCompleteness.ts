import type { UserProfile } from "../context/UserContext";

export const PROFILE_SECTION_WEIGHT = 25;
export const AI_MATCHING_UNLOCK_PERCENT = 70;
export const PROFILE_SECTION_COUNT = 4;

export type ProfileSectionId = "role" | "verification" | "bio" | "skills";

export interface ProfileCompletenessResult {
  score: number;
  checklist: {
    roleSelected: boolean;
    verified: boolean;
    bioAdded: boolean;
    skillsAdded: boolean;
  };
  unlockedAiMatching: boolean;
}

export function computeProfileCompleteness(user: UserProfile): ProfileCompletenessResult {
  const roleSelected = user.role !== null;
  const verified = user.verification.status === "verified";
  const bioAdded = user.bio.trim().length > 0;
  const skillsAdded = user.skills.length >= 1;

  const checklist = {
    roleSelected,
    verified,
    bioAdded,
    skillsAdded,
  };

  const completed = Object.values(checklist).filter(Boolean).length;
  const score = completed * PROFILE_SECTION_WEIGHT;
  const unlockedAiMatching = score >= AI_MATCHING_UNLOCK_PERCENT;

  return { score, checklist, unlockedAiMatching };
}

export const PROFILE_CHECKLIST_ITEMS: {
  id: ProfileSectionId;
  label: string;
  key: keyof ProfileCompletenessResult["checklist"];
}[] = [
  { id: "role", label: "Choose Role", key: "roleSelected" },
  { id: "verification", label: "Verify Identity", key: "verified" },
  { id: "bio", label: "Add Bio", key: "bioAdded" },
  { id: "skills", label: "Add Skills", key: "skillsAdded" },
];
