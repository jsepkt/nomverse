"use client";

import React from "react";
import { Flame, ShieldCheck, Zap, Lock, Sparkles } from "lucide-react";
import { InstantBuyTerminal } from "../tokenomics/InstantBuyTerminal";

export const Tokenomics: React.FC = () => {
  return (
    <section id="tokenomics" className="w-full py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30 mb-4">
            <Flame className="w-3.5 h-3.5" />
            <span>PUMP.FUN FAIR LAUNCH</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
            The Sovereign Economic Engine of NomVerse
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            While GitHub is the builder hub, our token launched on <strong className="text-emerald-400">pump.fun</strong> powers community attention, arcade revives, and deflationary burn events. 100% fair launch with zero presale, zero team allocations, and renounced authorities.
          </p>
        </div>

        {/* The Star: High-Converting 1-Click Buy Terminal */}
        <InstantBuyTerminal />

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="rounded-2xl bg-slate-950/80 border border-slate-800/90 p-5 space-y-2">
            <div className="text-2xl font-black font-mono text-emerald-400">0% TAX</div>
            <div className="text-sm font-bold text-white">Zero Friction</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              No buy taxes, no sell taxes, no team skim. Complete sovereign trading freedom for community holders.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-950/80 border border-slate-800/90 p-5 space-y-2">
            <div className="text-2xl font-black font-mono text-solana-green">100% FAIR</div>
            <div className="text-sm font-bold text-white">Bonding Curve Launch</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every token purchased through the pump.fun bonding curve. Zero VCs, zero presale discounts, zero team tokens.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-950/80 border border-slate-800/90 p-5 space-y-2">
            <div className="text-2xl font-black font-mono text-teal-300">TOKEN-2022</div>
            <div className="text-sm font-bold text-white">Next-Gen Security</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mint authority renounced (`null`). Freeze authority renounced (`null`). Total supply fixed at 1 Billion $NOM forever.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-950/80 border border-slate-800/90 p-5 space-y-2">
            <div className="text-2xl font-black font-mono text-solana-purple">RAYDIUM</div>
            <div className="text-sm font-bold text-white">Automated Migration</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upon reaching 85 SOL in the bonding curve, liquidity is burned and migrated automatically to Raydium DEX.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
