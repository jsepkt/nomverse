"use client";

import React, { useState, useEffect } from "react";
import { TOKEN_CONFIG } from "@/config/token";
import { ExternalLink, Flame, Sparkles, TrendingUp, CheckCircle2, Lock } from "lucide-react";

interface MilestoneItem {
  percent: number;
  targetMcap: number;
  title: string;
  reward: string;
}

const MILESTONES: MilestoneItem[] = [
  {
    percent: 25,
    targetMcap: 17250,
    title: "Phase 2 Raid Boss",
    reward: "Lord Mega-FUD Phase 2 enters the arena with 2x candies!",
  },
  {
    percent: 50,
    targetMcap: 34500,
    title: "Golden Candy Frenzy Boost",
    reward: "Golden candies spawn 25% more often across all stages!",
  },
  {
    percent: 75,
    targetMcap: 51750,
    title: "Universal 1.25x Multiplier",
    reward: "Every player enjoys a permanent 1.25x arcade score boost!",
  },
  {
    percent: 100,
    targetMcap: 69000,
    title: "Raydium Graduation",
    reward: "Raydium DEX launch, liquidity burn & pump.fun graduation!",
  },
];

export const BondingMilestonesCard: React.FC = () => {
  const [bondingProgress, setBondingProgress] = useState<number>(1.28);
  const [marketCap, setMarketCap] = useState<number>(3276);
  const [solCollected, setSolCollected] = useState<number>(1.09);

  useEffect(() => {
    fetch("/api/token-stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBondingProgress(data.bondingProgress ?? 1.28);
          setMarketCap(data.marketCap ?? 3276);
          setSolCollected(data.solCollected ?? 1.09);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="w-full my-4 p-4 rounded-2xl border border-emerald-500/30 bg-slate-950/80 backdrop-blur-md shadow-[0_0_30px_rgba(20,241,149,0.1)]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-mono font-bold text-white flex items-center gap-1.5">
              <span>RAYDIUM BONDING CURVE MILESTONES</span>
              <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                85 SOL / $69k Goal
              </span>
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              Current: <strong className="text-emerald-400">{bondingProgress}%</strong> • <strong className="text-white">{solCollected} SOL</strong> / 85 SOL • MCap: ${marketCap.toLocaleString()}
            </p>
          </div>
        </div>

        <a
          href={TOKEN_CONFIG.pumpFunUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(20,241,149,0.25)]"
        >
          <span>PUSH ON PUMP.FUN</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-800 mb-3.5">
        <div
          className="bg-gradient-to-r from-emerald-500 via-teal-400 to-solana-green h-full rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(20,241,149,0.6)]"
          style={{ width: `${Math.max(3, Math.min(100, bondingProgress))}%` }}
        />
      </div>

      {/* Milestones Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {MILESTONES.map((m) => {
          const isUnlocked = bondingProgress >= m.percent;

          return (
            <div
              key={m.percent}
              className={`p-2.5 rounded-xl border text-xs font-mono transition-all ${
                isUnlocked
                  ? "bg-emerald-950/30 border-emerald-500/50 text-white shadow-[0_0_15px_rgba(20,241,149,0.1)]"
                  : "bg-slate-900/40 border-slate-800 text-slate-400"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[11px] text-amber-400">
                  {m.percent}% ({`$${(m.targetMcap / 1000).toFixed(1)}k`})
                </span>
                {isUnlocked ? (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    UNLOCKED
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                    <Lock className="w-3 h-3" />
                    LOCKED
                  </span>
                )}
              </div>
              <div className="font-bold text-white text-[11px] mb-0.5">{m.title}</div>
              <div className="text-[10px] text-slate-400 leading-tight">{m.reward}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
