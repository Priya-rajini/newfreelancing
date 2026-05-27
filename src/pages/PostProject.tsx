import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, Sparkles, FolderPlus, DollarSign, Calendar, ListFilter } from "lucide-react";
import { useProjects, type ProjectType } from "../context/ProjectContext";
import { useUser } from "../context/UserContext";

export function PostProject() {
  const { addProject } = useProjects();
  const { user } = useUser();
  const navigate = useNavigate();

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [projectType, setProjectType] = useState<ProjectType>("Fixed");

  // UX states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Project title is required";
    else if (title.trim().length < 5) newErrors.title = "Title must be at least 5 characters";

    if (!description.trim()) newErrors.description = "Project description is required";
    else if (description.trim().length < 20) newErrors.description = "Description must be at least 20 characters";

    if (!skillsInput.trim()) newErrors.skills = "At least one required skill is required";
    
    if (!budget) newErrors.budget = "Project budget is required";
    else if (Number(budget) <= 0) newErrors.budget = "Budget must be greater than 0";

    if (!deadline) newErrors.deadline = "Submission deadline is required";
    else {
      const selectedDate = new Date(deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.deadline = "Deadline cannot be in the past";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate clean visual transition
    setTimeout(() => {
      const skillsArray = skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      addProject({
        title: title.trim(),
        description: description.trim(),
        requiredSkills: skillsArray,
        budget: Number(budget),
        deadline,
        projectType,
        clientName: user.name || "Client",
        clientEmail: user.email || "client@example.com",
      });

      setIsSubmitting(false);
      setShowSuccess(true);

      // Auto redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 2500);
    }, 1200);
  };

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[var(--color-void)] relative overflow-hidden">
      {/* Ambient background glows */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] rounded-full blur-[140px] opacity-10 pointer-events-none transition-colors duration-500"
        style={{ backgroundColor: user.color }}
      />

      <div className="mx-auto max-w-2xl px-4 md:px-6 relative z-10">
        {/* Back Link */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-xs text-[var(--color-muted)] hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </Link>

        <AnimatePresence mode="wait">
          {!showSuccess ? (
            <motion.div
              key="post-project-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-strong rounded-2xl p-6 md:p-8 border border-white/5 shadow-2xl relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-8 pb-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center border transition-colors duration-300"
                    style={{
                      backgroundColor: `${user.color}15`,
                      borderColor: `${user.color}35`,
                      color: user.color,
                    }}
                  >
                    <FolderPlus size={20} />
                  </div>
                  <div>
                    <h1 className="text-display text-xl md:text-2xl font-semibold text-white">Post a New Project</h1>
                    <p className="text-[var(--color-muted)] text-xs">Reach verified freelancers using AI matching</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded bg-white/5 text-[var(--color-muted)]">
                  <Sparkles size={10} className="text-[var(--color-warm)]" style={{ color: user.color }} />
                  AI ASSISTED POSTING
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Project Title */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[var(--color-muted)] mb-2 font-mono flex items-center gap-1.5">
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
                    }}
                    placeholder="e.g. Design responsive UI for SaaS dashboard"
                    className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-warm)]/40 transition-colors ${
                      errors.title ? "border-red-500/50 focus:border-red-500" : "border-white/10"
                    }`}
                    style={{
                      borderColor: errors.title ? "" : "rgba(255,255,255,0.1)",
                    }}
                  />
                  {errors.title && <p className="text-[11px] text-red-400 mt-1">{errors.title}</p>}
                </div>

                {/* Project Description */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[var(--color-muted)] mb-2 font-mono">
                    Project Description
                  </label>
                  <textarea
                    rows={5}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (errors.description) setErrors((prev) => ({ ...prev, description: "" }));
                    }}
                    placeholder="Outline the scope of work, key deliverables, and client goals. Provide context to get high quality matches."
                    className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-warm)]/40 transition-colors ${
                      errors.description ? "border-red-500/50 focus:border-red-500" : "border-white/10"
                    }`}
                    style={{
                      borderColor: errors.description ? "" : "rgba(255,255,255,0.1)",
                    }}
                  />
                  {errors.description && <p className="text-[11px] text-red-400 mt-1">{errors.description}</p>}
                </div>

                {/* Required Skills */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[var(--color-muted)] mb-2 font-mono">
                    Required Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    value={skillsInput}
                    onChange={(e) => {
                      setSkillsInput(e.target.value);
                      if (errors.skills) setErrors((prev) => ({ ...prev, skills: "" }));
                    }}
                    placeholder="e.g. React, Figma, Tailwind CSS, TypeScript"
                    className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-warm)]/40 transition-colors ${
                      errors.skills ? "border-red-500/50 focus:border-red-500" : "border-white/10"
                    }`}
                    style={{
                      borderColor: errors.skills ? "" : "rgba(255,255,255,0.1)",
                    }}
                  />
                  <p className="text-[10px] text-[var(--color-muted)] mt-1.5">
                    Separated with commas. We will match this against freelancer skill tags.
                  </p>
                  {errors.skills && <p className="text-[11px] text-red-400 mt-1">{errors.skills}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Budget */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[var(--color-muted)] mb-2 font-mono flex items-center gap-1.5">
                      <DollarSign size={12} /> Budget (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--color-muted)]">$</span>
                      <input
                        type="number"
                        min="1"
                        value={budget}
                        onChange={(e) => {
                          setBudget(e.target.value);
                          if (errors.budget) setErrors((prev) => ({ ...prev, budget: "" }));
                        }}
                        placeholder="e.g. 5000"
                        className={`w-full bg-white/5 border rounded-xl pl-8 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-warm)]/40 transition-colors ${
                          errors.budget ? "border-red-500/50 focus:border-red-500" : "border-white/10"
                        }`}
                        style={{
                          borderColor: errors.budget ? "" : "rgba(255,255,255,0.1)",
                        }}
                      />
                    </div>
                    {errors.budget && <p className="text-[11px] text-red-400 mt-1">{errors.budget}</p>}
                  </div>

                  {/* Deadline */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[var(--color-muted)] mb-2 font-mono flex items-center gap-1.5">
                      <Calendar size={12} /> Deadline
                    </label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => {
                        setDeadline(e.target.value);
                        if (errors.deadline) setErrors((prev) => ({ ...prev, deadline: "" }));
                      }}
                      className={`w-full bg-white/5 border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-warm)]/40 transition-colors ${
                        errors.deadline ? "border-red-500/50 focus:border-red-500" : "border-white/10"
                      }`}
                      style={{
                        borderColor: errors.deadline ? "" : "rgba(255,255,255,0.1)",
                      }}
                    />
                    {errors.deadline && <p className="text-[11px] text-red-400 mt-1">{errors.deadline}</p>}
                  </div>

                  {/* Project Type */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[var(--color-muted)] mb-2 font-mono flex items-center gap-1.5">
                      <ListFilter size={12} /> Project Type
                    </label>
                    <select
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value as ProjectType)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-warm)]/40 transition-colors select-custom"
                      style={{ borderColor: "rgba(255,255,255,0.1)" }}
                    >
                      <option value="Fixed" className="bg-[#121214] text-white">Fixed Price</option>
                      <option value="Hourly" className="bg-[#121214] text-white">Hourly Rate</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex gap-4">
                  <Link
                    to="/dashboard"
                    className="flex-1 py-3 rounded-xl border border-white/5 text-center text-sm font-semibold text-[var(--color-muted)] hover:text-white hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 rounded-xl font-semibold text-sm text-black hover:opacity-90 transition-opacity flex items-center justify-center gap-2 relative overflow-hidden"
                    style={{
                      backgroundColor: user.color,
                      boxShadow: `0 0 20px ${user.color}35`,
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      "Publish Project"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="post-project-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="glass-strong rounded-2xl p-8 md:p-12 border border-white/5 shadow-2xl text-center space-y-6 relative overflow-hidden"
            >
              <div 
                className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle at center, ${user.color}10 0%, transparent 70%)`
                }}
              />

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="h-16 w-16 mx-auto flex items-center justify-center rounded-full"
                style={{
                  backgroundColor: `${user.color}20`,
                  color: user.color,
                }}
              >
                <CheckCircle2 size={36} />
              </motion.div>

              <div className="space-y-2">
                <h2 className="text-display text-2xl font-bold text-white">Project Posted Successfully!</h2>
                <p className="text-[var(--color-muted)] text-sm max-w-sm mx-auto">
                  Your project has been indexed. Matching AI models are screening freelancer profiles now.
                </p>
              </div>

              <div className="pt-6 border-t border-white/5 max-w-xs mx-auto">
                <div className="text-[11px] text-[var(--color-muted)] font-mono flex items-center justify-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-mint)] animate-pulse" />
                  Redirecting to dashboard...
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
