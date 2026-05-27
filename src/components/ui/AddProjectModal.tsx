import React, { useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "../../context/UserContext";
import { X, Briefcase, Plus, Image as ImageIcon } from "lucide-react";

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockImages = [
  { url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80", label: "Gradient Abstract" },
  { url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80", label: "Fintech Dashboard" },
  { url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80", label: "AI Neural Network" },
  { url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80", label: "SaaS Workspace" },
];

export function AddProjectModal({ isOpen, onClose }: AddProjectModalProps) {
  const { addDetailedPortfolioItem } = useUser();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Product");
  const [techString, setTechString] = useState("");
  const [link, setLink] = useState("");
  const [image, setImage] = useState(mockImages[0].url);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter a project title.");
      return;
    }

    if (!description.trim()) {
      setError("Please write a short description.");
      return;
    }

    // Split and trim tech list
    const techUsed = techString
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (techUsed.length === 0) {
      setError("Please enter at least one tool/technology tag.");
      return;
    }

    addDetailedPortfolioItem(
      title.trim(),
      description.trim(),
      category,
      techUsed,
      image,
      link.trim() || "#"
    );

    // Reset fields
    setTitle("");
    setDescription("");
    setCategory("Product");
    setTechString("");
    setLink("");
    setImage(mockImages[0].url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl glass-strong border border-white/10 p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/5 text-[var(--color-muted)] hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-[var(--color-mint)]/10 border border-[var(--color-mint)]/20 flex items-center justify-center text-[var(--color-mint)]">
            <Briefcase size={20} />
          </div>
          <div>
            <h2 className="text-display text-xl font-semibold leading-none">Add Portfolio Project</h2>
            <p className="text-[var(--color-muted)] text-xs mt-1">
              Add your work details to update your gallery and completeness score.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[var(--color-muted)] mb-2 font-mono">
              Project Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Helix AI Onboarding Redesign"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[var(--color-mint)]/40"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[var(--color-muted)] mb-2 font-mono">
              Project Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem, your solution, and the overall impact of this work..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[var(--color-mint)]/40 resize-none"
              rows={3}
            />
          </div>

          {/* Category & Link */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[var(--color-muted)] mb-2 font-mono">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[var(--color-mint)]/40"
              >
                {["Product", "Fintech", "AI", "SaaS", "Web", "Design"].map((cat) => (
                  <option key={cat} value={cat} className="bg-[var(--color-surface)]">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[var(--color-muted)] mb-2 font-mono">
                External Project URL
              </label>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://mywork.com/project"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[var(--color-mint)]/40"
              />
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[var(--color-muted)] mb-2 font-mono">
              Technologies / Tools (comma-separated)
            </label>
            <input
              type="text"
              value={techString}
              onChange={(e) => setTechString(e.target.value)}
              placeholder="e.g. React, Figma, TailwindCSS, Framer Motion"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[var(--color-mint)]/40"
            />
          </div>

          {/* Image Chooser */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[var(--color-muted)] mb-2 flex items-center gap-1.5 font-mono">
              <ImageIcon size={12} /> Project Mockup Banner
            </label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {mockImages.map((img) => (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => setImage(img.url)}
                  className={`p-2 rounded-lg border text-left text-[10px] transition-all flex items-center gap-2 overflow-hidden truncate ${
                    image === img.url
                      ? "border-[var(--color-mint)] bg-[var(--color-mint)]/10 text-white"
                      : "border-white/5 bg-white/[0.01] text-[var(--color-muted)] hover:border-white/10"
                  }`}
                >
                  <img src={img.url} alt="" className="h-6 w-6 rounded object-cover shrink-0" />
                  <span className="truncate">{img.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Image URL Option */}
          <div>
            <label className="block text-[9px] uppercase tracking-wider text-[var(--color-muted)] mb-1 font-mono">
              Or Paste Custom Image URL
            </label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://unsplash.com/..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] text-white focus:outline-none"
            />
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-950/20 border border-red-900/30 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs rounded-full border border-white/10 text-[var(--color-muted)] hover:text-white hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-xs font-semibold rounded-full bg-[var(--color-mint)] text-black hover:opacity-90 transition-all flex items-center gap-1.5"
            >
              <Plus size={14} />
              Publish Showcase
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
