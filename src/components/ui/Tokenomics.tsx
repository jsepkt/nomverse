"use client";

import React from "react";
import Link from "next/link";
import {
  Flame,
  ShieldCheck,
  Zap,
  Lock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileText,
} from "lucide-react";
import { InstantBuyTerminal } from "../tokenomics/InstantBuyTerminal";
import { BondingMilestonesCard } from "../game/BondingMilestonesCard";
import { TOKEN_CONFIG } from "@/config/token";
import { sounds } from "../audio/soundEffects";

export const Tokenomics: React.FC = () => {
  return (
    <section
      id="tokenomics"
      className="scroll-mt-20 w-full py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 relative"
    >
      <div className="max-w-[1360px] mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold glass-pill text-rose-400 border border-rose-500/30">
            <Flame className="w-3.5 h-3.5" />
            <span>ECOSYSTEM TOKENOMICS &amp; FAIR LAUNCH</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            <span className="text-emerald-400">$NOM</span> Token &amp; Economic Engine
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
            $NOM is the native utility and fuel of the NomVerse. 100% fair launched on pump.fun with zero private sales, zero team allocations, and permanently revoked authorities.
          </p>
        </div>

        {/* 4 Core Essential Facts Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-3xl glass-card glass-card-hover p-4 sm:p-6 space-y-1.5 sm:space-y-2">
            <div className="text-[10px] sm:text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider truncate">
              Total Supply
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-white truncate">
              1,000,000,000
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400">Fixed hardcap. No inflation.</p>
          </div>

          <div className="rounded-3xl glass-card glass-card-hover p-4 sm:p-6 space-y-1.5 sm:space-y-2">
            <div className="text-[10px] sm:text-xs font-mono text-teal-400 font-bold uppercase tracking-wider truncate">
              Trading Tax
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-white truncate">
              0% / 0%
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400">Zero buy tax. Zero sell tax.</p>
          </div>

          <div className="rounded-3xl glass-card glass-card-hover p-4 sm:p-6 space-y-1.5 sm:space-y-2">
            <div className="text-[10px] sm:text-xs font-mono text-rose-400 font-bold uppercase tracking-wider truncate">
              Arcade Auto-Burn
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-white truncate">
              1% Fee
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400">Burns permanently on games.</p>
          </div>

          <div className="rounded-3xl glass-card glass-card-hover p-4 sm:p-6 space-y-1.5 sm:space-y-2">
            <div className="text-[10px] sm:text-xs font-mono text-solana-purple font-bold uppercase tracking-wider truncate">
              Blockchain
            </div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-white truncate">
              Solana
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400">Token-2022 speed &amp; security.</p>
          </div>
        </div>

        {/* The Star: 1-Click Instant Buy Terminal */}
        <div className="max-w-4xl mx-auto">
          <InstantBuyTerminal />
        </div>

        {/* Straightforward $NOM Bonding Curve Milestones */}
        <div>
          <BondingMilestonesCard />
        </div>

        {/* Deep Dive Utility Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <Link
            href="/guide"
            onClick={() => sounds.playButtonClick()}
            className="group p-6 rounded-3xl glass-card glass-card-hover flex items-center justify-between"
          >
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-teal-400 uppercase">
                Step-by-Step
              </span>
              <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                How to Buy Guide &amp; Scam Shield
              </h4>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-1 shrink-0 ml-2" />
          </Link>

          <Link
            href="/tokenomics"
            onClick={() => sounds.playButtonClick()}
            className="group p-6 rounded-3xl glass-card glass-card-hover flex items-center justify-between"
          >
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-rose-400 uppercase">
                Live Simulator
              </span>
              <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-rose-300 transition-colors">
                Interactive Deflation &amp; Supply Model
              </h4>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-1 shrink-0 ml-2" />
          </Link>

          <Link
            href="/security"
            onClick={() => sounds.playButtonClick()}
            className="group p-6 rounded-3xl glass-card glass-card-hover flex items-center justify-between"
          >
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                On-Chain Audit
              </span>
              <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                Contract Verification &amp; Mint Safety
              </h4>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-1 shrink-0 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};
