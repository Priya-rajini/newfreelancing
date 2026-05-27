import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, type VerificationMethod } from "../../context/UserContext";
import { useToast } from "../../context/ToastContext";
import {
  X,
  Shield,
  Upload,
  Link2,
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Scan,
  Fingerprint,
} from "lucide-react";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VerificationModal({ isOpen, onClose }: VerificationModalProps) {
  const { user, startVerification, resetVerification } = useUser();
  const { showToast } = useToast();
  const [method, setMethod] = useState<VerificationMethod>(null);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>(null);
  const [error, setError] = useState("");
  const [scanStep, setScanStep] = useState(0);

  // Scan steps messages for simulation
  const scanSteps = [
    { text: "Initiating SkillSync Secure Tunnel...", duration: 1000 },
    { text: method === "student_id" ? "Parsing Student ID document & OCR text..." : "Establishing LinkedIn profile handshake...", duration: 1200 },
    { text: "Executing AI fraud detection & registry match...", duration: 1200 },
    { text: "Finalizing cryptographic identity keys...", duration: 1000 },
  ];

  // Run the sequence step counter when status is 'verifying'
  useEffect(() => {
    if (user.verification.status !== "verifying") {
      setScanStep(0);
      return;
    }

    let currentStep = 0;
    const runSteps = () => {
      if (currentStep < scanSteps.length - 1) {
        setTimeout(() => {
          currentStep += 1;
          setScanStep(currentStep);
          runSteps();
        }, scanSteps[currentStep].duration);
      }
    };
    runSteps();
  }, [user.verification.status, method]);

  const prevStatus = useRef(user.verification.status);
  useEffect(() => {
    if (prevStatus.current === "verifying" && user.verification.status === "verified") {
      showToast("Verification successful", "success");
    }
    prevStatus.current = user.verification.status;
  }, [user.verification.status, showToast]);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError("");

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
        setError("Please upload an image (PNG, JPG) or a PDF file.");
        return;
      }
      setSelectedFile({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      });
    }
  };

  const handleTriggerVerify = async () => {
    setError("");
    if (method === "linkedin") {
      if (!linkedinUrl.trim()) {
        setError("Please enter your LinkedIn URL.");
        return;
      }
      if (!linkedinUrl.includes("linkedin.com/")) {
        setError("Please enter a valid LinkedIn URL (e.g. linkedin.com/in/username).");
        return;
      }
      await startVerification("linkedin", linkedinUrl.trim());
    } else if (method === "student_id") {
      if (!selectedFile) {
        setError("Please select or drop a Student ID document.");
        return;
      }
      await startVerification("student_id", selectedFile.name);
    }
  };

  const selectMockFile = () => {
    setError("");
    setSelectedFile({
      name: "student_id_maya_chen.pdf",
      size: "1.42 MB",
    });
  };

  const getStatusColor = (index: number) => {
    if (scanStep > index) return "text-[var(--color-mint)]";
    if (scanStep === index) return "text-[var(--color-warm)] animate-pulse";
    return "text-[var(--color-muted)]";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={user.verification.status === "verifying" ? undefined : onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal Content Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl glass-strong border border-white/10 p-6 md:p-8 shadow-2xl"
      >
        {/* Close button */}
        {user.verification.status !== "verifying" && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/5 text-[var(--color-muted)] hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        )}

        <AnimatePresence mode="wait">
          {/* STATE 1: VERIFIED SUCCESS */}
          {user.verification.status === "verified" && (
            <motion.div
              key="verified"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-6"
            >
              <div className="relative mx-auto h-20 w-20 rounded-full bg-[var(--color-mint)]/10 border border-[var(--color-mint)]/30 flex items-center justify-center mb-6">
                <div className="absolute inset-0 rounded-full bg-[var(--color-mint)]/5 animate-ping duration-1000" />
                <Shield size={38} className="text-[var(--color-mint)]" />
              </div>

              <h2 className="text-display text-2xl font-semibold mb-2">Identity Verified</h2>
              <p className="text-[var(--color-muted)] text-sm max-w-sm mx-auto mb-6">
                Excellent! The SkillSync AI has validated your credentials. A verification badge has been successfully added to your profile.
              </p>

              <div className="glass rounded-xl p-4 inline-flex flex-col items-center gap-1.5 border border-[var(--color-mint)]/10 bg-[var(--color-mint)]/[0.02] mb-8">
                <div className="flex items-center gap-2 text-[var(--color-mint)] font-medium text-sm">
                  <CheckCircle2 size={16} /> Verified via{" "}
                  {user.verification.method === "student_id" ? "Student ID" : "LinkedIn"}
                </div>
                <span className="text-[11px] text-[var(--color-muted)] font-mono">
                  ID: {user.verification.value}
                </span>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    resetVerification();
                    setMethod(null);
                    setSelectedFile(null);
                    setLinkedinUrl("");
                  }}
                  className="px-4 py-2 text-xs rounded-full border border-white/10 text-[var(--color-muted)] hover:text-white hover:bg-white/5 transition-all"
                >
                  Reset Verification
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-sm font-semibold rounded-full bg-[var(--color-mint)] text-black hover:opacity-90 transition-all"
                >
                  Done
                </button>
              </div>
            </motion.div>
          )}

          {/* STATE 2: VERIFYING SCANNING SIMULATION */}
          {user.verification.status === "verifying" && (
            <motion.div
              key="verifying"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-6"
            >
              <div className="relative mx-auto h-24 w-full max-w-[200px] border border-white/5 bg-white/[0.02] rounded-xl flex flex-col items-center justify-center mb-8 overflow-hidden">
                {/* Futuring scanning layout */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-warm)]/10 to-transparent animate-[float_2s_infinite]" style={{ "--rot": "0deg" } as React.CSSProperties} />
                <div className="absolute top-0 bottom-0 left-0 right-0 border-y border-[var(--color-warm)]/20 h-0.5 my-auto w-full bg-[var(--color-warm)]/30 animate-[float_1.5s_ease-in-out_infinite]" />

                {method === "student_id" ? (
                  <Scan size={36} className="text-[var(--color-warm)] animate-pulse" />
                ) : (
                  <Fingerprint size={36} className="text-[var(--color-warm)] animate-pulse" />
                )}
                <span className="text-[10px] text-[var(--color-warm)] font-mono mt-2 tracking-widest animate-pulse">
                  AI SCANNING...
                </span>
              </div>

              <h2 className="text-xl font-medium text-center mb-6">AI Identity Verification</h2>

              <div className="space-y-4 max-w-sm mx-auto">
                {scanSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm">
                    {scanStep > idx ? (
                      <CheckCircle2 size={16} className="text-[var(--color-mint)] shrink-0 mt-0.5" />
                    ) : scanStep === idx ? (
                      <Loader2 size={16} className="text-[var(--color-warm)] animate-spin shrink-0 mt-0.5" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-white/10 shrink-0 mt-0.5" />
                    )}
                    <span className={getStatusColor(idx)}>{step.text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center text-xs text-[var(--color-muted)] font-mono animate-pulse">
                DO NOT CLOSE THIS WINDOW
              </div>
            </motion.div>
          )}

          {/* STATE 3: SELECT METHOD & INPUTS */}
          {user.verification.status === "unverified" && (
            <motion.div
              key="unverified"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-[var(--color-warm)]/10 border border-[var(--color-warm)]/20 flex items-center justify-center text-[var(--color-warm)]">
                  <Shield size={20} />
                </div>
                <div>
                  <h2 className="text-display text-xl font-semibold leading-none">Identity Verification</h2>
                  <p className="text-[var(--color-muted)] text-xs mt-1">
                    Select a validation path to earn your verified badge.
                  </p>
                </div>
              </div>

              {/* Step 1: Selection Buttons */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setMethod("student_id");
                    setError("");
                  }}
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border text-center transition-all ${
                    method === "student_id"
                      ? "border-[var(--color-warm)] bg-[var(--color-warm)]/5 text-white"
                      : "border-white/5 bg-white/[0.01] text-[var(--color-muted)] hover:border-white/10 hover:bg-white/[0.02]"
                  }`}
                >
                  <Upload size={22} className={method === "student_id" ? "text-[var(--color-warm)]" : ""} />
                  <div>
                    <div className="text-xs font-semibold">Student ID Card</div>
                    <div className="text-[10px] opacity-60 mt-0.5">Upload institutional ID</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMethod("linkedin");
                    setError("");
                  }}
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border text-center transition-all ${
                    method === "linkedin"
                      ? "border-[var(--color-warm)] bg-[var(--color-warm)]/5 text-white"
                      : "border-white/5 bg-white/[0.01] text-[var(--color-muted)] hover:border-white/10 hover:bg-white/[0.02]"
                  }`}
                >
                  <Link2 size={22} className={method === "linkedin" ? "text-[var(--color-warm)]" : ""} />
                  <div>
                    <div className="text-xs font-semibold">LinkedIn URL</div>
                    <div className="text-[10px] opacity-60 mt-0.5">Verify public profile</div>
                  </div>
                </button>
              </div>

              {/* Step 2: Inputs Based on Selection */}
              <div className="min-h-[160px] flex flex-col justify-center">
                {method === null ? (
                  <div className="text-center py-8 text-xs text-[var(--color-muted)] border border-dashed border-white/5 rounded-xl bg-white/[0.005]">
                    Select a verification option above to continue
                  </div>
                ) : method === "student_id" ? (
                  <div className="space-y-4 w-full">
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`relative border border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[120px] ${
                        dragActive
                          ? "border-[var(--color-warm)] bg-[var(--color-warm)]/5"
                          : selectedFile
                          ? "border-[var(--color-mint)]/30 bg-[var(--color-mint)]/[0.01]"
                          : "border-white/10 bg-white/[0.005] hover:bg-white/[0.01]"
                      }`}
                    >
                      <input
                        type="file"
                        id="student-id-file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        accept="image/*,.pdf"
                        onChange={handleFileSelect}
                      />

                      {selectedFile ? (
                        <>
                          <FileText className="text-[var(--color-mint)] mb-2" size={24} />
                          <div className="text-xs font-medium text-white truncate max-w-[280px]">
                            {selectedFile.name}
                          </div>
                          <div className="text-[10px] text-[var(--color-muted)] mt-0.5">
                            {selectedFile.size} · Click to replace
                          </div>
                        </>
                      ) : (
                        <>
                          <Upload className="text-[var(--color-muted)] mb-2" size={24} />
                          <div className="text-xs font-medium">Drag & drop your student ID here</div>
                          <div className="text-[10px] text-[var(--color-muted)] mt-1">
                            PDF, PNG, JPG accepted (max 10MB)
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={selectMockFile}
                        className="text-[10px] text-[var(--color-warm)] hover:underline font-mono"
                      >
                        [Demo Mode: Autoload mock Student ID]
                      </button>
                      {selectedFile && (
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="text-[10px] text-red-400 hover:underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 w-full">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[var(--color-muted)] mb-2 font-mono">
                        LinkedIn Profile URL
                      </label>
                      <div className="relative">
                        <Link2
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
                        />
                        <input
                          type="text"
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                          placeholder="https://www.linkedin.com/in/yourprofile"
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-warm)]/40 transition-colors"
                        />
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-[10px] text-[var(--color-muted)]">
                          Profile must be public for AI evaluation match
                        </span>
                        <button
                          type="button"
                          onClick={() => setLinkedinUrl("https://linkedin.com/in/maya-chen-designer-ai")}
                          className="text-[10px] text-[var(--color-warm)] hover:underline font-mono"
                        >
                          [Demo Mode: Autoload URL]
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 mt-4 text-xs text-red-400/90 bg-red-950/20 border border-red-900/30 p-3 rounded-lg">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 text-xs rounded-full border border-white/10 text-[var(--color-muted)] hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleTriggerVerify}
                  disabled={method === null || (method === "student_id" && !selectedFile) || (method === "linkedin" && !linkedinUrl)}
                  className="px-6 py-2 text-xs font-semibold rounded-full bg-[var(--color-warm)] text-black hover:opacity-90 disabled:opacity-40 disabled:hover:opacity-40 transition-all flex items-center gap-2"
                >
                  <Shield size={13} />
                  Run AI verification
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
