export const defaultContracts = [
  {
    id: "contract-vault",
    projectId: "vault-redesign",
    title: "Fintech Dashboard Redesign",
    client: "Vault Finance",
    clientContact: "Alex Chen",
    budget: "$12,400",
    progress: 68,
    due: "Jun 12",
    deliverables: [
      { id: "d1", title: "Discovery & user flows", status: "approved", dueDate: "Apr 18" },
      { id: "d2", title: "High-fidelity UI screens", status: "in_progress", dueDate: "May 28" },
      { id: "d3", title: "Design system handoff", status: "pending", dueDate: "Jun 5" },
      { id: "d4", title: "Interactive prototype", status: "pending", dueDate: "Jun 12" },
    ],
    files: [
      { id: "f1", name: "vault-dashboard-v2.fig", size: "4.2 MB", uploadedAt: "May 18" },
      { id: "f2", name: "component-specs.pdf", size: "890 KB", uploadedAt: "May 20" },
    ],
    messages: [
      { id: "m1", from: "client", text: "Love the direction on transfers. Can we explore a denser table variant?", time: "Yesterday 4:12 PM" },
      { id: "m2", from: "freelancer", text: "Absolutely — I'll add a compact view toggle in the next iteration.", time: "Yesterday 6:30 PM" },
    ],
  },
  {
    id: "contract-helix",
    projectId: "helix-chat",
    title: "AI Chat Widget",
    client: "Helix AI",
    clientContact: "Priya N.",
    budget: "$8,200",
    progress: 92,
    due: "May 28",
    deliverables: [
      { id: "d5", title: "Widget UI components", status: "approved", dueDate: "May 10" },
      { id: "d6", title: "Integration docs", status: "submitted", dueDate: "May 22" },
      { id: "d7", title: "QA & polish pass", status: "in_progress", dueDate: "May 28" },
    ],
    files: [
      { id: "f3", name: "chat-widget-bundle.zip", size: "1.1 MB", uploadedAt: "May 21" },
    ],
    messages: [
      { id: "m3", from: "client", text: "QA found a focus trap issue on mobile — can you prioritize?", time: "Today 9:15 AM" },
    ],
  },
];

export const defaultEarnings = {
  totalEarned: 28450,
  pending: 3200,
  available: 5240,
};

export const defaultWithdrawals = [
  { id: "w1", amount: 4500, date: "Apr 28, 2026", status: "completed", method: "Bank transfer" },
  { id: "w2", amount: 2800, date: "Mar 15, 2026", status: "completed", method: "PayPal" },
  { id: "w3", amount: 1500, date: "May 20, 2026", status: "processing", method: "Bank transfer" },
];

export const defaultClientReviews = [
  {
    id: "r1",
    client: "Vault Finance",
    project: "Fintech Dashboard Redesign",
    rating: 5,
    text: "Maya delivered beyond expectations. The dashboard feels premium and our team adopted it within a week.",
    date: "Mar 2026",
  },
  {
    id: "r2",
    client: "Helix AI",
    project: "AI Chat Widget",
    rating: 5,
    text: "Incredible attention to micro-interactions. Our NPS jumped 23 points after launch.",
    date: "Jan 2026",
  },
  {
    id: "r3",
    client: "Bloom Studio",
    project: "Brand System v1",
    rating: 4,
    text: "Strong visual direction. Communication was clear; we'd hire again for motion work.",
    date: "Nov 2025",
  },
];
