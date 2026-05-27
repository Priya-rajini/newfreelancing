import type { Project } from "../context/ProjectContext";

export interface TalentProfile {
  id: string;
  name: string;
  headline: string;
  location: string;
  avatar: string;
  color: string;
  skills: string[];
  verified: string[];
  bio: string;
  experienceYears: number;
  availability: string;
  isVerified: boolean;
  updatedAt: number;
}

export interface MatchResult extends TalentProfile {
  matchScore: number;
  matchingSkillsCount: number;
  matchedSkills: string[];
}

export interface ProposalMetrics {
  skillsOverlap: number;
  experienceFit: number;
  profileStrength: number;
  overall: number;
}

function normalizeSkill(skill: string) {
  return skill.trim().toLowerCase();
}

function skillMatchesRequired(required: string, freelancerSkills: string[]) {
  const req = normalizeSkill(required);
  return freelancerSkills.some((s) => {
    const skill = normalizeSkill(s);
    return skill === req || skill.includes(req) || req.includes(skill);
  });
}

export function parseExperienceYears(value?: string): number {
  if (!value?.trim()) return 0;
  const match = value.match(/\d+/);
  if (!match) return 0;
  return Number.parseInt(match[0], 10);
}

export function computeMatch(project: Project, freelancer: TalentProfile): MatchResult {
  const requiredSkills = project.requiredSkills || [];
  const matchedSkills =
    requiredSkills.length === 0
      ? []
      : requiredSkills.filter((req) => skillMatchesRequired(req, freelancer.skills));

  const matchingSkillsCount = matchedSkills.length;
  let score = 0;

  if (requiredSkills.length > 0) {
    score = (matchingSkillsCount / requiredSkills.length) * 100;
    if (matchingSkillsCount > 0) {
      if (freelancer.experienceYears > 3) score += 10;
      if (freelancer.isVerified) score += 5;
    }
  } else if (freelancer.skills.length > 0) {
    score = 40;
  }

  return {
    ...freelancer,
    matchScore: Math.min(100, Math.round(score)),
    matchingSkillsCount,
    matchedSkills,
  };
}

export function computeMatches(
  talentPool: TalentProfile[],
  project: Project,
  excludeId?: string
): MatchResult[] {
  return talentPool
    .filter((f) => f.id !== excludeId)
    .map((f) => computeMatch(project, f))
    .sort((a, b) => b.matchScore - a.matchScore);
}

export function buildProposalMetrics(project: Project, match: MatchResult): ProposalMetrics {
  const requiredCount = project.requiredSkills?.length || 0;
  const skillsOverlap =
    requiredCount > 0
      ? Math.round((match.matchingSkillsCount / requiredCount) * 100)
      : match.skills.length > 0
        ? 50
        : 0;

  const experienceFit = Math.min(100, Math.round((match.experienceYears / 8) * 100));

  let profileStrength = 30;
  if (match.bio.trim().length >= 40) profileStrength += 25;
  if (match.skills.length >= 3) profileStrength += 20;
  if (match.isVerified) profileStrength += 25;
  profileStrength = Math.min(100, profileStrength);

  const overall = Math.round(
    skillsOverlap * 0.5 + experienceFit * 0.2 + profileStrength * 0.15 + match.matchScore * 0.15
  );

  return {
    skillsOverlap,
    experienceFit,
    profileStrength,
    overall: Math.min(100, overall),
  };
}

export function buildCandidateSummary(
  project: Project,
  match: MatchResult,
  metrics: ProposalMetrics
): string {
  const bio = match.bio.trim();
  const bioLine = bio
    ? bio.length > 160
      ? `${bio.slice(0, 157)}…`
      : bio
    : `${match.name} is a ${match.headline}${match.location ? ` based in ${match.location}` : ""}.`;

  const skillLine =
    match.matchedSkills.length > 0
      ? `Matches ${match.matchedSkills.length} of ${project.requiredSkills.length} required skills (${match.matchedSkills.join(", ")}).`
      : project.requiredSkills.length > 0
        ? `No direct overlap with required skills yet; review their full skill set.`
        : `Skills profile is active on SkillSync.`;

  const fitLine =
    metrics.overall >= 75
      ? `Strong fit for “${project.title}” with a ${metrics.overall}% overall alignment.`
      : metrics.overall >= 50
        ? `Moderate fit for “${project.title}” (${metrics.overall}% alignment)—worth a closer look.`
        : `Early fit signal for “${project.title}” (${metrics.overall}% alignment).`;

  return `${bioLine} ${skillLine} ${fitLine}`;
}
