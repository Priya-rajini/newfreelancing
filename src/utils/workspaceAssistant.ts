import type { Project, ProjectProposal } from "../context/ProjectContext";
import type { UserProfile } from "../context/UserContext";
import type { TalentProfile } from "./matching";

export interface WorkspaceAssistantContext {
  user: UserProfile;
  roleView: "client" | "freelancer";
  completenessScore: number;
  completenessChecklist: {
    roleSelected: boolean;
    verified: boolean;
    bioAdded: boolean;
    skillsAdded: boolean;
    clientPrefsAdded: boolean;
    freelancerPrefsAdded: boolean;
  };
  projects: Project[];
  myTalentId: string | null;
  myApplications: { project: Project; proposal: ProjectProposal }[];
  receivedProposals: ProjectProposal[];
  pendingProposalsCount: number;
  talentPoolSize: number;
  talentPool: TalentProfile[];
}

function normalize(text: string) {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function includesAny(text: string, phrases: string[]) {
  return phrases.some((p) => text.includes(p));
}

function isShortGreeting(text: string) {
  if (
    /^(hi|hello|hey|hiya|howdy)( there)?[!.?\s]*$/.test(text) ||
    text === "good morning" ||
    text === "good afternoon" ||
    text === "good evening"
  ) {
    return true;
  }
  return false;
}

function missingProfileSteps(ctx: WorkspaceAssistantContext): string[] {
  const { completenessChecklist: c, roleView } = ctx;
  const missing: string[] = [];
  if (!c.roleSelected) missing.push("choose your role (Freelancer, Client, or Both)");
  if (!c.verified) missing.push("complete identity verification");
  if (!c.bioAdded) missing.push("add a bio");
  if (roleView === "freelancer") {
    if (!c.skillsAdded) missing.push("add at least one skill");
    if (!c.freelancerPrefsAdded) missing.push("set experience or availability");
  } else {
    if (!c.clientPrefsAdded) missing.push("add company name or hiring preferences");
  }
  return missing;
}

function profileAnswer(ctx: WorkspaceAssistantContext): string {
  const missing = missingProfileSteps(ctx);
  const score = ctx.completenessScore;

  if (score >= 100) {
    return `Your profile is ${score}% complete — you're fully set up for ${ctx.roleView === "client" ? "posting jobs and reviewing talent" : "applying to projects and getting matched"}.`;
  }

  if (missing.length === 0) {
    return `Your profile is ${score}% complete. Open the Profile Completeness panel above to review any optional details.`;
  }

  return `Your profile is ${score}% complete. To improve matching, ${missing.join(", ")}. Use the Profile Completeness checklist in the sidebar — each section expands so you can fill it in.`;
}

function projectsSummary(ctx: WorkspaceAssistantContext): string {
  const open = ctx.projects.filter((p) => p.status === "Open");
  const active = ctx.projects.filter((p) => p.status === "Active");

  if (ctx.roleView === "client") {
    if (ctx.projects.length === 0) {
      return "You haven't posted any projects yet. Go to Post a Job (or the + on your dashboard) to create one. Freelancers can apply once it's live.";
    }
    const totalProposals = ctx.projects.reduce((n, p) => n + (p.proposals?.length ?? 0), 0);
    return `You have ${ctx.projects.length} project${ctx.projects.length === 1 ? "" : "s"} (${open.length} open, ${active.length} active) and ${totalProposals} total proposal${totalProposals === 1 ? "" : "s"} received. ${ctx.pendingProposalsCount > 0 ? `${ctx.pendingProposalsCount} proposal${ctx.pendingProposalsCount === 1 ? " is" : "s are"} still pending your review.` : "No proposals are waiting for review right now."}`;
  }

  if (open.length === 0) {
    return "There are no open projects on SkillSync right now. Check back later, or ask clients you know to post a job.";
  }

  const titles = open.slice(0, 3).map((p) => `“${p.title}”`).join(", ");
  const more = open.length > 3 ? ` and ${open.length - 3} more` : "";
  return `There ${open.length === 1 ? "is" : "are"} ${open.length} open project${open.length === 1 ? "" : "s"} you can apply to: ${titles}${more}. Open Projects in the menu, pick a job, and submit a proposal (20+ characters).`;
}

function applicationsAnswer(ctx: WorkspaceAssistantContext): string {
  if (ctx.myApplications.length === 0) {
    return "You haven't sent any proposals yet. Browse Projects, open an open job, and use the “Submit a proposal” section to apply.";
  }

  const lines = ctx.myApplications.slice(0, 5).map(({ project, proposal }) => {
    return `• ${project.title} — ${proposal.status} (match ${proposal.matchScore}%)`;
  });
  const more =
    ctx.myApplications.length > 5
      ? `\n…and ${ctx.myApplications.length - 5} more.`
      : "";
  return `You've applied to ${ctx.myApplications.length} project${ctx.myApplications.length === 1 ? "" : "s"}:\n${lines.join("\n")}${more}`;
}

function proposalsReviewAnswer(ctx: WorkspaceAssistantContext): string {
  if (ctx.receivedProposals.length === 0) {
    return "No proposals on your selected project yet. When freelancers apply, they'll show under Received Proposals on your dashboard and in the Proposals drawer on the project page.";
  }

  const pending = ctx.receivedProposals.filter((p) => p.status === "pending");
  const lines = ctx.receivedProposals.slice(0, 4).map((p) => {
    const name =
      ctx.talentPool.find((t) => t.id === p.freelancerId)?.name ?? "Freelancer";
    return `• ${name} — ${p.status}, ${p.matchScore}% match`;
  });

  let text = `You have ${ctx.receivedProposals.length} proposal${ctx.receivedProposals.length === 1 ? "" : "s"} on this project`;
  if (pending.length > 0) {
    text += ` (${pending.length} pending review)`;
  }
  text += `.\n${lines.join("\n")}\nOpen “Review & evaluate” to read each message, see AI match metrics, then Approve or Deny.`;
  return text;
}

function helpAnswer(ctx: WorkspaceAssistantContext): string {
  if (ctx.roleView === "freelancer") {
    return [
      "I can help with your SkillSync freelancer workspace. Try asking:",
      "• “How complete is my profile?”",
      "• “What projects can I apply to?”",
      "• “Status of my proposals”",
      "• “How do I get verified?”",
      "• “How does matching work?”",
    ].join("\n");
  }

  return [
    "I can help with your SkillSync client workspace. Try asking:",
    "• “How complete is my profile?”",
    "• “How many proposals did I receive?”",
    "• “How do I review a proposal?”",
    "• “How do I post a project?”",
    "• “Explain AI proposal evaluation”",
  ].join("\n");
}

export function getWelcomeMessage(ctx: WorkspaceAssistantContext): string {
  const name = ctx.user.name.trim() || "there";
  const role = ctx.roleView === "client" ? "hiring" : "freelancing";

  if (ctx.completenessScore < 50) {
    return `Hi ${name}! I'm your SkillSync assistant. Your profile is ${ctx.completenessScore}% complete — finish setup in the checklist above to unlock better ${role} matches. Ask me anything about your workspace.`;
  }

  return `Hi ${name}! I'm your SkillSync assistant for ${role}. Your profile is ${ctx.completenessScore}% complete. Ask about proposals, projects, profile setup, or AI matching.`;
}

export function getAssistantResponse(
  question: string,
  ctx: WorkspaceAssistantContext
): string {
  const q = normalize(question);
  if (!q) {
    return "Type a question and I'll answer using your live workspace data.";
  }

  // Greetings (e.g. "hi", "hello", "hey")
  if (isShortGreeting(q)) {
    const first = ctx.user.name.trim().split(" ")[0];
    return first
      ? `Hi there, ${first}! How can I help you?`
      : "Hi there! How can I help you?";
  }

  if (includesAny(q, ["thank", "thanks", "thx"])) {
    return "You're welcome! Ask anytime if you need help with projects, proposals, or your profile.";
  }

  if (includesAny(q, ["help", "what can you", "what do you", "commands", "options"])) {
    return helpAnswer(ctx);
  }

  // Profile & completeness
  if (
    includesAny(q, [
      "profile",
      "complete",
      "completeness",
      "completion",
      "percent",
      "setup",
      "improve my profile",
    ])
  ) {
    return profileAnswer(ctx);
  }

  // Verification
  if (includesAny(q, ["verify", "verification", "verified", "identity", "badge"])) {
    if (ctx.completenessChecklist.verified) {
      return `You're verified (${ctx.user.verified.join(", ") || "Identity"}). Verified profiles get a boost in AI match scores.`;
    }
    return "You're not verified yet. Open Profile Completeness → Identity Verification, then use Student ID or LinkedIn. Verification improves trust and match ranking.";
  }

  // Skills
  if (includesAny(q, ["skill", "tags", "expertise"])) {
    const count = ctx.user.skills.length;
    const list = ctx.user.skills.slice(0, 8).join(", ") || "none yet";
    if (ctx.roleView === "freelancer" && count < 3) {
      return `You have ${count} skill${count === 1 ? "" : "s"} (${list}). Add skills in Profile Settings so clients can match you to jobs.`;
    }
    return `Your skills (${count}): ${list}. ${ctx.roleView === "client" ? "Required skills on your job posts are matched against freelancer profiles." : "These are matched against project requirements when you apply."}`;
  }

  // Portfolio
  if (includesAny(q, ["portfolio", "work sample", "showcase"])) {
    const n = ctx.user.portfolioItems.length;
    if (n === 0) {
      return "No portfolio items yet. Visit the Portfolio page from your dashboard to showcase your work.";
    }
    return `You have ${n} portfolio item${n === 1 ? "" : "s"}: ${ctx.user.portfolioItems.map((i) => i.title).join(", ")}.`;
  }

  // Role switching
  if (includesAny(q, ["switch role", "both", "client view", "freelancer view", "dual"])) {
    if (ctx.user.role === "both") {
      return `You're on a dual account. Use the Freelancer / Client toggle at the top of the dashboard — you're currently in ${ctx.roleView} view.`;
    }
    if (ctx.user.role === "client") {
      return "Your account is set to Client. To hire and freelance, you'd need a Both account (set at signup or contact support in a full product).";
    }
    if (ctx.user.role === "freelancer") {
      return "Your account is set to Freelancer. Post jobs from a Client or Both account to hire on SkillSync.";
    }
    return "Choose Freelancer, Client, or Both in Profile Completeness → Role to unlock the right dashboard tools.";
  }

  // Matching
  if (includesAny(q, ["match", "matching", "smart match", "ai match", "score", "fit"])) {
    const pool = ctx.talentPoolSize;
    if (ctx.roleView === "client") {
      return `SkillSync scores freelancers against your project's required skills, experience, verification, and profile strength. ${pool} freelancer${pool === 1 ? " is" : "s are"} on the platform. When someone applies, open Review & evaluate for AI metrics (skills overlap, experience fit, overall %).`;
    }
    return "When you apply, your match score is computed from skill overlap with the job, your experience, verification, and profile completeness. Stronger profiles and more matching skills mean higher scores.";
  }

  // Freelancer: apply
  if (
    ctx.roleView === "freelancer" &&
    includesAny(q, [
      "apply",
      "application",
      "how to get hired",
      "get a job",
      "submit proposal",
      "send proposal",
    ])
  ) {
    if (!ctx.myTalentId) {
      return "Add at least one skill on your profile first — that registers you in the talent pool. Then browse Projects and submit a proposal on any open job.";
    }
    return `${projectsSummary(ctx)}\n\nEach proposal needs a short message (20+ characters). You can optionally attach a portfolio image (JPEG/PNG/WebP) and a PDF resume. The client sees attachments with your AI match score.`;
  }

  // Freelancer: my applications status
  if (
    ctx.roleView === "freelancer" &&
    includesAny(q, [
      "my proposal",
      "my application",
      "application status",
      "proposal status",
      "did i apply",
    ])
  ) {
    return applicationsAnswer(ctx);
  }

  // Client: post project
  if (
    ctx.roleView === "client" &&
    includesAny(q, ["post", "create project", "new job", "hire", "posting"])
  ) {
    return 'Use "Post a Job" on your dashboard or go to /post-project. Add title, description, budget, deadline, and comma-separated required skills — matching uses those skills.';
  }

  // Client: proposals
  if (
    ctx.roleView === "client" &&
    includesAny(q, [
      "proposal",
      "applicant",
      "application received",
      "review",
      "approve",
      "deny",
      "reject",
      "hire",
      "candidate",
    ])
  ) {
    if (includesAny(q, ["approve", "deny", "reject", "how to review", "evaluate"])) {
      return `Open Received Proposals → Review & evaluate. You'll see the freelancer's message, AI summary, and metric bars. Use Approve or Deny while status is pending. ${proposalsReviewAnswer(ctx)}`;
    }
    return proposalsReviewAnswer(ctx);
  }

  // Projects (general)
  if (includesAny(q, ["project", "job", "gig", "contract", "open role"])) {
    return projectsSummary(ctx);
  }

  // Bio
  if (includesAny(q, ["bio", "about me", "description"])) {
    if (ctx.user.bio.trim()) {
      const preview =
        ctx.user.bio.length > 120 ? `${ctx.user.bio.slice(0, 117)}…` : ctx.user.bio;
      return `Your bio: “${preview}”`;
    }
    return "You haven't added a bio. A clear bio improves AI summaries when clients evaluate your proposals.";
  }

  // AI evaluator explanation
  if (includesAny(q, ["evaluat", "metric", "proposal evaluator", "ai summary"])) {
    return "Proposal evaluation combines the applicant's cover message with AI metrics: skills overlap, experience fit, profile strength, and overall match %. Clients use this on the Review & evaluate page before approving or denying.";
  }

  // Tasks / checklist
  if (includesAny(q, ["task", "checklist", "todo", "today focus", "hiring checklist"])) {
    return 'Your task checklist is below the main dashboard — add your own items under "Today\'s focus" or "Today\'s Hiring Checklist". It saves locally on your device.';
  }

  // Messages / notifications (hardcoded stat fix)
  if (includesAny(q, ["message", "notification", "inbox"])) {
    return "Messaging is coming soon. For now, use project Discussion on the project page and track proposals on your dashboard.";
  }

  // Fallback — try to be useful
  const missing = missingProfileSteps(ctx);
  if (missing.length > 0 && includesAny(q, ["how", "what should", "next step", "start"])) {
    return `Next steps: ${missing[0]}. Then ${ctx.roleView === "freelancer" ? "browse open projects and send a proposal" : "post a job and review incoming applications"}.`;
  }

  return [
    "I'm not sure I understood that. I answer from your real SkillSync data — not a generic chatbot.",
    helpAnswer(ctx),
  ].join("\n\n");
}
