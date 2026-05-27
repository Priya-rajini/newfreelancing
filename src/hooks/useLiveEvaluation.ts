import { useMemo } from "react";
import { useProjects } from "../context/ProjectContext";
import { useTalent } from "../context/TalentContext";
import { useUser } from "../context/UserContext";
import {
  buildCandidateSummary,
  buildProposalMetrics,
  computeMatch,
} from "../utils/matching";

export function useLiveEvaluation(
  projectId: string | null | undefined,
  freelancerId: string | null | undefined
) {
  const { projects } = useProjects();
  const { talentPool, myTalentId } = useTalent();
  const { user } = useUser();

  return useMemo(() => {
    if (!projectId || !freelancerId) return null;

    const project = projects.find((p) => p.id === projectId);
    let freelancer = talentPool.find((t) => t.id === freelancerId);

    if (!freelancer && (freelancerId === myTalentId || freelancerId === user.email)) {
      freelancer = {
        id: freelancerId ?? "freelancer-temp",
        name: user.name || "Freelancer",
        headline: user.skills[0] ? `${user.skills[0]} Specialist` : "Generalist",
        location: user.location || "Remote",
        avatar: user.avatar || "U",
        color: user.color || "#e8a87c",
        skills: user.skills.length > 0 ? user.skills : ["General Development"],
        verified: user.verified || [],
        bio: user.bio || "",
        experienceYears: parseFloat(user.experienceYears || "0") || 2,
        availability: user.availability || "Available",
        isVerified: user.verification.status === "verified",
        updatedAt: Date.now(),
      };
    }

    if (!project || !freelancer) return null;

    const match = computeMatch(project, freelancer);
    const metrics = buildProposalMetrics(project, match);
    const summary = buildCandidateSummary(project, match, metrics);

    return { project, freelancer, match, metrics, summary };
  }, [projectId, freelancerId, projects, talentPool, myTalentId, user]);
}
