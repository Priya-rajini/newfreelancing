import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { portfolioItems } from "../data/mockData";
import { RevealSection } from "../components/ui/RevealSection";
import { Play, Eye, Plus, Trash2 } from "lucide-react";
import { useUser, type PortfolioItem } from "../context/UserContext";
import { ProjectDetailsModal } from "../components/ui/ProjectDetailsModal";
import { AddProjectModal } from "../components/ui/AddProjectModal";

const sizeClasses: Record<string, string> = {
  tall: "row-span-2",
  wide: "col-span-2",
  square: "",
};

const categories = ["All", "Product", "Fintech", "AI", "SaaS", "Design"];

export function Portfolio() {
  const { user, removePortfolioItem } = useUser();
  const [hovered, setHovered] = useState<number | null>(null);
  
  // Filter state
  const [activeCategory, setActiveCategory] = useState("All");

  // Modal states
  const [selectedProject, setSelectedProject] = useState<PortfolioItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Combine mock items with user uploaded items
  const combinedItems = [...user.portfolioItems, ...portfolioItems];

  // Apply filters
  const filteredItems = activeCategory === "All"
    ? combinedItems
    : combinedItems.filter(
        (item) => item.category.toLowerCase() === activeCategory.toLowerCase()
      );

  const handleCardClick = (proj: PortfolioItem) => {
    setSelectedProject(proj);
    setIsDetailOpen(true);
  };

  return (
    <div className="pt-28 pb-24 min-h-screen bg-[var(--color-void)]">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <RevealSection>
            <p className="text-[13px] uppercase tracking-[0.15em] text-[var(--color-muted)] font-mono">Portfolio</p>
            <h1 className="text-display text-4xl md:text-5xl font-medium mt-4 max-w-lg">
              Work that speaks before the pitch.
            </h1>
          </RevealSection>

          {/* Add Showcase Button */}
          {user.isRegistered && (
            <RevealSection className="shrink-0">
              <button
                onClick={() => setIsAddOpen(true)}
                className="px-5 py-2.5 rounded-full bg-[var(--color-mint)] hover:bg-[var(--color-mint)]/95 text-black text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg"
              >
                <Plus size={14} /> Add Project to Gallery
              </button>
            </RevealSection>
          )}
        </div>

        {/* Filter Pills */}
        <RevealSection delay={0.1}>
          <div className="flex flex-wrap gap-2 mt-12 border-b border-white/5 pb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  activeCategory === cat
                    ? "border-[var(--color-warm)] bg-[var(--color-warm)]/10 text-white"
                    : "border-white/5 bg-white/[0.01] text-[var(--color-muted)] hover:border-white/10 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </RevealSection>

        {/* Project Grid */}
        {filteredItems.length === 0 ? (
          <div className="mt-16 border border-dashed border-white/10 rounded-2xl p-16 text-center text-sm text-[var(--color-muted)] bg-white/[0.005]">
            No showcase projects match this category. Upload one to get started!
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[200px] gap-3 md:gap-4">
            {filteredItems.map((item, i) => {
              const isCustom = user.portfolioItems.some((p) => p.id === item.id);
              return (
                <RevealSection
                  key={item.id}
                  delay={i * 0.03}
                  className={`${sizeClasses[item.size || "square"]} ${i === 2 ? "md:mt-8" : ""}`}
                >
                  <motion.article
                    className="relative h-full rounded-2xl overflow-hidden group cursor-pointer border border-white/5 hover:border-white/10"
                    onHoverStart={() => setHovered(item.id)}
                    onHoverEnd={() => setHovered(null)}
                    onClick={() => handleCardClick(item as PortfolioItem)}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                    {hovered === item.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/40"
                      >
                        <div className="h-12 w-12 rounded-full glass flex items-center justify-center">
                          <Play size={18} className="text-white ml-0.5" />
                        </div>
                      </motion.div>
                    )}

                    {/* Trash can for user custom projects */}
                    {isCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removePortfolioItem(item.id);
                        }}
                        className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-red-500/80 text-[var(--color-muted)] hover:text-white transition-all z-20"
                        title="Remove project"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 z-10">
                      <span className="text-[9px] uppercase tracking-wider text-[var(--color-warm)] font-mono">{item.category}</span>
                      <h3 className="font-medium mt-1 text-xs md:text-sm text-white truncate pr-4">{item.title}</h3>
                      <div className="flex gap-4 mt-2 text-[10px] text-[var(--color-muted)] font-mono">
                        <span className="flex items-center gap-1"><Eye size={10} /> {item.metrics?.views || "24k"}</span>
                        <span className="text-[var(--color-mint)]">{item.metrics?.conversion || "+18%"}</span>
                      </div>
                    </div>
                  </motion.article>
                </RevealSection>
              );
            })}
          </div>
        )}
      </div>

      {/* Verification / Details Modals */}
      <AnimatePresence>
        {isDetailOpen && selectedProject && (
          <ProjectDetailsModal
            isOpen={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
            project={selectedProject}
          />
        )}
        {isAddOpen && (
          <AddProjectModal
            isOpen={isAddOpen}
            onClose={() => setIsAddOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
