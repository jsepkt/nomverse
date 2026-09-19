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
} from "lucide-react";

type PatternGrid = boolean[][];

const PRESETS: Record<string, PatternGrid> = {
  "Solana Groove": [
    [true, false, false, false, true, false, false, false], // Kick
    [false, false, true, false, false, false, true, false], // Snare
    [true, true, true, true, true, true, true, true],       // Hi-Hat
    [true, false, true, false, true, true, false, true],    // Arp Melody
  ],
  "Boss Rush": [
    [true, false, true, false, true, false, true, false],   // Kick
    [false, false, true, false, false, true, false, true],  // Snare
    [true, true, false, true, true, false, true, true],     // Hi-Hat
    [true, true, true, false, true, true, true, false],     // Arp Melody
  ],
  "Cyber Chill": [
    [true, false, false, false, false, false, true, false], // Kick
    [false, false, false, false, true, false, false, false], // Snare
    [false, true, false, true, false, true, false, true],    // Hi-Hat
    [true, false, false, true, false, false, true, false],   // Arp Melody
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
    stepRef.current = (step + 1) % 8;
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
      [false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false],
      [false, false, false, false, false, false, false, false],
    ]);
  };

  return (
    <div className="w-full bg-surface border border-slate-800/80 rounded-2xl p-5 sm:p-7 shadow-2xl select-none">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30 mb-2">
            <Music className="w-3.5 h-3.5" />
            <span>8-BIT SYNTH ENGINE</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            NomBeats: Chiptune Beat Studio
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Synthesize retro 8-bit beats using Web Audio API nodes. Keep your custom rhythm jamming in the background!
          </p>
        </div>

        {/* Master Transport Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all shadow-lg active:scale-95 ${
              isPlaying
                ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20"
                : "bg-gradient-to-r from-emerald-500 to-solana-green text-slate-950 shadow-emerald-500/20"
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                <span>STOP BEAT</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>PLAY LOOP</span>
              </>
            )}
          </button>

          <button
            onClick={handleClear}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title="Clear Sequencer Grid"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sequencer Matrix */}
      <div className="space-y-3 mb-6">
        {/* Step Indicator Lights (Aligned pixel-perfect with step pads) */}
        <div className="flex items-center gap-2 sm:gap-3 pl-24 sm:pl-28 pr-1">
          <div className="flex-1 grid grid-cols-8 gap-1.5 sm:gap-2">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  isPlaying && currentStep === s
                    ? "bg-solana-green shadow-[0_0_10px_#14f195]"
                    : "bg-slate-800"
                }`}
              />
            ))}
          </div>
        </div>

        {/* 4 Instrument Tracks */}
        {grid.map((trackRow, trackIdx) => {
          const trackInfo = TRACK_NAMES[trackIdx];

          return (
            <div key={trackIdx} className="flex items-center gap-2 sm:gap-3">
              {/* Track Name */}
              <div className="w-24 sm:w-28 flex items-center gap-1.5 shrink-0 text-xs font-mono font-bold text-slate-300">
                <span>{trackInfo.emoji}</span>
                <span className="truncate">{trackInfo.name}</span>
              </div>

              {/* 8 Step Pads */}
              <div className="flex-1 grid grid-cols-8 gap-1.5 sm:gap-2">
                {trackRow.map((isActive, stepIdx) => {
                  const isCurrent = isPlaying && currentStep === stepIdx;

                  return (
                    <button
                      key={stepIdx}
                      onClick={() => togglePad(trackIdx, stepIdx)}
                      className={`h-11 sm:h-12 rounded-xl border transition-all active:scale-90 flex items-center justify-center ${
                        isActive
                          ? isCurrent
                            ? "bg-white text-slate-950 border-white shadow-[0_0_20px_rgba(255,255,255,0.8)] scale-105"
                            : "bg-emerald-500/80 border-emerald-400 text-slate-950 shadow-[0_0_12px_rgba(20,241,149,0.3)]"
                          : isCurrent
                          ? "bg-slate-800/90 border-slate-600"
                          : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {isActive && (
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-950/80" />
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
