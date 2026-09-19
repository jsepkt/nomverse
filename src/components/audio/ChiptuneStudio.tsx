"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { sounds } from "./soundEffects";
import {
  Play,
  Square,
  Volume2,
  VolumeX,
  Music,
  Sparkles,
  Sliders,
  RotateCcw,
  Zap,
  Radio,
} from "lucide-react";

type PatternGrid = boolean[][];

const PRESETS: Record<string, PatternGrid> = {
  "Solana Groove": [
    [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false], // Kick
    [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false], // Snare
    [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],             // Hi-Hat
    [true, false, true, false, true, true, false, true, false, true, false, true, true, false, true, false],      // Arp Melody
  ],
  "Boss Rush": [
    [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],     // Kick
    [false, false, true, false, false, true, false, true, false, false, true, false, false, true, false, true],  // Snare
    [true, true, false, true, true, false, true, true, true, true, false, true, true, false, true, true],         // Hi-Hat
    [true, true, true, false, true, true, true, false, true, false, true, true, true, true, false, true],         // Arp Melody
  ],
  "Cyber Chill": [
    [true, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false], // Kick
    [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false], // Snare
    [false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true],     // Hi-Hat
    [true, false, false, true, false, false, true, false, true, false, true, false, false, true, false, false],    // Arp Melody
  ],
};

const TRACK_NAMES = [
  { name: "8-Bit Kick", emoji: "🥁", color: "text-rose-400" },
  { name: "Glitch Snare", emoji: "💥", color: "text-amber-400" },
  { name: "Laser Hi-Hat", emoji: "⚡", color: "text-emerald-400" },
  { name: "Solana Arp", emoji: "🍬", color: "text-solana-purple" },
];

export const ChiptuneStudio: React.FC = () => {
  const [grid, setGrid] = useState<PatternGrid>(PRESETS["Solana Groove"]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [bpm, setBpm] = useState<number>(128);
  const [isBgmSynced, setIsBgmSynced] = useState<boolean>(false);

  const stepRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const gridRef = useRef<PatternGrid>(grid);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const tick = useCallback(() => {
    const step = stepRef.current;
    const currentG = gridRef.current;

    // Trigger sounds for active pads in this step
    if (currentG[0][step]) sounds.playKick();
    if (currentG[1][step]) sounds.playSnare();
    if (currentG[2][step]) sounds.playHiHat();
    if (currentG[3][step]) sounds.playArp(step);

    setCurrentStep(step);
    stepRef.current = (step + 1) % 16;
  }, []);

  // Timer loop based on BPM
  useEffect(() => {
    if (isPlaying) {
      const stepDurationMs = (60 / bpm / 2) * 1000;
      intervalRef.current = setInterval(tick, stepDurationMs);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      stepRef.current = 0;
      setCurrentStep(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, bpm, tick]);

  const togglePad = (trackIdx: number, stepIdx: number) => {
    setGrid((prev) => {
      const next = prev.map((row, r) =>
        row.map((val, c) => (r === trackIdx && c === stepIdx ? !val : val))
      );
      return next;
    });

    // Preview sound on tap
    if (!isPlaying) {
      if (trackIdx === 0) sounds.playKick();
      if (trackIdx === 1) sounds.playSnare();
      if (trackIdx === 2) sounds.playHiHat();
      if (trackIdx === 3) sounds.playArp(stepIdx);
    }
  };

  const handleClear = () => {
    setGrid([
      Array(16).fill(false),
      Array(16).fill(false),
      Array(16).fill(false),
      Array(16).fill(false),
    ]);
  };

  const handleToggleBgmSync = () => {
    if (isBgmSynced) {
      sounds.stopCustomBgm();
      setIsBgmSynced(false);
    } else {
      sounds.startCustomBgm(grid, bpm);
      setIsBgmSynced(true);
      sounds.playGoldenChime();
    }
  };

  return (
    <div className="w-full bg-surface border border-slate-800/80 rounded-2xl p-5 sm:p-7 shadow-2xl select-none">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🎹</span>
            <h3 className="text-lg font-black text-white tracking-tight">
              NomBeats 16-Step Chiptune Sequencer
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-solana-purple/10 text-solana-purple text-[10px] font-mono font-bold border border-solana-purple/30">
              Web Audio Synthesizer
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Compose 16-step chiptune beats and synchronize directly with the Phaser arcade cabinet.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              isPlaying
                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                : "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 hover:scale-105"
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>STOP</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>PREVIEW PLAY</span>
              </>
            )}
          </button>

          {/* Apply to Arcade BGM Toggle */}
          <button
            onClick={handleToggleBgmSync}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
              isBgmSynced
                ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-pulse"
                : "bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
            title="Loop this custom beat as the in-game arcade background soundtrack"
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isBgmSynced ? "♪ In-Game BGM ON" : "Apply to Arcade BGM"}</span>
          </button>

          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all"
            title="Clear all steps"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Sequencer Grid (16 Steps) */}
      <div className="space-y-2.5 sm:space-y-3 mb-6 overflow-x-auto pb-2">
        {grid.map((trackRow, trackIdx) => {
          const trackInfo = TRACK_NAMES[trackIdx];

          return (
            <div key={trackIdx} className="flex items-center gap-2 sm:gap-3 min-w-[580px]">
              {/* Track Name */}
              <div className="w-24 sm:w-28 flex items-center gap-1.5 shrink-0 text-xs font-mono font-bold text-slate-300">
                <span>{trackInfo.emoji}</span>
                <span className="truncate">{trackInfo.name}</span>
              </div>

              {/* 16 Step Pads */}
              <div
                className="flex-1 gap-1"
                style={{ display: "grid", gridTemplateColumns: "repeat(16, minmax(0, 1fr))" }}
              >
                {trackRow.map((isActive, stepIdx) => {
                  const isCurrent = isPlaying && currentStep === stepIdx;
                  const isMeasureMarker = stepIdx % 4 === 0;

                  return (
                    <button
                      key={stepIdx}
                      onClick={() => togglePad(trackIdx, stepIdx)}
                      className={`h-9 sm:h-10 rounded-lg border transition-all active:scale-90 flex items-center justify-center ${
                        isActive
                          ? isCurrent
                            ? "bg-white text-slate-950 border-white shadow-[0_0_15px_rgba(255,255,255,0.8)] scale-105"
                            : "bg-emerald-500/80 border-emerald-400 text-slate-950 shadow-[0_0_10px_rgba(20,241,149,0.3)]"
                          : isCurrent
                          ? "bg-slate-800 border-slate-600"
                          : isMeasureMarker
                          ? "bg-slate-900/90 border-slate-700 hover:border-slate-600"
                          : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {isActive && (
                        <div className="w-2 h-2 rounded-full bg-slate-950/90" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Controls: Presets & Tempo BPM */}
      <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
        {/* Preset Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400">Presets:</span>
          {Object.keys(PRESETS).map((pName) => (
            <button
              key={pName}
              onClick={() => setGrid(PRESETS[pName])}
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all hover:scale-105 active:scale-95"
            >
              {pName}
            </button>
          ))}
        </div>

        {/* BPM Tempo Slider */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <span className="text-slate-400">Tempo:</span>
          <input
            type="range"
            min={80}
            max={160}
            step={2}
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value, 10))}
            className="w-28 accent-emerald-400 cursor-pointer"
          />
          <span className="font-bold text-solana-green w-14 text-right">
            {bpm} BPM
          </span>
        </div>
      </div>
    </div>
  );
};
