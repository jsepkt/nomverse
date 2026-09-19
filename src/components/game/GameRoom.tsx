"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GameContainer } from "./GameContainer";
import { GameDetailsTab } from "./GameDetailsTab";
import { MoreGamesTab } from "./MoreGamesTab";
import { DevContributionsTab } from "./DevContributionsTab";
import { PixelSkinWorkshop } from "../tools/PixelSkinWorkshop";
import { ViralCardStudio } from "../tools/ViralCardStudio";
import { MissionControl } from "../telemetry/MissionControl";
import { SolanaRpcTelemetry } from "../telemetry/SolanaRpcTelemetry";
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
  Palette,
  Rocket,
  Radio,
  Share2,
} from "lucide-react";
import { QuickBuyModal } from "../wallet/QuickBuyModal";
import { TOKEN_CONFIG } from "@/config/token";

interface GameRoomProps {
  initialMode?: "half" | "full";
}

type TabType =
  | "stages"
  | "custom-skin"
  | "flex-card"
  | "mission-control"
  | "solana-rpc"
  | "more-games"
  | "devs";

export const GameRoom: React.FC<GameRoomProps> = ({ initialMode = "half" }) => {
  const [screenSize, setScreenSize] = useState<"half" | "full">(initialMode);
  const [activeTab, setActiveTab] = useState<TabType>("stages");
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isQuickBuyOpen, setIsQuickBuyOpen] = useState<boolean>(false);

  // Auto-detect mobile devices to prioritize full window
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setScreenSize("full");
      } else if (initialMode === "full") {
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

  const TABS = [
    { id: "stages" as TabType, label: "Stages & Boss", icon: Trophy, color: "text-emerald-400" },
    { id: "custom-skin" as TabType, label: "Pixel Skins", icon: Palette, color: "text-amber-400" },
    { id: "flex-card" as TabType, label: "Flex Card", icon: Sparkles, color: "text-pink-400" },
    { id: "mission-control" as TabType, label: "Raydium Orbit", icon: Rocket, color: "text-cyan-400" },
    { id: "solana-rpc" as TabType, label: "Solana RPC", icon: Radio, color: "text-purple-400" },
    { id: "more-games" as TabType, label: "Arcade Commons", icon: Gamepad2, color: "text-emerald-300" },
    { id: "devs" as TabType, label: "Dev XP", icon: Code2, color: "text-yellow-300" },
  ];

  return (
    <div className="min-h-screen bg-[#050914] text-slate-100 flex flex-col pb-24 lg:pb-12">
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
              CC0 Gaming Masterpiece
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
            title="Half Size: Split screen with Stages & Companion Tabs (Press T)"
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

          {/* 1-Click Buy $NOM Button */}
          <button
            onClick={() => setIsQuickBuyOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 flex items-center gap-1.5 shadow-[0_0_15px_rgba(20,241,149,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Instant Buy $NOM on pump.fun"
          >
            <Rocket className="w-3.5 h-3.5 text-slate-950" />
            <span>Buy $NOM</span>
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

            {/* Right 6-7 Columns: Companion Console Tabs */}
            <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-4">
              {/* Tab Switcher Ribbon */}
              <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-lg overflow-x-auto">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
                        isActive
                          ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                          : "text-slate-400 hover:text-white hover:bg-slate-900/60"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${tab.color} shrink-0`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Tab Panel Body */}
              <div className="min-h-[500px]">
                {activeTab === "stages" && (
                  <div className="p-4 sm:p-5 rounded-3xl bg-slate-950/60 border border-slate-800/80 shadow-xl">
                    <GameDetailsTab />
                  </div>
                )}
                {activeTab === "custom-skin" && <PixelSkinWorkshop />}
                {activeTab === "flex-card" && <ViralCardStudio />}
                {activeTab === "mission-control" && <MissionControl />}
                {activeTab === "solana-rpc" && <SolanaRpcTelemetry />}
                {activeTab === "more-games" && (
                  <div className="p-4 sm:p-5 rounded-3xl bg-slate-950/60 border border-slate-800/80 shadow-xl">
                    <MoreGamesTab />
                  </div>
                )}
                {activeTab === "devs" && (
                  <div className="p-4 sm:p-5 rounded-3xl bg-slate-950/60 border border-slate-800/80 shadow-xl">
                    <DevContributionsTab />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* VIEW 2: FULL SIZE (EXPANDED ULTRA ARCADE) */
          <div className="flex flex-col items-center justify-start gap-8 w-full">
            {/* Centered Expanded Arcade Cabinet */}
            <div className="w-full flex justify-center">
              <GameContainer expandedMode={true} />
            </div>

            {/* Full Size Bottom Companion Deck */}
            <div className="w-full max-w-5xl space-y-4 pt-4 border-t border-slate-800/80">
              {/* Tab Selector */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Arcade Room Companion:
                  </h3>
                </div>

                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto">
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shrink-0 ${
                          isActive
                            ? "bg-slate-800 text-white border border-slate-700"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${tab.color}`} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Contents */}
              <div className="w-full">
                {activeTab === "stages" && (
                  <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 shadow-2xl">
                    <GameDetailsTab />
                  </div>
                )}
                {activeTab === "custom-skin" && <PixelSkinWorkshop />}
                {activeTab === "flex-card" && <ViralCardStudio />}
                {activeTab === "mission-control" && <MissionControl />}
                {activeTab === "solana-rpc" && <SolanaRpcTelemetry />}
                {activeTab === "more-games" && (
                  <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 shadow-2xl">
                    <MoreGamesTab />
                  </div>
                )}
                {activeTab === "devs" && (
                  <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 shadow-2xl">
                    <DevContributionsTab />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <QuickBuyModal isOpen={isQuickBuyOpen} onClose={() => setIsQuickBuyOpen(false)} />
    </div>
  );
};
