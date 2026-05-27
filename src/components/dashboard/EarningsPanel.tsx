import { useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "../../context/UserContext";
import { Wallet, Clock, ArrowDownToLine, CheckCircle2, Loader2 } from "lucide-react";

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function EarningsPanel() {
  const { user, requestWithdrawal } = useUser();
  const { earnings, withdrawals } = user;
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [method, setMethod] = useState("Bank transfer");
  const [success, setSuccess] = useState(false);

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount.replace(/[^0-9.]/g, ""));
    if (isNaN(amount) || amount <= 0) return;
    requestWithdrawal(amount, method);
    setWithdrawAmount("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-wider text-[var(--color-muted)] font-mono">
          Earnings tracker
        </p>
        <p className="text-sm text-[var(--color-muted)] mt-1">Simulated payouts — for demo purposes.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Total earned", value: earnings.total, icon: Wallet, accent: "var(--color-mint)" },
          { label: "Pending", value: earnings.pending, icon: Clock, accent: "var(--color-warm)" },
          { label: "Available", value: earnings.available, icon: ArrowDownToLine, accent: "var(--color-sky)" },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass rounded-xl p-5 border border-[var(--color-border)]"
          >
            <card.icon size={20} style={{ color: card.accent }} />
            <p className="text-[11px] text-[var(--color-muted)] mt-3 uppercase tracking-wider">{card.label}</p>
            <p className="text-2xl font-semibold mt-1">{formatMoney(card.value)}</p>
          </motion.div>
        ))}
      </div>

      <div className="glass rounded-xl p-6 border border-[var(--color-border)]">
        <h3 className="font-medium text-sm mb-4">Withdraw funds</h3>
        <form onSubmit={handleWithdraw} className="space-y-4 max-w-md">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-[var(--color-muted)] mb-1.5 block">
              Amount (max {formatMoney(earnings.available)})
            </label>
            <input
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="e.g. 1500"
              className="w-full bg-white/5 border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-warm)]/40"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-[var(--color-muted)] mb-1.5 block">
              Method
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full bg-white/5 border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm focus:outline-none"
            >
              <option value="Bank transfer">Bank transfer</option>
              <option value="PayPal">PayPal</option>
              <option value="Wise">Wise</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[var(--color-warm)] text-[#0a0a0b] text-sm font-medium hover:opacity-90"
          >
            Request withdrawal
          </button>
          {success && (
            <p className="text-sm text-[var(--color-mint)] flex items-center gap-1">
              <CheckCircle2 size={14} /> Withdrawal submitted — processing in 1–3 business days
            </p>
          )}
        </form>
      </div>

      <div>
        <h3 className="text-[11px] uppercase tracking-wider text-[var(--color-muted)] font-mono mb-4">
          Withdrawal history
        </h3>
        <div className="space-y-2">
          {withdrawals.map((w) => (
            <div
              key={w.id}
              className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl glass border border-[var(--color-border)]"
            >
              <div>
                <p className="font-medium text-sm">{formatMoney(w.amount)}</p>
                <p className="text-[11px] text-[var(--color-muted)]">
                  {w.method} · {w.date}
                </p>
              </div>
              <span
                className={`text-[10px] px-2.5 py-1 rounded-full font-mono uppercase flex items-center gap-1 ${
                  w.status === "completed"
                    ? "bg-[var(--color-mint)]/10 text-[var(--color-mint)]"
                    : w.status === "processing"
                    ? "bg-[var(--color-warm)]/10 text-[var(--color-warm)]"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {w.status === "processing" && <Loader2 size={10} className="animate-spin" />}
                {w.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
