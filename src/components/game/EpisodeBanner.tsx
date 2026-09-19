"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Star, Trophy, ArrowRight, RotateCcw } from "lucide-react";
import { EpisodeConfig, EPISODES } from "@/lib/episodes";
import { sounds } from "../audio/soundEffects";

interface EpisodeVictoryCardProps {
  episode: EpisodeConfig;
  score: number;
  streak: number;
  stars: number;
  onNextEpisode?: () => void;
  onReplay: () => void;
}

export const EpisodeVictoryCard: React.FC<EpisodeVictoryCardProps> = ({
  episode,
  score,
  streak,
  stars,
  onNextEpisode,
  onReplay,
}) => {
  useEffect(() => {
    sounds.playBossDefeated();
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.45 },
      colors: ["#14F195", "#9945FF", "#F59E0B", "#38BDF8"],
    });
  }, []);

  const nextIndex = EPISODES.findIndex((e) => e.id === episode.id) + 1;
  const hasNextEpisode = nextIndex < EPISODES.length && !EPISODES[nextIndex].isComingSoon;

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-5 text-center select-none animate-fade-in rounded-2xl">
      {/* Badge icon */}
      <div className="text-4xl sm:text-5xl mb-2 animate-bounce">
        {episode.icon}
      </div>

      <div className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-2">
        EPISODE 0{episode.number} CLEARED!
      </div>

      <h3 className="text-xl sm:text-2xl font-black text-white font-mono mb-1">
        {episode.title}
      </h3>

      {/* Stars */}
      <div className="flex items-center justify-center gap-1.5 my-3">
        {[1, 2, 3].map((s) => (
          <Star
            key={s}
            className={`w-7 h-7 transition-all ${
              s <= stars
                ? "fill-amber-400 text-amber-400 scale-110 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]"
                : "text-slate-700"
            }`}
          />
        ))}
      </div>

      {/* Reward Unlocked */}
      <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 mb-4 flex items-center gap-2">
        <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
        <span>Title Unlocked: </span>
        <strong className="text-emerald-400">{episode.rewardTitle}</strong>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 w-full max-w-xs">
        <button
          onClick={onReplay}
          className="flex-1 py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold font-mono text-xs flex items-center justify-center gap-1.5 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>REPLAY</span>
        </button>

        {hasNextEpisode && onNextEpisode && (
          <button
            onClick={onNextEpisode}
            className="flex-1 py-3 px-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-slate-950 font-black font-mono text-xs flex items-center justify-center gap-1.5 shadow-[0_0_25px_rgba(20,241,149,0.5)] transition-all"
          >
            <span>NEXT EPISODE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
