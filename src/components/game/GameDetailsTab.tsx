"use client";

import React, { useState, useEffect } from "react";
import { EPISODES, getEpisodeProgress, EpisodeProgress } from "@/lib/episodes";
import { useAuth } from "@/context/AuthContext";
import {
  Sparkles,
  Trophy,
  Gamepad2,
  Shield,
  Zap,
  Bomb,
  Heart,
  Flame,
  Star,
  Lock,
  CheckCircle2,
  Info,
  Swords,
  ChevronRight,
} from "lucide-react";

interface GameDetailsTabProps {
  onSelectEpisode?: (episodeId: string) => void;
}

const CANDY_ENCYCLOPEDIA = [
  {
    name: "Common Green Candies",
    score: "+1 Point",
    badge: "Common",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    color: "#14F195",
    desc: "Plentiful fresh harvest from the pump.fun pastures. Builds your baseline combo and triggers happy waddle squeaks.",
    icon: "🍬",
    comboEffect: "+1 Streak Counter",
  },
  {
    name: "Solana Super Candy",
    score: "+3 Points",
    badge: "Rare",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    color: "#00F0FF",
    desc: "Infused with Solana high-throughput sugar. Generates an instant cyan shockwave and boosts your Fever overdrive meter.",
    icon: "💎",
    comboEffect: "+25% Fever Meter",
  },
  {
    name: "Golden Feast Candy",
    score: "+5 Points",
    badge: "Epic",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    color: "#F59E0B",
    desc: "Legendary golden drops that shimmer across the screen. Collect to unleash screen-wide confetti bursts and double streak multipliers.",
    icon: "🌟",
    comboEffect: "2x Combo Multiplier",
  },
  {
    name: "Pepper Dash Boost",
    score: "Active Power-Up",
    badge: "Power-Up",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    color: "#EF4444",
    desc: "Supercharges Nomster's little legs! 2x waddle movement speed for 6 seconds with blazing fire particle trail.",
    icon: "🌶️",
    comboEffect: "200% Waddle Speed",
  },
  {
    name: "Rainbow Aegis Shield",
    score: "Active Power-Up",
    badge: "Power-Up",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    color: "#A855F7",
    desc: "Iridescent protective bubble that absorbs 1 miss penalty or accidental bomb contact without losing a precious heart.",
    icon: "🛡️",
    comboEffect: "1 Miss Damage Absorption",
  },
  {
    name: "Mega-FUD Glitch Bomb",
    score: "-1 Heart / Damage",
    badge: "Hazard",
    badgeColor: "bg-red-950/80 text-red-400 border-red-500/40",
    color: "#DC2626",
    desc: "Corrupted toxic FUD payload hurled by paper hands. Avoid catching at all costs! Explodes with red screen shake if hit.",
    icon: "💣",
    comboEffect: "Resets Combo to 0",
  },
  {
    name: "Heart Drop Revival",
    score: "+1 Heart Restored",
    badge: "Survival",
    badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    color: "#EC4899",
    desc: "Spawns every 2 minutes of continuous survival gameplay. Catches immediately replenish 1 lost heart (up to 10 max).",
    icon: "💖",
    comboEffect: "Restores +1 Heart",
  },
];

export const GameDetailsTab: React.FC<GameDetailsTabProps> = ({ onSelectEpisode }) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Record<string, EpisodeProgress>>({});
  const [activeSection, setActiveSection] = useState<"stages" | "candies" | "controls" | "raid">("stages");

  useEffect(() => {
    const loaded = getEpisodeProgress(user?.id || "guest");
    setProgress(loaded);
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Mini Navigation Pill Filter */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800">
        <button
          onClick={() => setActiveSection("stages")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
            activeSection === "stages"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Story Episodes ({EPISODES.length})</span>
        </button>

        <button
          onClick={() => setActiveSection("candies")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
            activeSection === "candies"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Candy Encyclopedia ({CANDY_ENCYCLOPEDIA.length})</span>
        </button>

        <button
          onClick={() => setActiveSection("controls")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
            activeSection === "controls"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>Controls &amp; Toddler Mode</span>
        </button>

        <button
          onClick={() => setActiveSection("raid")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
            activeSection === "raid"
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Swords className="w-3.5 h-3.5" />
          <span>World Raid Boss Intel</span>
        </button>
      </div>

      {/* SECTION 1: ALL STAGES ROADMAP */}
      {activeSection === "stages" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Episodic Campaign Roadmap</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Season 1 Active
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Clear target scores, dodge red bombs, and battle Lord Mega-FUD across 5 dynamic stages.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {EPISODES.map((ep) => {
              const epProg = progress[ep.id] || {
                unlocked: ep.number === 1,
                stars: 0,
                highScore: 0,
                completed: false,
              };

              return (
                <div
                  key={ep.id}
                  className={`p-4 rounded-2xl border transition-all relative overflow-hidden ${
                    epProg.completed
                      ? "bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_20px_rgba(20,241,149,0.1)]"
                      : epProg.unlocked
                      ? "bg-slate-900/80 border-slate-700/80 hover:border-slate-600 shadow-md"
                      : "bg-slate-950/40 border-slate-800/40 opacity-70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl border shadow-inner shrink-0"
                        style={{
                          backgroundColor: `${ep.themeColor}15`,
                          borderColor: `${ep.themeColor}50`,
                        }}
                      >
                        {ep.icon}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">
                            Episode {ep.number}
                          </span>
                          {ep.isBossEpisode && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold animate-pulse">
                              BOSS RAID
                            </span>
                          )}
                          {ep.isComingSoon && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                              COMING SOON
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-black text-white leading-tight mt-0.5">
                          {ep.title}
                        </h4>
                        <span className="text-xs text-slate-400 italic">
                          {ep.subtitle}
                        </span>
                      </div>
                    </div>

                    {/* Progress / Status Tag */}
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      {epProg.completed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Cleared</span>
                        </span>
                      ) : epProg.unlocked ? (
                        <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">
                          Ready
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                          <Lock className="w-3 h-3" />
                          <span>Locked</span>
                        </span>
                      )}

                      {/* Stars */}
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              (epProg.stars || 0) >= star
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-800 fill-slate-800/40"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300/90 leading-relaxed mt-3 line-clamp-2">
                    {ep.lore}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/70 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <div>
                      <span>Target: </span>
                      <strong className="text-emerald-400">{ep.targetScore} Pts</strong>
                    </div>
                    <div>
                      <span>Title: </span>
                      <strong className="text-amber-300">{ep.rewardTitle}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: CANDY ENCYCLOPEDIA */}
      {activeSection === "candies" && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span>The Candy &amp; Power-Up Field Manual</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Official Drop Tables
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Learn every sugar payload, power-up duration, and hazard in the NomVerse arcade engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {CANDY_ENCYCLOPEDIA.map((item) => (
              <div
                key={item.name}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <h4 className="text-sm font-bold text-white">{item.name}</h4>
                        <span className="text-[11px] font-mono font-black" style={{ color: item.color }}>
                          {item.score}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border font-bold ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500">Effect:</span>
                  <span className="text-emerald-400 font-bold">{item.comboEffect}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: CONTROLS & TODDLER MODE */}
      {activeSection === "controls" && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span>Ergonomic Controls &amp; Accessibility</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Play Anywhere
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Engineered for seamless play across touchscreens, mobile browsers, and mechanical desktop keyboards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Desktop Controls */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Gamepad2 className="w-4 h-4 text-emerald-400" />
                <span>Desktop Keyboard</span>
              </div>
              <ul className="text-xs space-y-2 font-mono text-slate-300">
                <li className="flex items-center justify-between">
                  <span>Waddle Left:</span>
                  <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-bold">A / ←</kbd>
                </li>
                <li className="flex items-center justify-between">
                  <span>Waddle Right:</span>
                  <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-bold">D / →</kbd>
                </li>
                <li className="flex items-center justify-between">
                  <span>Start Drop / Dash:</span>
                  <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-bold">Space</kbd>
                </li>
                <li className="flex items-center justify-between">
                  <span>Toggle Fullscreen:</span>
                  <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-bold">F</kbd>
                </li>
                <li className="flex items-center justify-between">
                  <span>Exit Window:</span>
                  <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-white font-bold">Esc</kbd>
                </li>
              </ul>
            </div>

            {/* Mobile Thumb Paddles */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <span className="text-base">📱</span>
                <span>Mobile Waddle Paddles</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                When playing on phones, large on-screen thumb buttons dynamically render at the bottom of the screen.
              </p>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] font-mono text-cyan-300">
                Tap and hold either paddle to smoothly accelerate Nomster across the screen with natural deceleration friction.
              </div>
            </div>

            {/* Toddler Mode Guide */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
                <span className="text-base">🧸</span>
                <span>Toddler Mode (Age 3-5)</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Designed for preschoolers and casual chill play:
              </p>
              <ul className="text-xs space-y-1.5 text-amber-200/90 list-disc list-inside font-mono">
                <li>Floaty gentle candy drops (-40% gravity)</li>
                <li>+60% wider catch hitbox radius</li>
                <li>Gentle vacuum magnet pulls near candies</li>
                <li>Automatic gentle waddle steering assist</li>
                <li>Relaxed fail-states and endless joy</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: WORLD RAID BOSS INTEL */}
      {activeSection === "raid" && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-purple-950/40 border border-rose-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-3xl shrink-0 animate-bounce">
                👾
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold">
                    Global World Event
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[9px] font-mono font-bold">
                    LIVE NOW
                  </span>
                </div>
                <h3 className="text-base font-black text-white">Lord Mega-FUD: The Liquidity Leech</h3>
              </div>
            </div>

            <div className="text-right font-mono">
              <div className="text-xs text-slate-400">Total Bounty Pool</div>
              <div className="text-base font-black text-candy-gold">1,000,000 $NOM</div>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Lord Mega-FUD is a collective community raid boss. Every candy collected during gameplay chips away at his global HP bar. When defeated, all active players who contributed damage receive exclusive community badges, karma points, and bonus lives on the NomWall!
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center font-mono">
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Damage per Candy</div>
              <div className="text-sm font-bold text-emerald-400">+10 DMG</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Streak Multiplier</div>
              <div className="text-sm font-bold text-amber-400">Up to 3x</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">Fever Blast</div>
              <div className="text-sm font-bold text-solana-green">+500 DMG</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase">SOS Life Share</div>
              <div className="text-sm font-bold text-cyan-300">Instant Gift</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
