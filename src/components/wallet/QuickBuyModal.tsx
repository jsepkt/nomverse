"use client";

import React, { useState, useEffect } from "react";
import { Portal } from "../ui/Portal";
import { TOKEN_CONFIG } from "@/config/token";
import { HOLDER_TIERS, getTierForBalance } from "@/lib/holderTiers";
import {
  Coins,
  ExternalLink,
  Flame,
  Heart,
  Shield,
  Sparkles,
  X,
  Zap,
  Crown,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { sounds } from "../audio/soundEffects";

interface QuickBuyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SOL_PRESETS = [0.1, 0.5, 1.0, 2.5, 5.0];

export const QuickBuyModal: React.FC<QuickBuyModalProps> = ({ isOpen, onClose }) => {
  const [selectedSol, setSelectedSol] = useState<number>(0.5);
  const [customSol, setCustomSol] = useState<string>("");
  const [tokenPriceUsd, setTokenPriceUsd] = useState<number>(0.0000028);
  const [tokenPriceNative, setTokenPriceNative] = useState<number>(0.000000018);
  const [bondingProgress, setBondingProgress] = useState<number>(4.1);
  const [copiedContract, setCopiedContract] = useState<boolean>(false);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch real DexScreener prices
  useEffect(() => {
    if (!isOpen) return;

    fetch("/api/token-stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const pUsd = parseFloat(data.priceUsd) || 0.0000028;
          const pNative = parseFloat(data.priceNative) || 0.000000018;
          setTokenPriceUsd(pUsd);
          setTokenPriceNative(pNative);
          setBondingProgress(data.bondingProgress || 4.1);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const activeSol = customSol ? parseFloat(customSol) || 0 : selectedSol;

  // Real tokens estimation
  const estimatedTokens = tokenPriceNative > 0 ? Math.floor(activeSol / tokenPriceNative) : 0;
  const targetPerks = getTierForBalance(estimatedTokens);

  const handleCopyMint = () => {
    navigator.clipboard.writeText(TOKEN_CONFIG.mintAddress);
    setCopiedContract(true);
    sounds.playGoldenChime();
    setTimeout(() => setCopiedContract(false), 2000);
  };

  return (
    <Portal>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-buy-title"
        onClick={onClose}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md rounded-3xl border border-emerald-500/40 bg-slate-950 p-6 shadow-[0_0_50px_rgba(20,241,149,0.25)] max-h-[85vh] overflow-y-auto"
        >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h2 id="quick-buy-title" className="text-base font-mono font-black text-white flex items-center gap-2">
              <span>QUICK BUY ${TOKEN_CONFIG.symbol}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PUMP.FUN
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Live Raydium curve: {bondingProgress}% • $69k target
            </p>
          </div>
        </div>

        {/* SOL Presets */}
        <div className="mb-4">
          <label className="text-[11px] font-mono text-slate-400 block mb-2">
            Select purchase amount (SOL):
          </label>
          <div className="grid grid-cols-5 gap-1.5 mb-2.5">
            {SOL_PRESETS.map((sol) => (
              <button
                key={sol}
                onClick={() => {
                  setSelectedSol(sol);
                  setCustomSol("");
                }}
                className={`py-2 px-1 rounded-xl text-xs font-mono font-bold transition-all ${
                  !customSol && selectedSol === sol
                    ? "bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(20,241,149,0.35)] scale-105"
                    : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
                }`}
              >
                {sol} SOL
              </button>
            ))}
          </div>

          {/* Custom SOL Input */}
          <input
            type="number"
            step="0.05"
            min="0.01"
            value={customSol}
            onChange={(e) => setCustomSol(e.target.value)}
            placeholder="Or enter custom SOL amount..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-400"
          />
        </div>

        {/* Real Estimation Card */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 mb-4 space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-xs font-mono text-slate-400">Est. Tokens Received:</span>
            <span className="text-base font-black font-mono text-emerald-400">
              ≈ {estimatedTokens.toLocaleString()} $NOM
            </span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
            <span className="text-xs font-mono text-slate-400">Resulting Tier:</span>
            <span
              className="text-xs font-mono font-bold flex items-center gap-1"
              style={{ color: targetPerks.accentColor }}
            >
              {targetPerks.badge}
              {targetPerks.hasCrown && <Crown className="w-3 h-3 text-amber-400" />}
            </span>
          </div>

          {/* Perks unlocked */}
          <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-mono text-slate-300">
            <span className="bg-slate-800/80 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Heart className="w-2.5 h-2.5 text-rose-400" />
              {targetPerks.maxLives} Max Lives
            </span>
            <span className="bg-slate-800/80 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-amber-400" />
              {targetPerks.scoreMultiplier}x Score
            </span>
            <span className="bg-slate-800/80 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Shield className="w-2.5 h-2.5 text-sky-400" />
              {targetPerks.raidMultiplier}x Raid Dmg
            </span>
          </div>
        </div>

        {/* Contract Address Copy */}
        <div className="mb-4 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-[11px] font-mono">
          <div className="text-slate-400 truncate mr-2">
            Mint: <span className="text-slate-200">{TOKEN_CONFIG.mintAddress}</span>
          </div>
          <button
            onClick={handleCopyMint}
            className="text-emerald-400 hover:text-emerald-300 shrink-0 p-1"
            title="Copy Contract Address"
          >
            {copiedContract ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Direct Action Link to pump.fun */}
        <a
          href={TOKEN_CONFIG.pumpFunUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-mono font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(20,241,149,0.35)] transition-all"
        >
          <span>BUY ON PUMP.FUN NOW</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
    </Portal>
  );
};
