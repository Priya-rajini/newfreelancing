import { motion } from "framer-motion";
import { X, ExternalLink, Eye, TrendingUp } from "lucide-react";
import { type PortfolioItem } from "../../context/UserContext";

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: PortfolioItem | null;
}

export function ProjectDetailsModal({ isOpen, onClose, project }: ProjectDetailsModalProps) {
  if (!isOpen || !project) return null;

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

      {/* Detail Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl glass-strong border border-white/10 shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-black/40 hover:bg-white/10 text-white z-20 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Project Image Panel */}
        <div className="md:w-1/2 relative h-48 md:h-auto min-h-[200px] bg-white/5">
          <img
            src={project.image}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-black/10 to-transparent" />
          <span className="absolute bottom-4 left-4 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded bg-black/40 border border-white/5 font-mono text-[var(--color-warm)]">
            {project.category}
          </span>
        </div>

        {/* Content Panel */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            <h2 className="text-display text-xl font-bold text-white mb-2 pr-6">
              {project.title}
            </h2>
            
            {/* Metrics */}
            <div className="flex gap-4 mb-4 text-xs font-mono text-[var(--color-muted)]">
              <span className="flex items-center gap-1">
                <Eye size={12} /> {project.metrics?.views || "0"} views
              </span>
              <span className="flex items-center gap-1 text-[var(--color-mint)]">
                <TrendingUp size={12} /> {project.metrics?.conversion || "+0%"}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs text-[var(--color-muted)] leading-relaxed mb-6">
              {project.description || "No description provided for this work piece."}
            </p>

            {/* Tech chips */}
            {project.techUsed && project.techUsed.length > 0 && (
              <div className="mb-6">
                <div className="text-[10px] uppercase tracking-wider text-[var(--color-muted)] mb-2 font-mono">
                  Tech & Tools Used
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {project.techUsed.map((tech) => (
                    <span
                      key={tech}
                      className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[var(--color-text)] font-semibold"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Link */}
          <div className="pt-4 border-t border-white/5 flex justify-end">
            <a
              href={project.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all"
            >
              Open Live Link
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
