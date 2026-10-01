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
  ArrowDown,
  Layers,
} from "lucide-react";
import { TOKEN_CONFIG } from "@/config/token";
import { copyToClipboard } from "@/lib/clipboard";
import { sounds } from "../audio/soundEffects";
import confetti from "canvas-confetti";
import { QuickBuyModal } from "../wallet/QuickBuyModal";

export const HeroSection: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isQuickBuyOpen, setIsQuickBuyOpen] = useState<boolean>(false);

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
    const el = document.getElementById("arcade-play");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToWhatIs = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("what-is-nomverse");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <section className="relative w-full pt-6 sm:pt-10 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-solana-purple/10 rounded-full blur-[130px] pointer-events-none" />

        {/* Constrain main content to 1200-1400px (Section 6 UX Audit) */}
        <div className="max-w-[1360px] mx-auto space-y-10 sm:space-y-12">
          {/* SECTION 02: HERO (Section 2 & 18 UX Audit) */}
          <div className="flex flex-col items-center text-center space-y-5 max-w-4xl mx-auto">
            {/* Quick Proof Line (Section 2 & 18: CC0 • Open Source • Solana • Arcade) */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>CC0 • Open Source • Solana • Arcade</span>
            </div>

            {/* Mascot Visual + Hero Headline */}
            <div className="relative group cursor-pointer" onClick={scrollToArcade}>
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-3xl bg-emerald-500/15 border-2 border-emerald-400/60 p-2 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:border-emerald-400 group-hover:shadow-[0_0_35px_rgba(20,241,149,0.45)]">
                <div className="absolute inset-0 rounded-3xl bg-emerald-400/20 animate-ping opacity-25 pointer-events-none" />
                <Image
                  src="/mascot.svg"
                  alt="Nomster Mascot"
                  width={96}
                  height={96}
                  priority
                  className="object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                />
              </div>
            </div>

            {/* Headline: NOMVERSE — The Open-Source Mascot of Web3 */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
                NOMVERSE
                <span className="block text-2xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-solana-green bg-clip-text text-transparent mt-1">
                  The Open-Source Mascot of Web3
                </span>
              </h1>
              <p className="text-base sm:text-xl font-bold text-slate-100 font-mono tracking-tight">
                Meet Nomster. Play. Create. Remix. Build.
              </p>
            </div>

            {/* Subtitle / Core Positioning (Section 21 UX Audit) */}
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              NomVerse is an open-source universe built around Nomster. Play retro physics games with zero wallet friction, compose 8-bit beats, design custom skins, and hold <strong className="text-emerald-400">$NOM</strong> for sovereign ecosystem perks.
            </p>

            {/* Primary Action Buttons (Section 14: Button Hierarchy) */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {/* Primary: PLAY NOW */}
              <button
                onClick={scrollToArcade}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-solana-green shadow-[0_0_30px_rgba(20,241,149,0.45)] hover:shadow-[0_0_40px_rgba(20,241,149,0.7)] hover:scale-105 active:scale-95 transition-all cursor-pointer min-h-[48px] touch-manipulation"
              >
                <Gamepad2 className="w-5 h-5 fill-slate-950 text-slate-950" />
                <span>PLAY NOW</span>
              </button>

              {/* Secondary: EXPLORE NOMVERSE */}
              <button
                onClick={scrollToWhatIs}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-500 hover:text-white transition-all hover:scale-105 active:scale-95 cursor-pointer min-h-[48px] touch-manipulation"
              >
                <Layers className="w-4 h-4 text-teal-400" />
                <span>EXPLORE NOMVERSE</span>
              </button>

              {/* Crypto Action: BUY $NOM */}
              <button
                onClick={() => setIsQuickBuyOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-mono font-bold text-sm text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 hover:border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:scale-105 active:scale-95 transition-all cursor-pointer min-h-[48px] touch-manipulation"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>BUY $NOM</span>
              </button>
            </div>

            {/* 1-Click Verified Mint Address Bar */}
            <div className="w-full max-w-lg p-2.5 sm:p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2.5 text-left shadow-lg">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-solana-green/15 border border-solana-green/30 flex items-center justify-center text-solana-green shrink-0">
                  <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] sm:text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                    Official Solana Mint (Token-2022)
                  </div>
                  <div className="text-xs sm:text-sm font-mono text-slate-100 font-semibold truncate select-all">
                    {TOKEN_CONFIG.mintAddress}
                  </div>
                </div>
              </div>

              <button
                onClick={handleCopyMint}
                className="inline-flex items-center gap-1 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-emerald-500/50 transition-all shrink-0 active:scale-95 min-h-[44px] touch-manipulation"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy CA</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* SECTION 04: PLAY NOMSTER (Section 4 & 18 UX Audit) */}
          <div
            id="arcade-play"
            className="scroll-mt-20 rounded-3xl bg-slate-950/70 border border-emerald-500/20 p-4 sm:p-6 lg:p-8 shadow-2xl backdrop-blur-sm space-y-6"
          >
            {/* Header Framing (Section 4: PLAY NOMSTER — No wallet. No signup. Just play.) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
                  <Gamepad2 className="w-4 h-4" />
                  <span className="uppercase tracking-wider">FEATURED RETRO ARCADE</span>
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
                  PLAY NOMSTER — <span className="text-emerald-400">No wallet. No signup. Just play.</span>
                </h2>
              </div>

              {/* Progression Badge (Section 4 UX Audit: Guest Play → Connect Wallet → Save Score) */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-mono bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-2xl">
                <span className="text-emerald-300 font-bold">1. Guest Play</span>
                <span className="text-slate-600">→</span>
                <span className="text-teal-300 font-bold">2. Connect Wallet</span>
                <span className="text-slate-600">→</span>
                <span className="text-candy-gold font-bold">3. Save Score &amp; Badges</span>
              </div>
            </div>

            {/* Mobile vs Desktop Control Hints (Section 5 UX Audit) */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-300 bg-emerald-500/5 border border-emerald-500/15 px-3.5 py-2 rounded-xl">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">📱 Mobile:</span>
                <span>Swipe / Tap to move • Tap DASH to boost</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="text-teal-400 font-bold">⌨️ Desktop:</span>
                <span>Arrow Keys / WASD • SPACE to Dash</span>
              </div>
            </div>

            {/* Centered Arcade Arena (Section 6 UX Audit) */}
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
