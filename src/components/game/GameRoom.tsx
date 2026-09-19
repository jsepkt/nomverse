"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GameContainer } from "./GameContainer";
import { GameDetailsTab } from "./GameDetailsTab";
import { MoreGamesTab } from "./MoreGamesTab";
import { DevContributionsTab } from "./DevContributionsTab";
import {
  Gamepad2,
  Maximize2,
  Minimize2,
  Trophy,
  Code2,
  ArrowLeft,
  Sparkles,
  Layers,
  ChevronRight,
  Monitor,
  Smartphone,
  Flame,
  Star,
} from "lucide-react";

interface GameRoomProps {
  initialMode?: "half" | "full";
}

type TabType = "stages" | "more-games" | "devs";

export const GameRoom: React.FC<GameRoomProps> = ({ initialMode = "half" }) => {
  const [screenSize, setScreenSize] = useState<"half" | "full">(initialMode);
  const [activeTab, setActiveTab] = useState<TabType>("stages");
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Auto-detect mobile devices to prioritize full window
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile && initialMode !== "half") {
        setScreenSize("full");
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [initialMode]);

  // Keyboard shortcut listener: 'T' for theater toggle, 'F' for full size
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing in input, ignore
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === "t" || e.key === "T") {
        setScreenSize((prev) => (prev === "half" ? "full" : "half"));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#050914] text-slate-100 flex flex-col">
      {/* Game Room Top Navigation Deck */}
      <div className="sticky top-0 z-40 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-xl px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-md">
        {/* Left: Breadcrumb & Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white transition-all hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Back to NomVerse</span>
            <span className="sm:hidden">Back</span>
          </Link>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-black text-white flex items-center gap-1.5 tracking-tight">
              <span>ARCADE</span>
              <span className="text-solana-green">ROOM</span>
            </span>
            <span className="hidden md:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              CC0 Community Arena
            </span>
          </div>
        </div>

        {/* Right: Screen Size Switcher (Half vs Full) & Shortcut Hint */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Half Size (Split Console) Toggle Button */}
          <button
            onClick={() => setScreenSize("half")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              screenSize === "half"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_15px_rgba(20,241,149,0.25)]"
                : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800"
            }`}
            title="Half Size: Split screen with Stages & Community Tabs (Press T)"
          >
            <Monitor className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Half Size</span>
            <span className="text-[10px] opacity-60 hidden lg:inline">[T]</span>
          </button>

          {/* Full Size (Ultra Arcade) Toggle Button */}
          <button
            onClick={() => setScreenSize("full")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              screenSize === "full"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800"
            }`}
            title="Full Size: Expanded Ultra Arcade view for maximum immersion"
          >
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Full Size</span>
          </button>
        </div>
      </div>

      {/* MAIN GAME ROOM ARENA */}
      <div className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-5 lg:p-6 flex flex-col justify-start">
        {/* VIEW 1: HALF SIZE (SPLIT CONSOLE / THEATER MODE) */}
        {screenSize === "half" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 5-6 Columns: Game Arcade Cabinet */}
            <div className="lg:col-span-6 xl:col-span-5 flex flex-col items-center justify-start sticky top-20">
              <GameContainer />
            </div>

            {/* Right 6-7 Columns: Companion Console Tabs (Stages, More Games, Dev Contributions) */}
            <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-4">
              {/* Tab Switcher Ribbon */}
              <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-lg">
                <button
                  onClick={() => setActiveTab("stages")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition-all ${
                    activeTab === "stages"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                  }`}
                >
                  <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">Stages &amp; Intel</span>
                </button>

                <button
                  onClick={() => setActiveTab("more-games")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition-all ${
                    activeTab === "more-games"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                  }`}
                >
                  <Gamepad2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="truncate">More Games</span>
                </button>

                <button
                  onClick={() => setActiveTab("devs")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition-all ${
                    activeTab === "devs"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                  }`}
                >
                  <Code2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">Contributions &amp; XP</span>
                </button>
              </div>

              {/* Active Tab Panel Body */}
              <div className="p-4 sm:p-5 rounded-3xl bg-slate-950/60 border border-slate-800/80 shadow-xl min-h-[500px]">
                {activeTab === "stages" && <GameDetailsTab />}
                {activeTab === "more-games" && <MoreGamesTab />}
                {activeTab === "devs" && <DevContributionsTab />}
              </div>
            </div>
          </div>
        ) : (
          /* VIEW 2: FULL SIZE (EXPANDED ULTRA ARCADE) */
          <div className="flex flex-col items-center justify-start gap-8 w-full">
            {/* Centered Expanded Arcade Cabinet */}
            <div className="w-full flex justify-center">
              <GameContainer />
            </div>

            {/* Full Size Bottom Companion Deck */}
            <div className="w-full max-w-5xl space-y-4 pt-4 border-t border-slate-800/80">
              {/* Tab Selector */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Arcade Room Companion:
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
                  <button
                    onClick={() => setActiveTab("stages")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      activeTab === "stages"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    All Stages
                  </button>
                  <button
                    onClick={() => setActiveTab("more-games")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      activeTab === "more-games"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    More Games
                  </button>
                  <button
                    onClick={() => setActiveTab("devs")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      activeTab === "devs"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Dev Contributions &amp; XP
                  </button>
                </div>
              </div>

              {/* Tab Contents */}
              <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 shadow-2xl">
                {activeTab === "stages" && <GameDetailsTab />}
                {activeTab === "more-games" && <MoreGamesTab />}
                {activeTab === "devs" && <DevContributionsTab />}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
