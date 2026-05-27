import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useTalent } from "./TalentContext";
import { stripSampleProposals, syncProjectProposalsWithTalent } from "../utils/proposals";
import { computeMatch } from "../utils/matching";
import { validateProposalAttachments } from "../utils/proposalAttachments";


export type ProjectType = "Fixed" | "Hourly";
export type ProjectStatus = "Open" | "Active" | "Completed";

export interface ProjectComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export type ProposalStatus = "pending" | "approved" | "denied";
export type ProposalAttachmentType = "image" | "resume";

export interface ProposalAttachment {
  id: string;
  type: ProposalAttachmentType;
  fileName: string;
  mimeType: string;
  dataUrl: string;
  sizeBytes: number;
}

export interface ProjectProposal {
  id: string;
  freelancerId: string;
  freelancerEmail: string;
  coverMessage: string;
  matchScore: number;
  submittedAt: string;
  status: ProposalStatus;
  attachments?: ProposalAttachment[];
  bidAmount: string;
  timeline: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  budget: number;
  deadline: string;
  projectType: ProjectType;
  status: ProjectStatus;
  proposalsCount: number;
  proposals?: ProjectProposal[];
  comments?: ProjectComment[];
  clientName?: string;
  clientEmail?: string;
}

function normalizeProposal(prop: ProjectProposal): ProjectProposal {
  return {
    ...prop,
    status: prop.status ?? "pending",
    attachments: Array.isArray(prop.attachments) ? prop.attachments : [],
  };
}

function normalizeProjects(raw: Project[]): Project[] {
  return raw.map((p) => {
    const proposals = (Array.isArray(p.proposals) ? p.proposals : []).map(normalizeProposal);
    return stripSampleProposals({
      ...p,
      proposals,
      proposalsCount: proposals.length,
      comments: Array.isArray(p.comments) ? p.comments : [],
    });
  });
}

function makeDefaultProjects(): Project[] {
  return [];
}

interface ProjectContextType {
  projects: Project[];
  addProject: (
    project: Omit<Project, "id" | "status" | "proposalsCount" | "comments" | "proposals"> & { clientName?: string; clientEmail?: string }
  ) => void;
  addComment: (projectId: string, author: string, text: string) => void;
  submitProposal: (
    projectId: string,
    freelancerId: string,
    freelancerEmail: string,
    coverMessage: string,
    bidAmount: string,
    timeline: string,
    attachments?: ProposalAttachment[]
  ) => string | null;
  updateProposalStatus: (
    projectId: string,
    proposalId: string,
    status: "approved" | "denied"
  ) => void;
  getProjects: () => Project[];
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { talentPool } = useTalent();

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem("skillsync_projects_v2");
    if (saved) {
      try {
        return normalizeProjects(JSON.parse(saved) as Project[]);
      } catch (e) {
        console.error("Failed to parse saved projects", e);
      }
    }
    return makeDefaultProjects();
  });

  const applyProjects = useCallback(
    (updater: (prev: Project[]) => Project[]) => {
      setProjects((prev) => syncProjectProposalsWithTalent(updater(prev), talentPool));
    },
    [talentPool]
  );

  useEffect(() => {
    localStorage.setItem("skillsync_projects_v2", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    setProjects((prev) => {
      const next = syncProjectProposalsWithTalent(prev, talentPool);
      const same =
        next.length === prev.length &&
        next.every((p, i) => {
          const a = p.proposals ?? [];
          const b = prev[i]?.proposals ?? [];
          return (
            a.length === b.length && a.every((prop, j) => prop.matchScore === b[j]?.matchScore)
          );
        });
      return same ? prev : next;
    });
  }, [talentPool]);

  const projectSkillsKey = projects
    .map((p) => `${p.id}:${(p.requiredSkills ?? []).join("|")}`)
    .join(";");

  useEffect(() => {
    setProjects((prev) => syncProjectProposalsWithTalent(prev, talentPool));
  }, [projectSkillsKey, talentPool]);

  const addProject = (
    projectData: Omit<Project, "id" | "status" | "proposalsCount" | "comments" | "proposals"> & { clientName?: string; clientEmail?: string }
  ) => {
    const base: Project = {
      ...projectData,
      id: `p-${Date.now()}`,
      status: "Open",
      proposals: [],
      proposalsCount: 0,
      comments: [],
    };
    applyProjects((prev) => [base, ...prev]);
  };

  const addComment = (projectId: string, author: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const comment: ProjectComment = {
      id: `c-${Date.now()}`,
      author: author.trim() || "You",
      text: trimmed,
      createdAt: new Date().toISOString(),
    };

    applyProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, comments: [...(p.comments ?? []), comment] }
          : p
      )
    );
  };

  const submitProposal = (
    projectId: string,
    freelancerId: string,
    freelancerEmail: string,
    coverMessage: string,
    bidAmount: string,
    timeline: string,
    attachments: ProposalAttachment[] = []
  ): string | null => {
    const trimmed = coverMessage.trim();
    if (!trimmed) return "Please write a proposal message.";
    if (trimmed.length < 20) return "Proposal should be at least 20 characters.";
    if (!freelancerEmail.trim()) return "Freelancer email is required.";

    const attachmentError = validateProposalAttachments(attachments);
    if (attachmentError) return attachmentError;

    const project = projects.find((p) => p.id === projectId);
    if (!project) return "Project not found.";
    if (project.status !== "Open") return "This project is no longer accepting proposals.";

    const existing = (project.proposals ?? []).some((p) => p.freelancerId === freelancerId || p.freelancerEmail === freelancerEmail);
    if (existing) return "You have already submitted a proposal for this project.";

    const freelancer = talentPool.find((t) => t.id === freelancerId);
    const matchScore = freelancer ? computeMatch(project, freelancer).matchScore : 0;

    const proposal: ProjectProposal = {
      id: `prop-${Date.now()}`,
      freelancerId,
      freelancerEmail: freelancerEmail.trim(),
      coverMessage: trimmed,
      matchScore,
      submittedAt: new Date().toISOString(),
      status: "pending",
      attachments,
      bidAmount,
      timeline,
    };

    applyProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const proposals = [...(p.proposals ?? []), proposal];
        return { ...p, proposals, proposalsCount: proposals.length };
      })
    );

    return null;
  };

  const updateProposalStatus = (
    projectId: string,
    proposalId: string,
    status: "approved" | "denied"
  ) => {
    applyProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const proposals = (p.proposals ?? []).map((prop) =>
          prop.id === proposalId ? { ...prop, status } : prop
        );
        const projectUpdate =
          status === "approved"
            ? { status: "Active" as const, proposals }
            : { proposals };
        return { ...p, ...projectUpdate, proposalsCount: proposals.length };
      })
    );
  };

  const getProjects = () => {
    return projects;
  };

  return (
    <ProjectContext.Provider
      value={{ projects, addProject, addComment, submitProposal, updateProposalStatus, getProjects }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
}
