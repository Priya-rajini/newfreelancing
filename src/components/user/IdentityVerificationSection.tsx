import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Upload,
  Link2,
  Loader2,
  FileText,
} from "lucide-react";
import { useUser, type VerificationMethod } from "../../context/UserContext";
import { useToast } from "../../context/ToastContext";
import { VerificationModal } from "../ui/VerificationModal";

export function IdentityVerificationSection() {
  const { user, startVerification } = useUser();
  const { showToast } = useToast();
  const [method, setMethod] = useState<VerificationMethod>(null);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const status = user.verification.status;

  const statusLabel = () => {
    if (status === "verified") return { text: "Verified", icon: ShieldCheck, className: "text-[var(--color-mint)]" };
    if (status === "verifying") return { text: "Pending", icon: Loader2, className: "text-[var(--color-warm)] animate-spin" };
    return { text: "Not Verified", icon: ShieldAlert, className: "text-[var(--color-muted)]" };
  };

  const { text, icon: StatusIcon, className } = statusLabel();

  const handleSubmit = async () => {
    setError(null);
    if (method === "linkedin") {
      if (!linkedinUrl.trim() || !linkedinUrl.includes("linkedin.com/")) {
        setError("Enter a valid LinkedIn profile URL.");
        return;
      }
      await startVerification("linkedin", linkedinUrl.trim());
      showToast("Verification successful — you're now verified!", "success");
      return;
    }
    if (method === "student_id") {
      if (!fileName) {
        setError("Upload your student ID to continue.");
        return;
      }
      await startVerification("student_id", fileName);
      showToast("Verification successful — you're now verified!", "success");
    }
  };

  return (
    <section id="verification" className="glass rounded-2xl p-5 md:p-6 border border-white/5 scroll-mt-28">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[var(--color-warm)]/15 flex items-center justify-center">
            <Shield size={20} className="text-[var(--color-warm)]" />
          </div>
          <div>
            <h2 className="font-medium text-lg">Verify Identity</h2>
            <p className="text-sm text-[var(--color-muted)] mt-0.5">
              Upload a student ID or link your LinkedIn profile
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-2 text-sm font-medium ${className}`}>
          <StatusIcon size={16} />
          {text}
          {status === "verified" && <span>✅</span>}
        </div>
      </div>

      {status === "verified" ? (
        <div className="rounded-xl border border-[var(--color-mint)]/25 bg-[var(--color-mint)]/5 p-4">
          <p className="text-sm text-[var(--color-mint)]">
            Verified via {user.verification.method === "student_id" ? "Student ID" : "LinkedIn"}
          </p>
          {user.verification.value && (
            <p className="text-xs text-[var(--color-muted)] mt-1 font-mono truncate">{user.verification.value}</p>
          )}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-3 text-xs text-[var(--color-muted)] hover:text-white underline"
          >
            Manage verification
          </button>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <button
              type="button"
              onClick={() => {
                setMethod("student_id");
                setError(null);
              }}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-colors ${
                method === "student_id"
                  ? "border-[var(--color-warm)] bg-[var(--color-warm)]/10"
                  : "border-white/5 hover:border-white/10"
              }`}
            >
              <Upload size={18} className="text-[var(--color-warm)] shrink-0" />
              <div>
                <p className="text-sm font-medium">Student ID</p>
                <p className="text-xs text-[var(--color-muted)]">Upload image or PDF</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                setMethod("linkedin");
                setError(null);
              }}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-colors ${
                method === "linkedin"
                  ? "border-[var(--color-warm)] bg-[var(--color-warm)]/10"
                  : "border-white/5 hover:border-white/10"
              }`}
            >
              <Link2 size={18} className="text-[var(--color-warm)] shrink-0" />
              <div>
                <p className="text-sm font-medium">LinkedIn URL</p>
                <p className="text-xs text-[var(--color-muted)]">Public profile link</p>
              </div>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {method === "student_id" && (
              <motion.div
                key="student"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <label className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border border-dashed border-white/10 cursor-pointer hover:border-[var(--color-warm)]/30 transition-colors">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setFileName(f.name);
                      setError(null);
                    }}
                  />
                  {fileName ? (
                    <>
                      <FileText size={24} className="text-[var(--color-mint)]" />
                      <span className="text-sm">{fileName}</span>
                    </>
                  ) : (
                    <>
                      <Upload size={24} className="text-[var(--color-muted)]" />
                      <span className="text-sm text-[var(--color-muted)]">Click to upload student ID</span>
                    </>
                  )}
                </label>
              </motion.div>
            )}
            {method === "linkedin" && (
              <motion.div
                key="linkedin"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full bg-white/[0.04] border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--color-warm)]/40"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

          {status === "verifying" ? (
            <div className="flex items-center gap-2 text-sm text-[var(--color-warm)]">
              <Loader2 size={16} className="animate-spin" />
              Verification in progress…
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!method}
                className="px-5 py-2 rounded-full bg-[var(--color-warm)] text-[#0a0a0b] text-sm font-medium disabled:opacity-40"
              >
                Submit for verification
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="px-5 py-2 rounded-full border border-white/10 text-sm text-[var(--color-muted)] hover:text-white"
              >
                Full verification wizard
              </button>
            </div>
          )}
        </>
      )}

      <VerificationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  );
}
