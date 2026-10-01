"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { GameContainer } from "../game/GameContainer";
import {
  ShieldCheck,
  Sparkles,
  Gamepad2,
  Copy,
  Check,
  Coins,
  Zap,
  Layers,
  Flame,
  Volume2,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { TOKEN_CONFIG } from "@/config/token";
import { copyToClipboard } from "@/lib/clipboard";
import { sounds } from "../audio/soundEffects";
import confetti from "canvas-confetti";
import { QuickBuyModal } from "../wallet/QuickBuyModal";

const MASCOT_QUOTES = [
  "NOM! Block confirmed in 400ms! ⚡",
  "100% CC0! You own me! 💚",
  "Zero team allocation! Pure fair launch! 🚀",
  "1% of all arcade games burned forever! 🔥",
  "Delicious Solana candies! Nom nom nom! 🍬",
  "Mathematically unruggable! 🛡️",
];

export const HeroSection: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isQuickBuyOpen, setIsQuickBuyOpen] = useState<boolean>(false);
  const [quoteIndex, setQuoteIndex] = useState<number>(0);
  const [isChomping, setIsChomping] = useState<boolean>(false);
  const [speechVisible, setSpeechVisible] = useState<boolean>(true);

  const handleMascotPoke = () => {
    setIsChomping(true);
    sounds.playGoldenChime();
    setQuoteIndex((prev) => (prev + 1) % MASCOT_QUOTES.length);
    setSpeechVisible(true);

    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.4 },
      colors: ["#14F195", "#9945FF", "#F59E0B", "#00C2FF"],
    });

    setTimeout(() => setIsChomping(false), 300);
  };

  const handleCopyMint = async () => {
    await copyToClipboard(TOKEN_CONFIG.mintAddress);
    setCopied(true);
    sounds.playGoldenChime();
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.6 },
      colors: ["#14F195", "#9945FF", "#F59E0B"],
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToArcade = (e: React.MouseEvent) => {
    e.preventDefault();
    sounds.playJumpSound();
    const el = document.getElementById("arcade-play");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToWhatIs = (e: React.MouseEvent) => {
    e.preventDefault();
    sounds.playButtonClick();
    const el = document.getElementById("what-is-nomverse");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <section className="relative w-full pt-8 sm:pt-14 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Ambient Celestial Neon Halos */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-solana-purple/15 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-solana-purple/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Max constrained container (1200-1400px) */}
        <div className="max-w-[1360px] mx-auto space-y-12 sm:space-y-16">
          {/* TOP HERO STAGE: Living Mascot + Kinetic Typography */}
          <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto relative z-10">
            {/* Proof Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-bold glass-pill text-emerald-300 border border-emerald-500/30 shadow-[0_0_20px_rgba(20,241,149,0.2)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span><span className="hidden sm:inline">CC0 • Open Source • </span>Solana Token-2022 • Arcade</span>
            </div>

            {/* Living Mascot Character Stage (Nintendo / Pudgy Penguins) */}
            <div className="relative my-2 select-none">
              {/* Floating Speech Bubble */}
              {speechVisible && (
                <div
                  className="absolute -top-12 left-1/2 -translate-x-1/2 w-max max-w-[85vw] px-3.5 py-1.5 rounded-2xl glass-card text-xs font-mono font-bold text-white border border-emerald-400/40 shadow-[0_0_25px_rgba(20,241,149,0.3)] animate-in fade-in zoom-in duration-200 cursor-pointer pointer-events-auto leading-snug text-center"
                  onClick={handleMascotPoke}
                >
                  <span className="text-emerald-400 font-black">Nomster: </span>
                  <span>{MASCOT_QUOTES[quoteIndex]}</span>
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45 border-r border-b border-emerald-400/40" />
                </div>
              )}

              {/* Orbiting Collectible Candies */}
              <div
                className="absolute -top-2 -left-3 sm:-left-8 w-9 h-9 sm:w-10 sm:h-10 rounded-full glass-card p-1.5 flex items-center justify-center border border-amber-400/40 animate-bounce duration-1000 shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer"
                onClick={handleMascotPoke}
                title="Tap to feed Nomster"
              >
                <span className="text-base sm:text-lg">🍬</span>
              </div>
              <div
                className="absolute -bottom-2 -right-3 sm:-right-8 w-9 h-9 sm:w-10 sm:h-10 rounded-full glass-card p-1.5 flex items-center justify-center border border-purple-400/40 animate-pulse duration-700 shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer"
                onClick={handleMascotPoke}
                title="Tap to feed Nomster"
              >
                <span className="text-base sm:text-lg">⭐</span>
              </div>

              {/* Main Mascot Button */}
              <button
                onClick={handleMascotPoke}
                className={`relative w-28 h-28 sm:w-36 sm:h-36 mx-auto rounded-3xl glass-card p-3 flex items-center justify-center transition-all duration-300 cursor-pointer group focus:outline-none ${
                  isChomping
                    ? "scale-90 rotate-3 border-emerald-300 shadow-[0_0_40px_rgba(20,241,149,0.7)]"
                    : "animate-float-gentle hover:scale-105 hover:border-emerald-400/70 hover:shadow-[0_0_40px_rgba(20,241,149,0.45)]"
                }`}
                title="Click Nomster to feed!"
              >
                <div className="absolute inset-0 rounded-3xl bg-emerald-400/15 animate-ping opacity-20 pointer-events-none" />
                <Image
                  src="/mascot.svg"
                  alt="Nomster Mascot"
                  width={120}
                  height={120}
                  priority
                  className="object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform"
                />
              </button>
              <div className="text-[10px] font-mono text-emerald-400/80 mt-2 font-bold tracking-wider">
                👆 TAP NOMSTER TO FEED
              </div>
            </div>

            {/* Kinetic Typography */}
            <div className="space-y-3 px-2">
              <h1 className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
                NOMVERSE
                <span className="block text-xl xs:text-2xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-solana-cyan bg-clip-text text-transparent mt-1">
                  The Open-Source Mascot of Web3
                </span>
              </h1>
              <p className="text-base sm:text-2xl font-bold text-slate-100 font-mono tracking-tight">
                Meet Nomster. Play. Create. Remix. Build.
              </p>
            </div>

            {/* Subtitle Positioning */}
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-normal px-2">
              NomVerse is an open-source universe built around Nomster. Play retro physics games with zero wallet friction, compose 8-bit beats, design custom skins, and hold{" "}
              <strong className="text-emerald-400 font-black">$NOM</strong> for sovereign ecosystem perks.
            </p>

            {/* 3D Tactile CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 w-full max-w-sm sm:max-w-none pt-2">
              {/* Primary PLAY NOW */}
              <button
                onClick={scrollToArcade}
                className="tactile-button inline-flex items-center justify-center gap-2 px-7 py-3.5 sm:py-4 rounded-2xl font-black text-sm sm:text-base text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-solana-green shadow-[0_0_30px_rgba(20,241,149,0.45)] hover:shadow-[0_0_45px_rgba(20,241,149,0.7)] cursor-pointer min-h-[48px] sm:min-h-[52px] touch-manipulation"
              >
                <Gamepad2 className="w-5 h-5 fill-slate-950 text-slate-950" />
                <span>PLAY NOW</span>
              </button>

              {/* Secondary EXPLORE NOMVERSE */}
              <button
                onClick={scrollToWhatIs}
                className="tactile-button inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base text-slate-200 glass-card hover:border-slate-500 hover:text-white transition-all cursor-pointer min-h-[48px] sm:min-h-[52px] touch-manipulation"
              >
                <Layers className="w-4 h-4 text-teal-400" />
                <span>EXPLORE NOMVERSE</span>
              </button>

              {/* Crypto BUY $NOM */}
              <button
                onClick={() => {
                  sounds.playGoldenChime();
                  setIsQuickBuyOpen(true);
                }}
                className="tactile-button inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-2xl font-mono font-bold text-sm sm:text-base text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 hover:border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.25)] cursor-pointer min-h-[48px] sm:min-h-[52px] touch-manipulation"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>BUY $NOM</span>
              </button>
            </div>

            {/* Verified Contract Bar (Mobile-Optimized Responsive Card) */}
            <div className="w-full max-w-lg p-3 sm:p-3.5 rounded-2xl glass-card space-y-2 text-left">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-solana-green/15 border border-solana-green/30 flex items-center justify-center text-solana-green shrink-0">
                    <Coins className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <span>Official Mint (Token-2022)</span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold shrink-0">
                        VERIFIED
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={handleCopyMint}
                    className="tactile-button inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 min-h-[34px] touch-manipulation cursor-pointer"
                    title="Copy Mint Address"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`https://solscan.io/token/${TOKEN_CONFIG.mintAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors min-h-[34px] min-w-[34px] flex items-center justify-center cursor-pointer"
                    title="View on Solscan"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="text-xs sm:text-sm font-mono text-slate-200 font-semibold truncate bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-800 select-all">
                {TOKEN_CONFIG.mintAddress}
              </div>
            </div>

            {/* Quick 4 Trust Highlights Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-3xl pt-2">
              <div className="p-2.5 sm:p-3 rounded-2xl glass-card text-center">
                <div className="text-[10px] sm:text-xs font-mono text-slate-400 truncate">TOTAL SUPPLY</div>
                <div className="text-base sm:text-lg font-black font-mono text-white truncate">1,000,000,000</div>
              </div>
              <div className="p-2.5 sm:p-3 rounded-2xl glass-card text-center">
                <div className="text-[10px] sm:text-xs font-mono text-slate-400 truncate">
                  <span className="hidden sm:inline">TRADING TAX</span>
                  <span className="sm:hidden">TAX</span>
                </div>
                <div className="text-base sm:text-lg font-black font-mono text-emerald-400 truncate">0% BUY / SELL</div>
              </div>
              <div className="p-2.5 sm:p-3 rounded-2xl glass-card text-center">
                <div className="text-[10px] sm:text-xs font-mono text-slate-400 truncate">
                  <span className="hidden sm:inline">ARCADE BURN</span>
                  <span className="sm:hidden">BURN</span>
                </div>
                <div className="text-base sm:text-lg font-black font-mono text-rose-400 truncate">1% PER WAGER</div>
              </div>
              <div className="p-2.5 sm:p-3 rounded-2xl glass-card text-center">
                <div className="text-[10px] sm:text-xs font-mono text-slate-400 truncate">
                  <span className="hidden sm:inline">INTELLECTUAL PROPERTY</span>
                  <span className="sm:hidden">LICENSE</span>
                </div>
                <div className="text-base sm:text-lg font-black font-mono text-solana-purple truncate">100% CC0</div>
              </div>
            </div>
          </div>

          {/* FEATURED ARCADE CONSOLE ARENA (Section 04) */}
          <div
            id="arcade-play"
            className="scroll-mt-20 rounded-3xl glass-card p-4 sm:p-6 lg:p-8 shadow-2xl relative overflow-hidden space-y-6"
          >
            {/* Handheld / Cabinet Status Trim */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="uppercase tracking-wider">
                    <span className="hidden sm:inline">RETRO PHYSICS CONSOLE • 60 FPS • 0ms AUDIO</span>
                    <span className="sm:hidden">RETRO PHYSICS • 60 FPS</span>
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
                  PLAY NOMSTER — <span className="text-emerald-400">No wallet. No signup. Just play.</span>
                </h2>
              </div>

              {/* 3-Step Progression Badge */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono glass-pill px-3.5 py-2 rounded-full">
                <span className="text-emerald-300 font-bold">1. Guest Play</span>
                <span className="text-slate-500">→</span>
                <span className="text-teal-300 font-bold">2. Connect Wallet</span>
                <span className="text-slate-500">→</span>
                <span className="text-candy-gold font-bold">3. Save Scores &amp; Badges</span>
              </div>
            </div>

            {/* Mobile vs Desktop Gesture Hints */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-300 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">📱 Mobile Controls:</span>
                <span>Swipe / Tap to move • Tap DASH to boost</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-teal-400 font-bold">⌨️ Keyboard:</span>
                <span>[A][D] or [←][→] to Move • [SPACE] to Dash</span>
              </div>
            </div>

            {/* Centered Arcade Screen Container */}
            <div className="flex justify-center items-center w-full">
              <GameContainer showGameRoomButton={true} />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Buy SOL Modal */}
      <QuickBuyModal
        isOpen={isQuickBuyOpen}
        onClose={() => setIsQuickBuyOpen(false)}
      />
    </>
  );
};
