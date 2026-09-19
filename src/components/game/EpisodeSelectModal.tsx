"use client";

import React, { useEffect, useState } from "react";
import { Portal } from "../ui/Portal";
import { X, Lock, CheckCircle2, Star, Play, Sparkles, Trophy } from "lucide-react";
import { EPISODES, EpisodeConfig, getEpisodeProgress, EpisodeProgress } from "@/lib/episodes";
import { sounds } from "../audio/soundEffects";

interface EpisodeSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEpisode: (episodeId: string | null) => void; // null = Endless Arcade Mode
  currentEpisodeId: string | null;
  userId?: string;
}

export const EpisodeSelectModal: React.FC<EpisodeSelectModalProps> = ({
  isOpen,
  onClose,
  onSelectEpisode,
  currentEpisodeId,
  userId = "guest",
}) => {
  const [progress, setProgress] = useState<Record<string, EpisodeProgress>>({});

  useEffect(() => {
    if (isOpen) {
      setProgress(getEpisodeProgress(userId));
    }
  }, [isOpen, userId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
        <div
          className="fixed inset-0 -z-10"
          onClick={onClose}
          aria-hidden="true"
        />

        <div className="relative w-full max-w-lg bg-slate-900/95 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(20,241,149,0.15)] text-slate-100 max-h-[88vh] overflow-y-auto flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🎬</span>
              <div>
                <h2 className="text-lg sm:text-xl font-black font-mono tracking-tight text-white flex items-center gap-2">
                  <span>STORY EPISODES</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                    SEASON 1
                  </span>
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Defeat chapters to unlock titles &amp; boss battles
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Endless Mode Quick Play */}
          <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-slate-800/80 to-slate-900 border border-slate-700/70 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-black font-mono text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>CLASSIC ENDLESS ARCADE</span>
              </div>
              <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                Dynamic infinite stages, global high scores &amp; Raid Boss hits.
              </p>
            </div>
            <button
              onClick={() => {
                sounds.playCountdownTick();
                onSelectEpisode(null);
                onClose();
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black font-mono transition-all flex items-center gap-1.5 shrink-0 ${
                currentEpisodeId === null
                  ? "bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(20,241,149,0.5)]"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200"
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{currentEpisodeId === null ? "ACTIVE" : "PLAY"}</span>
            </button>
          </div>

          {/* Episodes List */}
          <div className="mt-4 space-y-3">
            {EPISODES.map((ep) => {
              const epData = progress[ep.id] || {
                unlocked: ep.number === 1,
                stars: 0,
                highScore: 0,
                completed: false,
              };
              const isLocked = !epData.unlocked && !ep.isComingSoon;
              const isSelected = currentEpisodeId === ep.id;

              return (
                <div
                  key={ep.id}
                  className={`relative p-4 rounded-2xl border transition-all ${
                    ep.isComingSoon
                      ? "bg-slate-950/60 border-slate-800/80 opacity-75"
                      : isLocked
                      ? "bg-slate-950/70 border-slate-800/60 opacity-60"
                      : isSelected
                      ? "bg-slate-800/90 border-emerald-500/80 shadow-[0_0_20px_rgba(20,241,149,0.2)]"
                      : "bg-slate-800/50 hover:bg-slate-800/80 border-slate-700/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border"
                        style={{
                          backgroundColor: `${ep.themeColor}18`,
                          borderColor: `${ep.themeColor}40`,
                        }}
                      >
                        {ep.icon}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-mono font-bold text-slate-400">
                            EPISODE 0{ep.number}
                          </span>
                          {ep.isBossEpisode && (
                            <span className="text-[9px] px-2 py-0.5 rounded font-black font-mono bg-red-500/20 text-red-400 border border-red-500/30">
                              BOSS FIGHT ⚔️
                            </span>
                          )}
                          {ep.isComingSoon && (
                            <span className="text-[9px] px-2 py-0.5 rounded font-black font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                              COMING SOON
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm sm:text-base font-black font-mono text-white mt-0.5">
                          {ep.title}
                        </h3>

                        <p className="text-xs text-slate-300 font-mono mt-1 leading-relaxed">
                          {ep.lore}
                        </p>

                        {!ep.isComingSoon && (
                          <div className="mt-2.5 flex items-center gap-3 flex-wrap text-[11px] font-mono text-slate-400">
                            <span className="flex items-center gap-1 text-slate-200">
                              🎯 Goal:{" "}
                              <strong className="text-emerald-400">
                                {ep.isBossEpisode ? "Defeat Boss (100 HP)" : `${ep.targetScore} Candies`}
                              </strong>
                            </span>
                            <span className="flex items-center gap-1 text-amber-400">
                              <Trophy className="w-3 h-3" />
                              <span>{ep.rewardTitle}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action / Stars / Lock */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {ep.isComingSoon ? (
                        <span className="text-[10px] font-mono text-cyan-400 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                          SEASON 2
                        </span>
                      ) : isLocked ? (
                        <div className="flex items-center gap-1 text-xs font-mono text-slate-500 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                          <Lock className="w-3.5 h-3.5" />
                          <span>LOCKED</span>
                        </div>
                      ) : (
                        <>
                          {/* Star rating */}
                          <div className="flex items-center gap-0.5 text-amber-400">
                            {[1, 2, 3].map((starIdx) => (
                              <Star
                                key={starIdx}
                                className={`w-3.5 h-3.5 ${
                                  starIdx <= (epData.stars || 0)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-600"
                                }`}
                              />
                            ))}
                          </div>

                          <button
                            onClick={() => {
                              sounds.playCountdownTick();
                              onSelectEpisode(ep.id);
                              onClose();
                            }}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-black font-mono transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(20,241,149,0.5)]"
                                : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
                            }`}
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>{isSelected ? "PLAYING" : "START"}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 text-center">
            <span className="text-[10px] font-mono text-slate-400">
              💡 Tip: Complete Episode 3 to unlock the legendary &quot;FUD Slayer&quot; badge!
            </span>
          </div>
        </div>
      </div>
    </Portal>
  );
};
