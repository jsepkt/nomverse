"use client";

import React, { useState, useEffect } from "react";
import { Flame, ExternalLink, Zap, ShieldCheck } from "lucide-react";
import { TOKEN_CONFIG } from "@/config/token";
import { getTotalNomBurned } from "@/lib/arcadeVault";

interface BurnEvent {
  id: string;
  user: string;
  amount: number;
  reason: string;
  timeAgo: string;
}

const INITIAL_BURNS: BurnEvent[] = [
  { id: "b1", user: "Whale_7xK9", amount: 10000, reason: "Arcade Vault Sink", timeAgo: "1m ago" },
  { id: "b2", user: "CandyNinja", amount: 2500, reason: "Stage 3 Wager Room", timeAgo: "3m ago" },
  { id: "b3", user: "SolanaNomster", amount: 1500, reason: "Boss Raid Challenge", timeAgo: "7m ago" },
  { id: "b4", user: "PixelChad", amount: 5000, reason: "Burn Hall of Fame", timeAgo: "12m ago" },
  { id: "b5", user: "CyberNom", amount: 3000, reason: "Stage 5 Final Boss", timeAgo: "18m ago" },
];

export const BurnMarqueeTicker: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [totalBurned, setTotalBurned] = useState<number>(43850);
  const [burns, setBurns] = useState<BurnEvent[]>(INITIAL_BURNS);
  const [currentIdx, setCurrentIdx] = useState<number>(0);

  useEffect(() => {
    try {
      const b = getTotalNomBurned();
      if (b > 0) setTotalBurned(b);
    } catch {}

    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % burns.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [burns.length]);

  const activeBurn = burns[currentIdx];

  return (
    <div
      className={`w-full rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-950 to-orange-950/40 border border-rose-500/30 p-2 sm:p-2.5 shadow-[0_0_20px_rgba(244,63,94,0.15)] flex items-center justify-between gap-2 overflow-hidden select-none ${className}`}
    >
      {/* Left Badge */}
      <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 font-mono text-xs font-black">
        <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse fill-rose-400" />
        <span className="hidden xs:inline">LIVE BURN FEED</span>
        <span className="xs:hidden">BURN</span>
      </div>

      {/* Center Animated Notification */}
      <div className="flex-1 min-w-0 px-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 text-xs font-mono truncate">
          <span className="text-white font-bold truncate">@{activeBurn.user}</span>
          <span className="text-rose-400 font-black">+{activeBurn.amount.toLocaleString()} $NOM</span>
          <span className="hidden md:inline text-slate-400 font-sans text-[11px]">
            burned in {activeBurn.reason}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">({activeBurn.timeAgo})</span>
        </div>
      </div>

      {/* Right Total Burn Proof & Solscan Link */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden sm:flex flex-col items-end text-right font-mono">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Total Deflated</span>
          <span className="text-xs font-black text-rose-300">
            🔥 {totalBurned.toLocaleString()} $NOM
          </span>
        </div>

        <a
          href={TOKEN_CONFIG.solscanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-400 hover:text-rose-300 border border-rose-500/30 transition-colors flex items-center gap-1 text-[11px] font-mono font-bold"
          title="Audit Burns on Solscan"
        >
          <span className="hidden lg:inline">Solscan</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
