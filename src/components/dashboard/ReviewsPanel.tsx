import { motion } from "framer-motion";
import { useUser } from "../../context/UserContext";
import { Star } from "lucide-react";

export function ReviewsPanel() {
  const { user } = useUser();
  const avg =
    user.clientReviews.length > 0
      ? user.clientReviews.reduce((a, r) => a + r.rating, 0) / user.clientReviews.length
      : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[var(--color-muted)] font-mono">
            Reviews received
          </p>
          <p className="text-sm text-[var(--color-muted)] mt-1">Feedback from past clients on SkillSync.</p>
        </div>
        <div className="glass rounded-xl px-5 py-3 flex items-center gap-3">
          <span className="text-3xl font-semibold text-display">{avg.toFixed(1)}</span>
          <div>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < Math.round(avg)
                      ? "fill-[var(--color-warm)] text-[var(--color-warm)]"
                      : "text-white/10"
                  }
                />
              ))}
            </div>
            <p className="text-[10px] text-[var(--color-muted)] mt-0.5">
              {user.clientReviews.length} reviews
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {user.clientReviews.map((review, i) => (
          <motion.article
            key={review.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass rounded-xl p-6 border border-[var(--color-border)]"
            style={{ marginLeft: i % 2 === 1 ? 16 : 0, maxWidth: i % 2 === 1 ? "calc(100% - 16px)" : "100%" }}
          >
            <div className="flex flex-wrap justify-between gap-2 mb-3">
              <div>
                <p className="font-medium">{review.author}</p>
                <p className="text-[11px] text-[var(--color-muted)]">{review.company}</p>
              </div>
              <div className="text-right">
                <div className="flex gap-0.5 justify-end">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <Star key={j} size={12} className="fill-[var(--color-warm)] text-[var(--color-warm)]" />
                  ))}
                </div>
                <p className="text-[10px] text-[var(--color-muted)] mt-1">{review.date}</p>
              </div>
            </div>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">"{review.text}"</p>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
