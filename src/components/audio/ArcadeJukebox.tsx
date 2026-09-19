"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { sounds } from "./soundEffects";
import { Play, Pause, SkipForward, Volume2, VolumeX, Music } from "lucide-react";

type PatternGrid = boolean[][];

interface JukeboxTrack {
  id: string;
  title: string;
  bpm: number;
  grid: PatternGrid;
}

const TRACKS: JukeboxTrack[] = [
  {
    id: "groove",
    title: "Solana Groove",
    bpm: 128,
    grid: [
      [true, false, false, false, true, false, false, false], // Kick
      [false, false, true, false, false, false, true, false], // Snare
      [true, true, true, true, true, true, true, true],       // Hi-Hat
      [true, false, true, false, true, true, false, true],    // Arp
    ],
  },
  {
    id: "boss",
    title: "Boss Rush",
    bpm: 144,
    grid: [
      [true, false, true, false, true, false, true, false],
      [false, false, true, false, false, true, false, true],
      [true, true, false, true, true, false, true, true],
      [true, true, true, false, true, true, true, false],
    ],
  },
  {
    id: "chill",
    title: "Cyber Chill",
    bpm: 110,
    grid: [
      [true, false, false, false, false, false, true, false],
      [false, false, false, false, true, false, false, false],
      [false, true, false, true, false, true, false, true],
      [true, false, false, true, false, false, true, false],
    ],
  },
];

export const ArcadeJukebox: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [trackIndex, setTrackIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const stepRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const isMutedRef = useRef<boolean>(false);
  const trackRef = useRef<JukeboxTrack>(TRACKS[0]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentTrack = TRACKS[trackIndex];

  useEffect(() => {
    trackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const tick = useCallback(() => {
    if (!isPlayingRef.current || isMutedRef.current) return;
    const step = stepRef.current;
    const g = trackRef.current.grid;

    if (g[0][step]) sounds.playKick();
    if (g[1][step]) sounds.playSnare();
    if (g[2][step]) sounds.playHiHat();
    if (g[3][step]) sounds.playArp(step);

    stepRef.current = (step + 1) % 8;
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const stepDurationMs = (60 / currentTrack.bpm / 2) * 1000;
      intervalRef.current = setInterval(tick, stepDurationMs);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      stepRef.current = 0;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentTrack.bpm, tick]);

  const handleNextTrack = () => {
    setTrackIndex((prev) => (prev + 1) % TRACKS.length);
    stepRef.current = 0;
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return (
    <aside
      aria-label="Arcade Background Jukebox"
      className="fixed bottom-20 lg:bottom-4 right-3 sm:right-4 z-40 pointer-events-auto select-none"
    >
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          aria-label="Open 8-Bit Retro Jukebox"
          title="8-Bit Arcade Music Player"
          className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-950/90 border border-emerald-500/30 hover:border-emerald-500/60 shadow-[0_0_20px_rgba(20,241,149,0.2)] backdrop-blur-md cursor-pointer transition-all hover:scale-105"
        >
          <span className={`w-2 h-2 rounded-full ${isPlaying ? "bg-emerald-400 animate-ping" : "bg-slate-600"}`} />
          <Music className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono font-bold text-slate-200 hidden sm:inline">
            {isPlaying ? currentTrack.title : "8-BIT BGM"}
          </span>
        </button>
      ) : (
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-950/95 border border-emerald-500/40 shadow-[0_0_30px_rgba(20,241,149,0.25)] backdrop-blur-md animate-in fade-in duration-200">
          {/* Play / Pause */}
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause 8-bit Music" : "Play 8-bit Music"}
            className={`p-2 rounded-xl text-slate-950 font-bold transition-all ${
              isPlaying
                ? "bg-emerald-400 shadow-[0_0_15px_rgba(20,241,149,0.5)]"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          {/* Track Info */}
          <div className="flex flex-col pr-1 min-w-[110px]">
            <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
              <Music className="w-3 h-3" />
              <span>8-BIT BGM</span>
            </div>
            <span className="text-xs font-mono font-bold text-white truncate max-w-[120px]">
              {currentTrack.title}
            </span>
          </div>

          {/* Next Track */}
          <button
            onClick={handleNextTrack}
            aria-label="Next track"
            title="Next retro track"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* Mute */}
          <button
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute BGM" : "Mute BGM"}
            className={`p-1.5 rounded-lg transition-colors ${
              isMuted ? "text-rose-400 bg-rose-500/10" : "text-slate-400 hover:text-white"
            }`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Minimize */}
          <button
            onClick={() => setIsExpanded(false)}
            aria-label="Minimize Jukebox"
            title="Minimize to pill"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border-l border-slate-800 ml-0.5"
          >
            ✕
          </button>
        </div>
      )}
    </aside>
  );
};
