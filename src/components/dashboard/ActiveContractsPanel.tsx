import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, type DeliverableStatus } from "../../context/UserContext";
import {
  Upload,
  MessageSquare,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Send,
  ChevronDown,
} from "lucide-react";

const statusOptions: { value: DeliverableStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "submitted", label: "Submitted" },
  { value: "approved", label: "Approved" },
];

const statusColors: Record<DeliverableStatus, string> = {
  pending: "text-[var(--color-muted)]",
  submitted: "text-[var(--color-sky)]",
  approved: "text-[var(--color-mint)]",
};

export function ActiveContractsPanel() {
  const { user, updateDeliverableStatus, uploadContractFile, sendContractMessage } = useUser();
  const [expandedId, setExpandedId] = useState(user.contracts[0]?.id ?? "");
  const [messageDraft, setMessageDraft] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);

  const handleFileUpload = (contractId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(contractId);
    setTimeout(() => {
      const size =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;
      uploadContractFile(contractId, file.name, size);
      setUploading(null);
      e.target.value = "";
    }, 600);
  };

  const sendMessage = (contractId: string) => {
    const text = messageDraft[contractId]?.trim();
    if (!text) return;
    sendContractMessage(contractId, text);
    setMessageDraft((d) => ({ ...d, [contractId]: "" }));
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-wider text-[var(--color-muted)] font-mono">
          Active contracts
        </p>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Manage deliverables, upload files, and message clients.
        </p>
      </div>

      {user.contracts.map((contract) => {
        const open = expandedId === contract.id;
        return (
          <div key={contract.id} className="glass rounded-xl overflow-hidden border border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => setExpandedId(open ? "" : contract.id)}
              className="w-full p-5 flex items-start justify-between gap-4 text-left hover:bg-white/[0.02] transition-colors"
            >
              <div>
                <h3 className="font-medium">{contract.projectTitle}</h3>
                <p className="text-sm text-[var(--color-muted)] mt-0.5">
                  {contract.clientName}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] text-[var(--color-muted)]">{contract.budget}</span>
                <ChevronDown
                  size={18}
                  className={`text-[var(--color-muted)] transition-transform ${open ? "rotate-180" : ""}`}
                />
              </div>
            </button>

            <div className="px-5 pb-2">
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[var(--color-warm)] to-[var(--color-mint)]"
                  animate={{ width: `${contract.progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-[10px] text-[var(--color-muted)] mt-1.5 flex items-center gap-1">
                <Clock size={10} /> Due {contract.dueDate} · {contract.progress}% complete
              </p>
            </div>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-[var(--color-border)]"
                >
                  <div className="p-5 space-y-8">
                    {/* Deliverables */}
                    <div>
                      <h4 className="text-[11px] uppercase tracking-wider text-[var(--color-muted)] font-mono mb-3">
                        Deliverables
                      </h4>
                      <ul className="space-y-2">
                        {contract.deliverables.map((d) => (
                          <li
                            key={d.id}
                            className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 rounded-lg bg-white/[0.02] border border-white/5"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {d.status === "approved" ? (
                                <CheckCircle2 size={16} className="text-[var(--color-mint)] shrink-0" />
                              ) : (
                                <Circle size={16} className="text-[var(--color-muted)] shrink-0" />
                              )}
                              <span className="text-sm truncate">{d.title}</span>
                            </div>
                            <select
                              value={d.status}
                              onChange={(e) =>
                                updateDeliverableStatus(
                                  contract.id,
                                  d.id,
                                  e.target.value as DeliverableStatus
                                )
                              }
                              className={`text-xs bg-white/5 border border-[var(--color-border)] rounded-lg px-2 py-1.5 focus:outline-none capitalize ${statusColors[d.status]}`}
                            >
                              {statusOptions.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-[var(--color-elevated)]">
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Files */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-[11px] uppercase tracking-wider text-[var(--color-muted)] font-mono">
                          Files
                        </h4>
                        <label className="cursor-pointer text-[11px] flex items-center gap-1 text-[var(--color-warm)] hover:underline">
                          <Upload size={12} />
                          {uploading === contract.id ? "Uploading…" : "Upload file"}
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileUpload(contract.id, e)}
                          />
                        </label>
                      </div>
                      {contract.files.length === 0 ? (
                        <p className="text-xs text-[var(--color-muted)]">No files uploaded yet.</p>
                      ) : (
                        <ul className="space-y-2">
                          {contract.files.map((f) => (
                            <li
                              key={f.id}
                              className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] text-sm"
                            >
                              <FileText size={16} className="text-[var(--color-muted)] shrink-0" />
                              <span className="flex-1 truncate">{f.name}</span>
                              <span className="text-[10px] text-[var(--color-muted)]">
                                {f.size} · {f.uploadedAt}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Messages */}
                    <div>
                      <h4 className="text-[11px] uppercase tracking-wider text-[var(--color-muted)] font-mono mb-3 flex items-center gap-1">
                        <MessageSquare size={12} /> Client chat
                      </h4>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto mb-3 pr-1">
                        {contract.messages.map((m) => (
                          <div
                            key={m.id}
                            className={`text-sm p-3 rounded-xl max-w-[85%] ${
                              m.from === "freelancer"
                                ? "ml-auto bg-[var(--color-warm)]/15 text-[var(--color-text)]"
                                : "bg-white/[0.04] text-[var(--color-muted)]"
                            }`}
                          >
                            <p className="text-[10px] opacity-60 mb-1">
                              {m.from === "client" ? contract.clientName : "You"} · {m.time}
                            </p>
                            {m.text}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={messageDraft[contract.id] ?? ""}
                          onChange={(e) =>
                            setMessageDraft((d) => ({ ...d, [contract.id]: e.target.value }))
                          }
                          onKeyDown={(e) => e.key === "Enter" && sendMessage(contract.id)}
                          placeholder={`Message ${contract.clientName}…`}
                          className="flex-1 bg-white/5 border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-warm)]/40"
                        />
                        <button
                          type="button"
                          onClick={() => sendMessage(contract.id)}
                          className="p-2.5 rounded-xl bg-[var(--color-warm)] text-[#0a0a0b]"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="text-xs text-[var(--color-muted)] hover:text-[var(--color-warm)]"
                    >
                      Contract details →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
