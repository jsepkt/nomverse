"use client";

import React, { useState, useEffect } from "react";
import { Swords, ShieldAlert, Trophy, Sparkles, Flame, ChevronDown, ChevronUp } from "lucide-react";
import { getLocalRaidStats } from "@/lib/raidBoss";

interface RaidBossBannerProps {
  userId?: string;
  userName?: string;
}

interface RaidState {
  name: string;
  title: string;
  maxHp: number;
  currentHp: number;
  isDefeated: boolean;
  totalParticipants: number;
}

export const RaidBossBanner: React.FC<RaidBossBannerProps> = ({ userId, userName }) => {
  const [raid, setRaid] = useState<RaidState>({
    name: "Lord Mega-FUD",
    title: "Ancient Glitch Dragon of Paper Hands",
    maxHp: 100000,
    currentHp: 73420,
    isDefeated: false,
    totalParticipants: 42,
  });
  const [userHits, setUserHits] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [recentDamageFlash, setRecentDamageFlash] = useState<boolean>(false);

  // Sync user local hits
  useEffect(() => {
    if (userId) {
      const stats = getLocalRaidStats(userId);
      setUserHits(stats.userHits);
    }
  }, [userId]);

  // Fetch raid state from server
  useEffect(() => {
    async function fetchRaid() {
      try {
        const res = await fetch("/api/raid");
        const data = await res.json();
        if (data.success && data.raid) {
          setRaid(data.raid);
        }
      } catch {
        // ignore
      }
    }

    fetchRaid();
    const interval = setInterval(fetchRaid, 8000);
    return () => clearInterval(interval);
  }, []);

  const hpPercent = Math.max(0, Math.min(100, (raid.currentHp / raid.maxHp) * 100));

  return (
    <div className="w-full mb-3 rounded-xl border border-rose-500/40 bg-gradient-to-r from-rose-950/70 via-purple-950/60 to-slate-950/80 backdrop-blur-md p-3 shadow-[0_0_25px_rgba(244,63,94,0.15)] select-none">
      <div className="flex items-center justify-between gap-3">
        {/* Boss Icon & Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-xl animate-pulse">
            👾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-white tracking-wide">
                {raid.name}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                WORLD RAID BOSS
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-rose-300/80 truncate max-w-[200px] sm:max-w-none">
              {raid.title}
            </p>
          </div>
        </div>

        {/* Action / Contributor Stats */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] font-mono text-slate-400">YOUR DAMAGE</div>
            <div className="text-xs font-mono font-bold text-amber-400">
              {userHits} HITS {userHits >= 10 && "• 😈 SLAYER UNLOCKED"}
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            title="Toggle Raid Details"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* HP Bar */}
      <div className="mt-2.5">
        <div className="flex items-center justify-between text-[11px] font-mono mb-1">
          <span className="text-rose-400 font-bold flex items-center gap-1">
            <Swords className="w-3.5 h-3.5" />
            <span>GLOBAL COMMUNITY HEALTH</span>
          </span>
          <span className="text-slate-300 font-bold">
            {raid.currentHp.toLocaleString()} / {raid.maxHp.toLocaleString()} HP ({hpPercent.toFixed(1)}%)
          </span>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-700 overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-rose-500 via-purple-500 to-solana-green transition-all duration-500 relative"
            style={{ width: `${hpPercent}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Expanded Raid Details Drawer */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-rose-500/20 text-xs font-mono text-slate-300 space-y-2 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-candy-gold" />
              <span>
                <strong>How to play:</strong> Every candy caught in the arcade deals <strong>1 Damage</strong> to Lord Mega-FUD!
              </span>
            </div>
            <div className="text-[11px] text-emerald-400">
              Reward: 24h Golden Candy Storm + 😈 FUD Slayer Horns
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
