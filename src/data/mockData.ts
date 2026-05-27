export const freelancers = [
  {
    id: "maya-chen",
    name: "Maya Chen",
    role: "Product Designer",
    rate: "$95/hr",
    match: 94,
    location: "Tokyo",
    avatar: "MC",
    color: "#e8a87c",
    skills: ["Figma", "Design Systems", "Motion", "UI Design", "UX Design"],
    verified: ["UI/UX", "Accessibility"],
    bio: "Former Stripe design lead. I craft interfaces that feel inevitable.",
    experience: 6,
    rating: 4.9,
  },
  {
    id: "james-okafor",
    name: "James Okafor",
    role: "Full-stack Engineer",
    rate: "$120/hr",
    match: 91,
    location: "Lagos",
    avatar: "JO",
    color: "#6ee7b7",
    skills: ["React", "Node", "PostgreSQL"],
    verified: ["Verified React Developer", "System Design"],
    bio: "Built payment infra for 3 fintech startups. Performance obsessed.",
    experience: 5,
    rating: 4.8,
  },
  {
    id: "elena-voss",
    name: "Elena Voss",
    role: "ML Engineer",
    rate: "$140/hr",
    match: 88,
    location: "Berlin",
    avatar: "EV",
    color: "#7dd3fc",
    skills: ["PyTorch", "LLMs", "MLOps", "Python", "NLP", "Machine Learning"],
    verified: ["Python", "NLP"],
    bio: "Shipped recommendation engines used by 12M users.",
    experience: 4,
    rating: 4.7,
  },
  {
    id: "sam-rivera",
    name: "Sam Rivera",
    role: "Brand Strategist",
    rate: "$85/hr",
    match: 86,
    location: "Mexico City",
    avatar: "SR",
    color: "#f472b6",
    skills: ["Positioning", "Copy", "Research", "Branding", "Marketing"],
    verified: ["Brand Voice"],
    bio: "Helped 8 YC companies find their narrative before Series A.",
    experience: 7,
    rating: 4.6,
  },
  {
    id: "alex-kim",
    name: "Alex Kim",
    role: "Frontend Engineer",
    rate: "$75/hr",
    match: 80,
    location: "Seoul",
    avatar: "AK",
    color: "#c084fc",
    skills: ["React", "TypeScript", "Tailwind CSS", "CSS", "HTML", "Figma"],
    verified: ["React", "CSS"],
    bio: "Pixel-perfect frontend developer. Specialized in fluid animations and interactive experiences.",
    experience: 2,
    rating: 4.4,
  },
  {
    id: "li-wei",
    name: "Li Wei",
    role: "Backend Architect",
    rate: "$110/hr",
    match: 85,
    location: "Singapore",
    avatar: "LW",
    color: "#fb923c",
    skills: ["Node", "Express", "PostgreSQL", "MongoDB", "Redis", "Docker", "Go", "TypeScript"],
    verified: ["System Design", "Node"],
    bio: "High performance systems architect. I scale databases and API gateways.",
    experience: 8,
    rating: 4.9,
  }
];

export const liveHiring = [
  { client: "Arcadia Labs", role: "Senior React Dev", time: "2m ago", budget: "$8k" },
  { client: "Northwind", role: "Brand Identity", time: "5m ago", budget: "$4.2k" },
  { client: "Helix AI", role: "ML Pipeline", time: "8m ago", budget: "$15k" },
  { client: "Bloom Studio", role: "Motion Design", time: "12m ago", budget: "$3.5k" },
  { client: "Vault Finance", role: "Security Audit", time: "18m ago", budget: "$12k" },
];

/** Active engagements (freelancer already hired) */
export const projects: any[] = [];

/** Open listings freelancers can browse and submit proposals to */
export const openProjects: any[] = [];

export function getOpenProject(id: string) {
  return openProjects.find((p) => p.id === id);
}

export const portfolioItems = [
  { id: 1, title: "Arc Browser Onboarding", category: "Product", size: "tall", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80", metrics: { views: "24k", conversion: "+18%" } },
  { id: 2, title: "Stripe Atlas Flow", category: "Fintech", size: "wide", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80", metrics: { views: "41k", conversion: "+32%" } },
  { id: 3, title: "Notion AI Sidebar", category: "SaaS", size: "square", image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&q=80", metrics: { views: "18k", conversion: "+12%" } },
  { id: 4, title: "Linear Roadmap", category: "DevTools", size: "square", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80", metrics: { views: "31k", conversion: "+24%" } },
  { id: 5, title: "Framer Motion Kit", category: "Design", size: "wide", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80", metrics: { views: "52k", conversion: "+41%" } },
  { id: 6, title: "GitHub Copilot UX", category: "AI", size: "tall", image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80", metrics: { views: "67k", conversion: "+28%" } },
];

export const communityPosts = [
  { id: 1, author: "Maya Chen", channel: "design-systems", title: "How do you handle token versioning across teams?", votes: 142, comments: 38, time: "3h" },
  { id: 2, author: "James Okafor", channel: "backend", title: "Postgres vs ClickHouse for event analytics at scale", votes: 89, comments: 56, time: "5h" },
  { id: 3, author: "Elena Voss", channel: "ai-ml", title: "RAG pipeline patterns that actually work in production", votes: 234, comments: 71, time: "8h" },
];

export const weeklyChallenge = {
  title: "Reimagine the Freelancer Onboarding Flow",
  prize: "$2,500",
  entries: 847,
  deadline: "6 days left",
  sponsor: "SkillSync Labs",
};

export const milestones = [
  { id: 1, title: "Discovery & Research", date: "Apr 2", status: "done", desc: "User interviews, competitive audit" },
  { id: 2, title: "Wireframes v1", date: "Apr 18", status: "done", desc: "Low-fi flows for 12 core screens" },
  { id: 3, title: "Visual Design", date: "May 10", status: "active", desc: "High-fidelity UI, design tokens" },
  { id: 4, title: "Prototype & Handoff", date: "Jun 5", status: "upcoming", desc: "Interactive prototype, dev specs" },
];

export const reviews = [
  { client: "Vault Finance", rating: 5, text: "Maya delivered beyond expectations. The dashboard feels premium and intuitive.", date: "Mar 2026" },
  { client: "Helix AI", rating: 5, text: "Incredible attention to micro-interactions. Our NPS jumped 23 points.", date: "Jan 2026" },
];

export const skillGraph = [
  { skill: "UI Design", level: 95 },
  { skill: "Design Systems", level: 92 },
  { skill: "Prototyping", level: 88 },
  { skill: "User Research", level: 85 },
  { skill: "Motion Design", level: 78 },
  { skill: "Frontend", level: 65 },
];
