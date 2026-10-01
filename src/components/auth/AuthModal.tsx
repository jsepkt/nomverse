"use client";

import React, { useState, useEffect } from "react";
import { Portal } from "../ui/Portal";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  ShieldCheck,
  Wallet,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Flame,
} from "lucide-react";

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    loginWithPhantom,
    loginWithSolflare,
    loginWithBackpack,
    loginWithMetaMask,
    loginWithGoogle,
  } = useAuth();

  const [googleEmail, setGoogleEmail] = useState<string>("");
  const [googleName, setGoogleName] = useState<string>("");
  const [showGoogleInput, setShowGoogleInput] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [detectedWallets, setDetectedWallets] = useState<{
    phantom: boolean;
    solflare: boolean;
    backpack: boolean;
    metamask: boolean;
  }>({
    phantom: false,
    solflare: false,
    backpack: false,
    metamask: false,
  });

  // Detect installed extensions on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const win = window as any;
      setDetectedWallets({
        phantom: !!(win.phantom?.solana || win.solana?.isPhantom),
        solflare: !!(win.solflare || win.solana?.isSolflare),
        backpack: !!(win.backpack || win.solana?.isBackpack),
        metamask: !!win.ethereum,
      });
    }
  }, [isAuthModalOpen]);

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

  const handleSolflare = async () => {
    setIsSubmitting(true);
    await loginWithSolflare();
    setIsSubmitting(false);
  };

  const handleBackpack = async () => {
    setIsSubmitting(true);
    await loginWithBackpack();
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
        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-mono"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-slate-950 border border-emerald-500/40 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(20,241,149,0.2)] max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="text-center mb-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 mx-auto flex items-center justify-center text-emerald-400 mb-2.5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 id="auth-modal-title" className="text-lg sm:text-xl font-black text-white font-sans">
              Connect Solana Wallet
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Link your wallet to read your live <span className="text-emerald-400 font-bold">$NOM</span> balance, enter high-stakes rooms, and mint characters.
            </p>
          </div>

          {/* Providers List */}
          <div className="space-y-2.5">
            {/* 1. Phantom Wallet (Solana) */}
            <button
              onClick={handlePhantom}
              disabled={isSubmitting}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-purple-950/20 hover:bg-purple-950/40 border border-purple-500/40 hover:border-purple-400 text-purple-200 font-semibold text-sm transition-all group hover:scale-[1.01] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 shrink-0">
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-2">
                    <span>Phantom</span>
                    {detectedWallets.phantom && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        DETECTED
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-purple-300/70">
                    Solana SPL &amp; Token-2022
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            {/* 2. Solflare Wallet (Solana) */}
            <button
              onClick={handleSolflare}
              disabled={isSubmitting}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-orange-950/20 hover:bg-orange-950/40 border border-orange-500/40 hover:border-orange-400 text-orange-200 font-semibold text-sm transition-all group hover:scale-[1.01] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-600/30 border border-orange-500/50 flex items-center justify-center text-orange-300 shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white group-hover:text-orange-300 transition-colors flex items-center gap-2">
                    <span>Solflare</span>
                    {detectedWallets.solflare && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        DETECTED
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-orange-300/70">
                    Solana Native &amp; Mobile Web
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-orange-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            {/* 3. Backpack Wallet (Solana) */}
            <button
              onClick={handleBackpack}
              disabled={isSubmitting}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/40 hover:border-rose-400 text-rose-200 font-semibold text-sm transition-all group hover:scale-[1.01] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-600/30 border border-rose-500/50 flex items-center justify-center text-rose-300 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white group-hover:text-rose-300 transition-colors flex items-center gap-2">
                    <span>Backpack</span>
                    {detectedWallets.backpack && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        DETECTED
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-rose-300/70">
                    Solana xNFT &amp; Token-2022
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            {/* 4. MetaMask / EVM */}
            <button
              onClick={handleMetaMask}
              disabled={isSubmitting}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-amber-950/20 hover:bg-amber-950/40 border border-amber-500/30 hover:border-amber-400 text-amber-200 font-semibold text-sm transition-all group hover:scale-[1.01] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white group-hover:text-amber-300 transition-colors">
                    MetaMask / EVM
                  </div>
                  <div className="text-[11px] text-amber-300/70">
                    Ethereum &amp; Multi-chain
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            {/* 5. Google / Builder Handle */}
            {!showGoogleInput ? (
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => setShowGoogleInput(true)}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-blue-950/20 hover:bg-blue-950/40 border border-blue-500/30 hover:border-blue-400 text-blue-200 font-semibold text-sm transition-all group hover:scale-[1.01] cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-300 shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-white group-hover:text-blue-300 transition-colors">
                        Guest &amp; Builder Login
                      </div>
                      <div className="text-[11px] text-blue-300/70">
                        Email &amp; NomWall Quests
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform shrink-0" />
                </button>

                <button
                  onClick={handleQuickGoogle}
                  className="w-full text-center text-[11px] text-slate-400 hover:text-emerald-400 transition-colors py-1 underline underline-offset-2 cursor-pointer"
                >
                  ⚡ 1-Click Fast Connect as Guest Nommer
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleGoogle}
                className="p-4 rounded-2xl bg-slate-900 border border-blue-500/30 space-y-3"
              >
                <div className="text-xs font-bold text-blue-300 flex items-center justify-between">
                  <span>Guest &amp; Builder Handle</span>
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-400"
                />
                <input
                  type="text"
                  placeholder="Builder Handle / Nickname (optional)"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-400"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  {isSubmitting ? "Connecting..." : "Verify & Sign In"}
                </button>
              </form>
            )}
          </div>

          {/* Ethics & Rules Notice */}
          <div className="mt-5 pt-3 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-500 leading-normal font-sans">
              100% open-source &amp; non-custodial. No private keys stored. Connects directly to Solana mainnet.
            </p>
          </div>
        </div>
      </div>
    </Portal>
  );
};
