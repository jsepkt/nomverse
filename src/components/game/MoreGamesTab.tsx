"use client";

import React, { useState, useEffect, useRef } from "react";
import { sounds } from "../audio/soundEffects";
import {
  Gamepad2,
  Play,
  ExternalLink,
  Sparkles,
  Code2,
  Flame,
  Volume2,
  Trophy,
  RotateCcw,
  Zap,
  Swords,
  Layers,
} from "lucide-react";

export const MoreGamesTab: React.FC = () => {
  // Mini-Game 2: Flappy Waddle State
  const [flappyActive, setFlappyActive] = useState(false);
  const [flappyScore, setFlappyScore] = useState(0);
  const [flappyBest, setFlappyBest] = useState(0);
  const [flappyY, setFlappyY] = useState(60);
  const [flappyGameOver, setFlappyGameOver] = useState(false);

  // Mini-Game 3: Mega-FUD Tap Raid State
  const [bossHp, setBossHp] = useState(500);
  const [bossMaxHp] = useState(500);
  const [tapHits, setTapHits] = useState(0);
  const [floatingDamages, setFloatingDamages] = useState<{ id: number; dmg: number; x: number; y: number }[]>([]);

  // Mini-Game 4: NomBeats Soundboard
  const [activeBeat, setActiveBeat] = useState<string | null>(null);

  // Flappy gravity loop
  useEffect(() => {
    if (!flappyActive || flappyGameOver) return;
    const interval = setInterval(() => {
      setFlappyY((prev) => {
        const next = prev + 4;
        if (next >= 120) {
          setFlappyGameOver(true);
          sounds.playFUDHit();
          return 120;
        }
        return next;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [flappyActive, flappyGameOver]);

  const handleFlappyJump = () => {
    if (!flappyActive) {
      setFlappyActive(true);
      setFlappyGameOver(false);
      setFlappyScore(0);
      setFlappyY(40);
    } else if (flappyGameOver) {
      setFlappyGameOver(false);
      setFlappyScore(0);
      setFlappyY(40);
    } else {
      setFlappyY((prev) => Math.max(10, prev - 24));
      setFlappyScore((prev) => {
        const next = prev + 1;
        if (next > flappyBest) setFlappyBest(next);
        return next;
      });
      sounds.playNom();
    }
  };

  const handleTapBoss = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = typeof e.clientX === "number" && e.clientX > 0 ? e.clientX - rect.left : rect.width / 2;
    const y = typeof e.clientY === "number" && e.clientY > 0 ? e.clientY - rect.top : rect.height / 2;

    const dmg = Math.floor(Math.random() * 15) + 10;
    sounds.playBossHit();
    setTapHits((prev) => prev + 1);
    setBossHp((prev) => {
      const next = Math.max(0, prev - dmg);
      if (next === 0) {
        sounds.playGoldenChime();
      }
      return next;
    });

    const newFloating = { id: Date.now() + Math.random(), dmg, x, y };
    setFloatingDamages((prev) => [...prev.slice(-6), newFloating]);
  };

  const playBeatSound = (type: string) => {
    setActiveBeat(type);
    setTimeout(() => setActiveBeat(null), 250);

    switch (type) {
      case "laser":
        sounds.playBossHit();
        break;
      case "nom":
        sounds.playNom();
        break;
      case "chime":
        sounds.playGoldenChime();
        break;
      case "bomb":
        sounds.playFUDHit();
        break;
      default:
        sounds.playNom();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <span>NomVerse Arcade Commons</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Community Sandbox
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Play community-crafted mini-games, test indie engine prototypes, or build your own with our CC0 open-source starter.
          </p>
        </div>

        <a
          href="https://github.com/jsepkt/nomverse"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all shrink-0 hover:scale-105"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Fork Game Starter</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Grid of Mini-Games */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GAME 1: Primary Nomster Candy Catcher */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-950 border border-emerald-500/40 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                Flagship Arcade
              </span>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                Active in Console
              </span>
            </div>

            <div>
              <h4 className="text-lg font-black text-white flex items-center gap-2">
                <span>Nomster Candy Catcher</span>
                <span className="text-lg">🍬</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                The core high-precision physics arcade experience. Catch falling candles, evade red glitch bombs, trigger NOM-RAGE fever overdrive, and unlock community skins.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-center">
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[9px] text-slate-400">ENGINE</div>
                <div className="text-xs font-bold text-white">Phaser 3</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[9px] text-slate-400">LIVES</div>
                <div className="text-xs font-bold text-pink-400">5 Hearts</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[9px] text-slate-400">FPS</div>
                <div className="text-xs font-bold text-emerald-400">60 Native</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Playing in left panel</span>
            <span className="text-emerald-400 font-bold">100% CC0 Public Domain</span>
          </div>
        </div>

        {/* GAME 2: Nomster Flappy Waddle (Playable Interactive Prototype) */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/30">
                Community Prototype #1
              </span>
              <span className="text-xs font-mono text-amber-400 font-bold flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" /> Best: {flappyBest}
              </span>
            </div>

            <div>
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <span>Nomster Flappy Waddle</span>
                <span className="text-lg">🪽</span>
              </h4>
              <p className="text-xs text-slate-400">
                Tap to flap! Keep Nomster airborne above the candlestick obstacles.
              </p>
            </div>

            {/* Interactive Flappy Arena */}
            <div
              onClick={handleFlappyJump}
              className="relative w-full h-36 rounded-xl bg-[#081020] border border-cyan-500/30 overflow-hidden cursor-pointer flex flex-col items-center justify-between p-2 select-none"
            >
              {/* Score HUD */}
              <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400 z-10">
                <span>TAP TO FLAP</span>
                <span className="text-lg font-black font-mono text-cyan-300">{flappyScore}</span>
              </div>

              {/* Character */}
              <div
                className="absolute left-1/2 -translate-x-1/2 text-2xl transition-all duration-75"
                style={{ top: `${flappyY}px` }}
              >
                🦆
              </div>

              {/* Ground & Candlesticks Visual */}
              <div className="w-full flex items-end justify-around h-8 border-t border-emerald-500/30 bg-emerald-950/20 z-10">
                <div className="w-3 h-6 bg-emerald-500/40 rounded-t" />
                <div className="w-3 h-4 bg-rose-500/40 rounded-t" />
                <div className="w-3 h-7 bg-emerald-500/40 rounded-t" />
                <div className="w-3 h-5 bg-emerald-500/40 rounded-t" />
              </div>

              {/* Game Over Overlay */}
              {flappyGameOver && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-1 z-20">
                  <span className="text-xs font-mono text-rose-400 font-bold">OOF! BONKED!</span>
                  <span className="text-[10px] font-mono text-slate-300">Tap anywhere to retry</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Contributed by: @pixelnommer</span>
            <button
              onClick={handleFlappyJump}
              className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
            >
              <Play className="w-3 h-3 fill-cyan-400" />
              <span>Flap Jump</span>
            </button>
          </div>
        </div>

        {/* GAME 3: Mega-FUD Tap Raid Boss Clicker */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/30">
                Community Prototype #2
              </span>
              <span className="text-xs font-mono text-rose-400 font-bold">
                {bossHp} / {bossMaxHp} HP
              </span>
            </div>

            <div>
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <span>Lord Mega-FUD Tap Clicker</span>
                <span className="text-lg">👾</span>
              </h4>
              <p className="text-xs text-slate-400">
                Rapid tap battle! Deal rapid damage to banish the FUD monster.
              </p>
            </div>

            {/* Tap Raid Boss Arena */}
            <div className="relative w-full h-36 rounded-xl bg-slate-950/80 border border-rose-500/30 flex flex-col items-center justify-between p-3 select-none overflow-hidden">
              {/* HP Bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-100"
                  style={{ width: `${(bossHp / bossMaxHp) * 100}%` }}
                />
              </div>

              {/* Tap Target Button */}
              <button
                onClick={handleTapBoss}
                className="w-16 h-16 rounded-2xl bg-rose-500/15 border-2 border-rose-500/50 hover:border-rose-400 flex items-center justify-center text-3xl transition-transform active:scale-90 hover:scale-105 shadow-[0_0_20px_rgba(244,63,94,0.3)] relative"
              >
                👾
                {/* Floating Damage Numbers */}
                {floatingDamages.map((item) => (
                  <span
                    key={item.id}
                    className="absolute text-xs font-mono font-black text-amber-300 pointer-events-none animate-ping"
                    style={{ left: `${item.x}px`, top: `${item.y}px` }}
                  >
                    -{item.dmg}
                  </span>
                ))}
              </button>

              <div className="text-[10px] font-mono text-slate-400">
                {bossHp === 0 ? "🎉 VICTORY! Boss banishment complete!" : `Total Attacks: ${tapHits}`}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Contributed by: @solslayer</span>
            <button
              onClick={() => {
                setBossHp(500);
                setTapHits(0);
                sounds.playGoldenChime();
              }}
              className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Boss</span>
            </button>
          </div>
        </div>

        {/* GAME 4: NomBeats 8-Bit Chiptune Jam */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/30">
                Community Prototype #3
              </span>
              <span className="text-xs font-mono text-purple-400 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5" /> Web Audio Synth
              </span>
            </div>

            <div>
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <span>NomBeats Rhythm Jam</span>
                <span className="text-lg">🎹</span>
              </h4>
              <p className="text-xs text-slate-400">
                Zero-asset 8-bit soundboard. Tap live synth pads to create arcade riffs.
              </p>
            </div>

            {/* Soundboard Pads */}
            <div className="grid grid-cols-2 gap-2 h-36">
              <button
                onClick={() => playBeatSound("nom")}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                  activeBeat === "nom"
                    ? "bg-emerald-500/30 border-emerald-400 text-emerald-300 scale-95"
                    : "bg-slate-950/60 border-slate-800 hover:border-emerald-500/40 text-slate-200"
                }`}
              >
                <span className="text-xl">🍬</span>
                <span className="text-[10px] font-mono font-bold uppercase">Nom Pop</span>
              </button>

              <button
                onClick={() => playBeatSound("laser")}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                  activeBeat === "laser"
                    ? "bg-cyan-500/30 border-cyan-400 text-cyan-300 scale-95"
                    : "bg-slate-950/60 border-slate-800 hover:border-cyan-500/40 text-slate-200"
                }`}
              >
                <span className="text-xl">⚡</span>
                <span className="text-[10px] font-mono font-bold uppercase">Laser Zap</span>
              </button>

              <button
                onClick={() => playBeatSound("chime")}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                  activeBeat === "chime"
                    ? "bg-amber-500/30 border-amber-400 text-amber-300 scale-95"
                    : "bg-slate-950/60 border-slate-800 hover:border-amber-500/40 text-slate-200"
                }`}
              >
                <span className="text-xl">🌟</span>
                <span className="text-[10px] font-mono font-bold uppercase">Gold Chime</span>
              </button>

              <button
                onClick={() => playBeatSound("bomb")}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                  activeBeat === "bomb"
                    ? "bg-rose-500/30 border-rose-400 text-rose-300 scale-95"
                    : "bg-slate-950/60 border-slate-800 hover:border-rose-500/40 text-slate-200"
                }`}
              >
                <span className="text-xl">💣</span>
                <span className="text-[10px] font-mono font-bold uppercase">FUD Boom</span>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Contributed by: @synthsol</span>
            <span className="text-purple-400 font-bold">Pure Synthesized Audio</span>
          </div>
        </div>
      </div>
    </div>
  );
};
