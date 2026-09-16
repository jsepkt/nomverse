"use client";

import React, { useState } from "react";
import { X, AlertTriangle, ShieldCheck, CheckCircle2 } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  postId: string;
  onClose: () => void;
  onSubmitReport: (postId: string, reason: string) => Promise<void>;
}

const REPORT_REASONS = [
  { id: "sensitive", label: "Sensitive, NSFW, or Explicit Content", desc: "Violates family-friendly CC0 guidelines." },
  { id: "harassment", label: "Harassment, Hate Speech, or Hostility", desc: "Personal attacks or offensive slurs." },
  { id: "scam", label: "Scam, Phishing, or Drainer Links", desc: "Unverified contracts or deceptive links." },
  { id: "spam", label: "Spam or Commercial Bot Noise", desc: "Repetitive or irrelevant posts." },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  postId,
  onClose,
  onSubmitReport,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(REPORT_REASONS[0].label);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmitReport(postId, selectedReason);
    setIsSubmitting(false);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-surface border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Report Content</h3>
            <p className="text-xs text-slate-400">Help protect the NomVerse commons.</p>
          </div>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <div className="text-sm font-bold text-white">Report Submitted</div>
            <p className="text-xs text-slate-400">
              Thank you for keeping the NomVerse wall safe and constructive.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Select reason:</label>
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedReason === reason.label
                      ? "bg-rose-500/10 border-rose-500/40 text-white"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason.label}
                    checked={selectedReason === reason.label}
                    onChange={() => setSelectedReason(reason.label)}
                    className="mt-1 accent-rose-500"
                  />
                  <div>
                    <div className="text-xs font-bold">{reason.label}</div>
                    <div className="text-[11px] text-slate-400">{reason.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
