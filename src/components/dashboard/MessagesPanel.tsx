import { useState } from "react";
import { useUser } from "../../context/UserContext";
import { MessageSquare, Send } from "lucide-react";

export function MessagesPanel() {
  const { user, sendContractMessage } = useUser();
  const [activeContract, setActiveContract] = useState(user.contracts[0]?.id ?? "");
  const [draft, setDraft] = useState("");

  const contract = user.contracts.find((c) => c.id === activeContract);

  const send = () => {
    if (!contract || !draft.trim()) return;
    sendContractMessage(contract.id, draft.trim());
    setDraft("");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-wider text-[var(--color-muted)] font-mono">Messages</p>
        <p className="text-sm text-[var(--color-muted)] mt-1">All client conversations from active contracts.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {user.contracts.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiveContract(c.id)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              activeContract === c.id
                ? "border-[var(--color-warm)]/40 bg-[var(--color-warm)]/10 text-[var(--color-warm)]"
                : "border-[var(--color-border)] text-[var(--color-muted)]"
            }`}
          >
            {c.clientName}
          </button>
        ))}
      </div>

      {contract ? (
        <div className="glass rounded-xl border border-[var(--color-border)] flex flex-col min-h-[400px]">
          <div className="p-4 border-b border-[var(--color-border)]">
            <p className="font-medium text-sm">{contract.projectTitle}</p>
            <p className="text-[11px] text-[var(--color-muted)]">{contract.clientName}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[320px]">
            {contract.messages.map((m) => (
              <div
                key={m.id}
                className={`text-sm p-3 rounded-xl max-w-[80%] ${
                  m.from === "freelancer"
                    ? "ml-auto bg-[var(--color-warm)]/15"
                    : "bg-white/[0.04] text-[var(--color-muted)]"
                }`}
              >
                {m.text}
                <p className="text-[10px] opacity-50 mt-1">{m.time}</p>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-[var(--color-border)] flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message…"
              className="flex-1 bg-white/5 border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none"
            />
            <button type="button" onClick={send} className="p-2.5 rounded-xl bg-[var(--color-warm)] text-[#0a0a0b]">
              <Send size={16} />
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[var(--color-muted)] flex items-center gap-2">
          <MessageSquare size={16} /> No active contracts
        </p>
      )}
    </div>
  );
}
