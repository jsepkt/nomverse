"use client";

import React, { useState } from "react";
import { Rocket, Sparkles, TrendingUp, Zap, ExternalLink, ShieldCheck, Flame } from "lucide-react";
import { TOKEN_CONFIG } from "@/config/token";
import { QuickBuyModal } from "./QuickBuyModal";
import { sounds } from "../audio/soundEffects";

export const BondingCurveTracker: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [isQuickBuyOpen, setIsQuickBuyOpen] = useState(false);

  // Standard pump.fun bonding curve target: 85 SOL for Raydium graduation
  const currentSolPooled = 62.4;
  const targetSol = 85.0;
  const progressPercent = Math.min(100, Math.round((currentSolPooled / targetSol) * 100));
  const remainingSol = (targetSol - currentSolPooled).toFixed(1);

  return (
    <>
      <div
        className={`w-full rounded-3xl bg-gradient-to-r from-amber-950/30 via-slate-900/90 to-purple-950/30 border-2 border-amber-500/40 p-4 sm:p-6 shadow-[0_0_30px_rgba(245,158,11,0.2)] relative overflow-hidden select-none ${className}`}
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/30 shrink-0">
                <Rocket className="w-5 h-5 sm:w-6 sm:h-6 fill-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-md bg-amber-400 text-slate-950">
                    PUMP.FUN BONDING CURVE
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                    RAYDIUM MIGRATION ORBIT
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                  Bonding Curve Progress: <span className="text-amber-300">{progressPercent}%</span>
                </h3>
              </div>
            </div>

            {/* Quick Buy CTA */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  sounds.playGoldenChime();
                  setIsQuickBuyOpen(true);
                }}
                className="tactile-button flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-mono font-black bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>Instant Buy</span>
              </button>
              <a
                href={TOKEN_CONFIG.pumpFunUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 transition-colors flex items-center justify-center"
                title="Open on pump.fun"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full h-3.5 sm:h-4 bg-slate-950 rounded-full border border-amber-500/30 p-0.5 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-solana-green rounded-full transition-all duration-1000 relative shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
              <span>{currentSolPooled} SOL Pooled</span>
              <span className="text-amber-300 font-bold">{remainingSol} SOL until Raydium DEX</span>
              <span>85.0 SOL Target</span>
            </div>
          </div>

          {/* 3 Metric Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] font-mono text-slate-400">LIQUIDITY LOCK</div>
                <div className="text-xs font-bold text-white truncate">$12,000 Auto-Burned</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-2.5">
              <Flame className="w-4 h-4 text-rose-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] font-mono text-slate-400">ARCADE BURN SINK</div>
                <div className="text-xs font-bold text-rose-300 truncate">1% Deflationary Per Move</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center gap-2.5">
              <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] font-mono text-slate-400">TRADING TAX</div>
                <div className="text-xs font-bold text-amber-300 truncate">0% Buy / 0% Sell</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <QuickBuyModal isOpen={isQuickBuyOpen} onClose={() => setIsQuickBuyOpen(false)} />
    </>
  );
};
