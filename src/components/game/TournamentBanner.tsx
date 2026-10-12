"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, Clock, Flame, Sparkles, ChevronRight, Award, Zap } from "lucide-react";
import { sounds } from "../audio/soundEffects";

// Season 1 ends in ~72 hours from current baseline, stored in localStorage or stable offset
export const TournamentBanner: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 71,
    minutes: 58,
    seconds: 30,
  });

  useEffect(() => {
    // 3 days countdown loop
    const targetTime = Date.now() + (3 * 24 * 60 * 60 * 1000);
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, targetTime - now);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-solana-purple/20 border-2 border-amber-500/50 p-3 sm:p-4 shadow-[0_0_30px_rgba(245,158,11,0.25)] relative overflow-hidden select-none">
      {/* Background flare */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
        {/* Left: Tournament Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 shrink-0 animate-bounce">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-md bg-amber-400 text-slate-950">
                SEASON 1 CHAMPIONSHIP
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                LIVE TOURNAMENT
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-white mt-0.5">
              1,000,000 $NOM + 5 SOL Prize Bounty Pool
            </h3>
            <p className="text-[11px] text-slate-300 font-sans hidden sm:block">
              Top 10 players on the Global Leaderboard win direct SOL &amp; $NOM airdrops!
            </p>
          </div>
        </div>

        {/* Right: Countdown & Quick Action */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3 pt-2 md:pt-0 border-t md:border-0 border-amber-500/20">
          {/* Ticking Clock */}
          <div className="flex items-center gap-1.5 font-mono">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex items-center gap-1 text-xs sm:text-sm font-black text-amber-300">
              <span className="px-1.5 py-0.5 rounded bg-slate-950/80 border border-amber-500/30">
                {String(timeLeft.hours).padStart(2, "0")}h
              </span>
              <span>:</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-950/80 border border-amber-500/30">
                {String(timeLeft.minutes).padStart(2, "0")}m
              </span>
              <span>:</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-950/80 border border-amber-500/30 text-rose-400">
                {String(timeLeft.seconds).padStart(2, "0")}s
              </span>
            </div>
          </div>

          <Link
            href="/play"
            onClick={() => sounds.playJumpSound()}
            className="px-3.5 sm:px-4 py-2 rounded-xl font-black text-xs font-mono bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <span>JOIN BOUNTY</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
