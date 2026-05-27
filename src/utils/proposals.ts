import type { Project } from "../context/ProjectContext";
import type { TalentProfile } from "./matching";
import { computeMatch } from "./matching";

/** Legacy demo freelancer id — stripped from stored data */
export const LEGACY_SAMPLE_FREELANCER_ID = "talent-sample-alex-rivera";

export function stripSampleProposals(project: Project): Project {
  const proposals = (project.proposals ?? []).filter(
    (p) => p.freelancerId !== LEGACY_SAMPLE_FREELANCER_ID
  );
  return { ...project, proposals, proposalsCount: proposals.length };
}

export function syncProjectProposalsWithTalent(
  projects: Project[],
  talentPool: TalentProfile[]
): Project[] {
  return projects.map((project) => {
    const proposals = (project.proposals ?? []).map((prop) => {
      const freelancer = talentPool.find((t) => t.id === prop.freelancerId);
      if (!freelancer) return prop;
      const { matchScore } = computeMatch(project, freelancer);
      if (prop.matchScore === matchScore) return prop;
      return { ...prop, matchScore };
    });
    const changed = proposals.some(
      (p, i) => p.matchScore !== (project.proposals ?? [])[i]?.matchScore
    );
    if (!changed) return project;
    return { ...project, proposals, proposalsCount: proposals.length };
  });
}
