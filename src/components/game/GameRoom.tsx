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
  Gift,
  Coins,
  Flame,
  Music,
} from "lucide-react";
import { QuickBuyModal } from "../wallet/QuickBuyModal";
import { TOKEN_CONFIG } from "@/config/token";
import { UgcGameRoomsTab } from "./UgcGameRoomsTab";
import { ArcadeVaultModal } from "./ArcadeVaultModal";
import { TournamentBanner } from "./TournamentBanner";
import { BurnMarqueeTicker } from "./BurnMarqueeTicker";
import { SocialQuestsModal } from "./SocialQuestsModal";
import { getUserVault, getTotalNomBurned } from "@/lib/arcadeVault";
import { useAuth } from "@/context/AuthContext";
import { chiptuneBgm } from "@/lib/chiptuneSynthesizer";
import { sounds } from "../audio/soundEffects";

interface GameRoomProps {
  initialMode?: "half" | "full";
}

type TabType =
  | "ugc-arena"
  | "stages"
  | "custom-skin"
  | "flex-card"
  | "mission-control"
  | "solana-rpc"
  | "more-games"
  | "devs";

export const GameRoom: React.FC<GameRoomProps> = ({ initialMode = "half" }) => {
  const { user } = useAuth();
  const userId = user?.id || "guest";
  const [screenSize, setScreenSize] = useState<"half" | "full">(initialMode);
  const [activeTab, setActiveTab] = useState<TabType>("ugc-arena");
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isQuickBuyOpen, setIsQuickBuyOpen] = useState<boolean>(false);
  const [isVaultOpen, setIsVaultOpen] = useState<boolean>(false);
  const [isQuestsOpen, setIsQuestsOpen] = useState<boolean>(false);
  const [isBgmPlaying, setIsBgmPlaying] = useState<boolean>(false);
  const [vaultBalance, setVaultBalance] = useState<number>(10000);
  const [totalBurned, setTotalBurned] = useState<number>(42850);

  // Sync in-game vault balance and global burn ledger
  useEffect(() => {
    const updateVault = () => {
      setVaultBalance(getUserVault(userId).balance);
      setTotalBurned(getTotalNomBurned());
    };
    updateVault();
    window.addEventListener("NOM_VAULT_UPDATE", updateVault);
    window.addEventListener("NOM_BURN_UPDATE", updateVault);
    return () => {
      window.removeEventListener("NOM_VAULT_UPDATE", updateVault);
      window.removeEventListener("NOM_BURN_UPDATE", updateVault);
    };
  }, [userId]);

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

  // Cross-component tab switcher listener
  useEffect(() => {
    const handleSwitchTab = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab: TabType }>;
      if (customEvent.detail?.tab) {
        setActiveTab(customEvent.detail.tab);
        const cabinet = document.getElementById("arcade-cabinet");
        if (cabinet) {
          cabinet.scrollIntoView({ behavior: "smooth" });
        }
      }
    };
    window.addEventListener("NOM_SWITCH_TAB", handleSwitchTab);
    return () => window.removeEventListener("NOM_SWITCH_TAB", handleSwitchTab);
  }, []);

  const TABS = [
    { id: "ugc-arena" as TabType, label: "$NOM Arena", icon: Flame, color: "text-rose-400" },
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
      <div className="sticky top-0 z-40 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-xl px-2.5 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-3 shadow-md">
        {/* Left: Breadcrumb & Title */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white transition-all hover:scale-105 active:scale-95 shrink-0"
            title="Back to NomVerse Homepage"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Back to NomVerse</span>
            <span className="sm:hidden hidden xs:inline">Back</span>
          </Link>

          <div className="h-4 w-px bg-slate-800 hidden sm:block shrink-0" />

          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm xs:text-base sm:text-lg font-black text-white flex items-center gap-1 tracking-tight truncate">
              <span>ARCADE</span>
              <span className="text-solana-green">ROOM</span>
            </span>
            <span className="hidden md:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
              CC0 Gaming Masterpiece
            </span>
          </div>
        </div>

        {/* Right: Controls & Vault Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* 8-Bit Chiptune BGM Synthesizer Button */}
          <button
            onClick={() => {
              const nextState = chiptuneBgm.toggle();
              setIsBgmPlaying(nextState);
            }}
            className={`tactile-button px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
              isBgmPlaying
                ? "bg-purple-500/30 text-purple-200 border border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800"
            }`}
            title={isBgmPlaying ? "Mute 8-Bit Synthesizer Music" : "Play 8-Bit Retro Chiptune Music"}
          >
            <Music className={`w-3.5 h-3.5 ${isBgmPlaying ? "text-purple-300 animate-bounce" : "text-slate-400"}`} />
            <span className="hidden sm:inline">BGM</span>
          </button>

          {/* Social Quests & Free Rewards Button */}
          <button
            onClick={() => {
              sounds.playGoldenChime();
              setIsQuestsOpen(true);
            }}
            className="tactile-button px-2 sm:px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-500/40 text-pink-300 flex items-center gap-1 sm:gap-1.5 shadow-[0_0_15px_rgba(236,72,153,0.25)] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Social Quests: Complete quests & earn free hearts and XP!"
          >
            <Gift className="w-3.5 h-3.5 text-pink-400 shrink-0" />
            <span className="hidden xs:inline">Quests</span>
            <span className="xs:hidden">Free</span>
          </button>

          {/* In-Game $NOM Vault & Burn Sink Indicator */}
          <button
            onClick={() => setIsVaultOpen(true)}
            className="px-2 sm:px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 text-amber-300 flex items-center gap-1 sm:gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Arcade Vault: Deposit, Withdraw & 1% Deflationary Burn Sink"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-mono font-black">
              {vaultBalance >= 10000 ? `${(vaultBalance / 1000).toFixed(0)}k` : vaultBalance.toLocaleString()}
            </span>
            <span className="hidden sm:inline text-[10px] text-amber-400/80">$NOM</span>
            <span className="hidden xl:inline text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/30">
              🔥 {totalBurned.toLocaleString()} Burned
            </span>
          </button>

          {/* Half Size (Split Console) Toggle Button - Desktop Only */}
          <button
            onClick={() => {
              sounds.playButtonClick();
              setScreenSize("half");
            }}
            className={`tactile-button hidden md:flex px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-mono font-bold items-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
              screenSize === "half"
                ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 shadow-[0_0_15px_rgba(20,241,149,0.3)]"
                : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800"
            }`}
            title="Half Size: Split screen with Stages & Companion Tabs (Press T)"
          >
            <Monitor className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">Half</span>
            <span className="text-[10px] opacity-60 hidden lg:inline">[T]</span>
          </button>

          {/* Full Size (Ultra Arcade) Toggle Button - Desktop Only */}
          <button
            onClick={() => {
              sounds.playButtonClick();
              setScreenSize("full");
            }}
            className={`tactile-button hidden md:flex px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-mono font-bold items-center gap-1 sm:gap-1.5 transition-all cursor-pointer ${
              screenSize === "full"
                ? "bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800"
            }`}
            title="Full Size: Expanded Ultra Arcade view for maximum immersion"
          >
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="hidden sm:inline">Full</span>
          </button>

          {/* 1-Click Buy $NOM Button */}
          <button
            onClick={() => {
              sounds.playGoldenChime();
              setIsQuickBuyOpen(true);
            }}
            className="tactile-button px-2 sm:px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 flex items-center gap-1 sm:gap-1.5 shadow-[0_0_15px_rgba(20,241,149,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Instant Buy $NOM on pump.fun"
          >
            <Rocket className="w-3.5 h-3.5 text-slate-950 shrink-0" />
            <span>Buy</span>
            <span className="hidden xs:inline">$NOM</span>
          </button>
        </div>
      </div>

      {/* MAIN GAME ROOM ARENA */}
      <div className="container-fluid container-xxl flex-1 w-100 p-2 p-sm-3 p-lg-4 d-flex flex-column justify-start">
        {/* LIVE REAL-TIME BURN MARQUEE TICKER */}
        <BurnMarqueeTicker className="mb-2 sm:mb-3" />

        {/* SEASON 1 TOURNAMENT BOUNTY COUNTDOWN BANNER */}
        <div className="w-full mb-3 sm:mb-4">
          <TournamentBanner />
        </div>

        {/* ECOSYSTEM GAME CARTRIDGE SELECTOR */}
        <div className="w-full flex items-center justify-between gap-2 p-2 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-lg mb-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 w-full">
            <span className="text-[11px] font-mono text-slate-500 font-bold uppercase pl-2 shrink-0 flex items-center gap-1">
              <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>GAMES:</span>
            </span>

            <button
              onClick={() => {
                sounds.playButtonClick();
                setActiveTab("ugc-arena");
                document.getElementById("arcade-cabinet")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === "ugc-arena"
                  ? "bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(20,241,149,0.5)] font-black"
                  : "bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <span>🍬 Green Candle Frenzy</span>
              <span className="text-[9px] bg-slate-950/40 text-emerald-300 px-1.5 py-0.5 rounded font-mono">Flagship</span>
            </button>

            <button
              onClick={() => {
                sounds.playButtonClick();
                setActiveTab("more-games");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === "more-games"
                  ? "bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)] font-black"
                  : "bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <span>🦆 Nom Flap</span>
            </button>

            <button
              onClick={() => {
                sounds.playButtonClick();
                setActiveTab("more-games");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === "more-games"
                  ? "bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)] font-black"
                  : "bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <span>🦘 Candy Hopper</span>
            </button>

            <button
              onClick={() => {
                sounds.playButtonClick();
                setActiveTab("more-games");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === "more-games"
                  ? "bg-purple-500 text-slate-950 shadow-[0_0_15px_rgba(153,69,255,0.5)] font-black"
                  : "bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <span>👾 Nom Invaders</span>
              <span className="text-[9px] bg-purple-900/60 text-purple-200 px-1 py-0.5 rounded font-mono">NEW</span>
            </button>

            <button
              onClick={() => {
                sounds.playButtonClick();
                setActiveTab("more-games");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                activeTab === "more-games"
                  ? "bg-rose-500 text-slate-950 shadow-[0_0_15px_rgba(244,63,94,0.5)] font-black"
                  : "bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <span>⚔️ Mega-FUD Tap Raid</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: HALF SIZE (SPLIT CONSOLE / THEATER MODE) */}
        {screenSize === "half" ? (
          <div className="row g-3 g-sm-4 items-start mx-0">
            {/* Left 5 Columns: Game Arcade Cabinet */}
            <div id="arcade-cabinet" className="col-12 col-lg-5 d-flex flex-column align-items-center justify-content-start lg:sticky lg:top-20 px-0 sm:px-2">
              <GameContainer />
            </div>

            {/* Right 7 Columns: Companion Console Tabs */}
            <div className="col-12 col-lg-7 d-flex flex-column gap-4 px-0 sm:px-2">
              {/* Tab Switcher Ribbon with Gradient Edge Masks */}
              <div className="relative w-full overflow-hidden">
                <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-[#050914] to-transparent z-10 sm:hidden" />
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-[#050914] to-transparent z-10 sm:hidden" />
                <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-lg overflow-x-auto no-scrollbar scroll-smooth overscroll-x-contain touch-pan-x select-none">
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          sounds.playButtonClick();
                          setActiveTab(tab.id);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all shrink-0 min-h-[38px] cursor-pointer touch-manipulation ${
                          isActive
                            ? "bg-slate-800 text-white border border-slate-700 shadow-[0_0_12px_rgba(20,241,149,0.25)] ring-1 ring-emerald-500/40"
                            : "text-slate-400 hover:text-white hover:bg-slate-900"
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${tab.color} shrink-0`} />
                        <span className="whitespace-nowrap">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Tab Panel Body */}
              <div className="min-h-[500px]">
                {activeTab === "ugc-arena" && <UgcGameRoomsTab />}
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
            <div id="arcade-cabinet" className="w-full flex justify-center">
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

                <div className="relative w-full overflow-hidden">
                  <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-[#050914] to-transparent z-10 sm:hidden" />
                  <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-[#050914] to-transparent z-10 sm:hidden" />
                  <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md overflow-x-auto no-scrollbar scroll-smooth overscroll-x-contain touch-pan-x select-none">
                    {TABS.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            sounds.playButtonClick();
                            setActiveTab(tab.id);
                          }}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all shrink-0 min-h-[38px] cursor-pointer touch-manipulation ${
                            isActive
                              ? "bg-slate-800 text-white border border-slate-700 shadow-[0_0_12px_rgba(20,241,149,0.25)] ring-1 ring-emerald-500/40"
                              : "text-slate-400 hover:text-white hover:bg-slate-900"
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${tab.color} shrink-0`} />
                          <span className="whitespace-nowrap">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Tab Contents */}
              <div className="w-full">
                {activeTab === "ugc-arena" && <UgcGameRoomsTab />}
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
      <ArcadeVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        onBalanceUpdated={(newBal) => setVaultBalance(newBal)}
      />
      <QuickBuyModal isOpen={isQuickBuyOpen} onClose={() => setIsQuickBuyOpen(false)} />
      <SocialQuestsModal isOpen={isQuestsOpen} onClose={() => setIsQuestsOpen(false)} />
    </div>
  );
};
