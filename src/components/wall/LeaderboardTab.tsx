"use client";

import React, { useState } from "react";
import Image from "next/image";
import { SEED_LEADERBOARD, LeaderboardEntry } from "@/lib/leaderboard";
import { UserBadge } from "../auth/UserBadge";
import { useAuth } from "@/context/AuthContext";
import { Trophy, Heart, Flame, Sparkles, Medal } from "lucide-react";

export const LeaderboardTab: React.FC = () => {
  const { user } = useAuth();
  const [view, setView] = useState<"scores" | "lifesavers">("scores");

  const sortedList = [...SEED_LEADERBOARD].sort((a, b) =>
    view === "scores" ? b.highScore - a.highScore : b.karma - a.karma
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tab Switcher: Top Scores vs Top Lifesavers */}
      <div className="flex justify-center px-2">
        <div className="p-1 rounded-2xl bg-slate-900/90 border border-slate-800/80 backdrop-blur-xl inline-flex items-center gap-1.5 shadow-lg">
          <button
            onClick={() => setView("scores")}
            className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              view === "scores"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent"
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">Top Devourers (High Score)</span>
            <span className="sm:hidden">High Scores</span>
          </button>

          <button
            onClick={() => setView("lifesavers")}
            className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              view === "lifesavers"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.25)]"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent"
            }`}
          >
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
            <span className="hidden sm:inline">Nomster Guardians (Lifesavers)</span>
            <span className="sm:hidden">Lifesavers</span>
          </button>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        {sortedList.slice(0, 3).map((entry, idx) => {
          const rankColors = [
            "border-amber-400/50 bg-amber-500/10 text-amber-300",
            "border-slate-300/40 bg-slate-400/10 text-slate-200",
            "border-amber-700/40 bg-amber-800/10 text-amber-400",
          ];
          const medals = ["🥇 1st Place", "🥈 2nd Place", "🥉 3rd Place"];

          return (
            <div
              key={entry.userId}
              className={`p-5 rounded-2xl border text-center relative overflow-hidden flex flex-col justify-between ${rankColors[idx]}`}
            >
              <div>
                <div className="font-mono text-xs font-bold uppercase tracking-wider mb-2">
                  {medals[idx]}
                </div>
                <div className="relative w-14 h-14 mx-auto mb-2 rounded-full bg-slate-900 border border-slate-700 p-1 flex items-center justify-center">
                  <Image
                    src="/mascot.svg"
                    alt="Nomster Leader"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                  {entry.equippedSkin === "crown" && (
                    <span className="absolute -top-3 text-base">👑</span>
                  )}
                  {entry.equippedSkin === "shades" && (
                    <span className="absolute -top-1 text-sm">🕶️</span>
                  )}
                  {entry.equippedSkin === "cap" && (
                    <span className="absolute -top-2 text-sm">🧢</span>
                  )}
                </div>
                <h4 className="font-bold text-sm text-white truncate max-w-[150px] mx-auto">
                  {entry.name}
                </h4>
                <div className="mt-1 flex justify-center">
                  <UserBadge provider={entry.provider} />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80">
                {view === "scores" ? (
                  <div>
                    <span className="text-2xl font-black font-mono text-white">
                      {entry.highScore}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 ml-1">candies</span>
                    <div className="text-[10px] text-amber-400 font-mono">
                      x{entry.maxStreak} Max Streak
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="text-2xl font-black font-mono text-rose-400">
                      {entry.karma}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 ml-1">Karma</span>
                    <div className="text-[10px] text-rose-300 font-mono">
                      ❤️ {Math.floor(entry.karma / 10)} Lives Gifted
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Leaderboard Table */}
      <div className="rounded-2xl bg-surface border border-slate-800 overflow-hidden shadow-lg">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-[11px] font-mono uppercase text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Rank</th>
              <th className="py-3 px-4">Builder</th>
              <th className="py-3 px-4 text-center">
                {view === "scores" ? "High Score" : "Lifesaver Karma"}
              </th>
              <th className="py-3 px-4 text-right">
                {view === "scores" ? "Max Streak" : "Lives Given"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sortedList.map((entry, idx) => {
              const isCurrentUser = user && user.id === entry.userId;
              return (
                <tr
                  key={entry.userId}
                  className={`hover:bg-slate-900/50 transition-colors ${
                    isCurrentUser ? "bg-emerald-500/10 font-semibold" : ""
                  }`}
                >
                  <td className="py-3 px-4 font-mono font-bold text-slate-400">
                    #{idx + 1}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{entry.name}</span>
                      <UserBadge provider={entry.provider} />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-black text-sm text-emerald-400">
                    {view === "scores" ? `${entry.highScore} 🍬` : `${entry.karma} ❤️`}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-400">
                    {view === "scores"
                      ? `x${entry.maxStreak}`
                      : `${Math.floor(entry.karma / 10)} gifted`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
