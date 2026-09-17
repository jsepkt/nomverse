"use client";

import React, { useState, useEffect } from "react";
import { Portal } from "../ui/Portal";
import { useAuth } from "@/context/AuthContext";
import { X, ShieldCheck, Wallet, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    loginWithPhantom,
    loginWithMetaMask,
    loginWithGoogle,
  } = useAuth();

  const [googleEmail, setGoogleEmail] = useState<string>("");
  const [googleName, setGoogleName] = useState<string>("");
  const [showGoogleInput, setShowGoogleInput] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Close on Escape key
  useEffect(() => {
    if (!isAuthModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuthModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handlePhantom = async () => {
    setIsSubmitting(true);
    await loginWithPhantom();
    setIsSubmitting(false);
  };

  const handleMetaMask = async () => {
    setIsSubmitting(true);
    await loginWithMetaMask();
    setIsSubmitting(false);
  };

  const handleGoogle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail) return;
    setIsSubmitting(true);
    await loginWithGoogle(googleEmail, googleName);
    setIsSubmitting(false);
  };

  const handleQuickGoogle = async () => {
    setIsSubmitting(true);
    await loginWithGoogle("builder@nomverse.org", "Nomster Builder");
    setIsSubmitting(false);
  };

  return (
    <Portal>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={closeAuthModal}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-surface border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(20,241,149,0.2)] max-h-[85vh] overflow-y-auto"
        >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 mx-auto flex items-center justify-center text-emerald-400 mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-white">Verified Sign-In</h3>
          <p className="text-xs text-slate-400 mt-1">
            Connect your wallet or Google account to post on The NomWall. No private page needed—all discussions are open to the commons.
          </p>
        </div>

        {/* Providers List */}
        <div className="space-y-3">
          {/* Phantom Wallet (Solana) */}
          <button
            onClick={handlePhantom}
            disabled={isSubmitting}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-200 font-semibold text-sm transition-all group hover:scale-[1.02]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-600/30 flex items-center justify-center text-purple-300">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-bold text-white group-hover:text-purple-300 transition-colors">
                  Phantom Wallet
                </div>
                <div className="text-[11px] text-purple-300/70 font-mono">
                  Solana Verified Identity
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* MetaMask (EVM) */}
          <button
            onClick={handleMetaMask}
            disabled={isSubmitting}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-200 font-semibold text-sm transition-all group hover:scale-[1.02]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-600/30 flex items-center justify-center text-amber-300">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-bold text-white group-hover:text-amber-300 transition-colors">
                  MetaMask / EVM
                </div>
                <div className="text-[11px] text-amber-300/70 font-mono">
                  Ethereum &amp; L2 Verified
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Google Account */}
          {!showGoogleInput ? (
            <div className="space-y-2">
              <button
                onClick={() => setShowGoogleInput(true)}
                disabled={isSubmitting}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-200 font-semibold text-sm transition-all group hover:scale-[1.02]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/30 flex items-center justify-center text-blue-300">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white group-hover:text-blue-300 transition-colors">
                      Google Account
                    </div>
                    <div className="text-[11px] text-blue-300/70 font-mono">
                      Verified Builder Email
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={handleQuickGoogle}
                className="w-full text-center text-[11px] text-slate-400 hover:text-emerald-400 transition-colors py-1 font-mono underline underline-offset-2"
              >
                ⚡ 1-Click Fast Connect as Nomster Builder
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleGoogle}
              className="p-4 rounded-xl bg-slate-900 border border-blue-500/30 space-y-3"
            >
              <div className="text-xs font-bold text-blue-300 flex items-center justify-between">
                <span>Google Account Details</span>
                <button
                  type="button"
                  onClick={() => setShowGoogleInput(false)}
                  className="text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
              <input
                type="email"
                required
                placeholder="developer@gmail.com"
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-400"
              />
              <input
                type="text"
                placeholder="Builder Handle / Nickname (optional)"
                value={googleName}
                onChange={(e) => setGoogleName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-400"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
              >
                {isSubmitting ? "Connecting..." : "Verify & Sign In"}
              </button>
            </form>
          )}
        </div>

        {/* Ethics & Rules Notice */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-500 leading-normal">
            No social media tracking. By connecting, you agree to keep posts constructive and adhere to the{" "}
            <span className="text-emerald-400 font-semibold">zero sensitive content</span> community guidelines.
          </p>
        </div>
      </div>
    </div>
    </Portal>
  );
};
