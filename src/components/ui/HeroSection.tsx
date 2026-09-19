"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { GameContainer } from "../game/GameContainer";
import { BondingMilestonesCard } from "../game/BondingMilestonesCard";
import {
  ShieldCheck,
  Sparkles,
  Flame,
  Rocket,
  Gamepad2,
  Copy,
  Check,
  Coins,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { GithubIcon } from "./icons";
import { TOKEN_CONFIG } from "@/config/token";
import { copyToClipboard } from "@/lib/clipboard";
import { sounds } from "../audio/soundEffects";
import confetti from "canvas-confetti";

export const HeroSection: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyMint = async () => {
    await copyToClipboard(TOKEN_CONFIG.mintAddress);
    setCopied(true);
    sounds.playGoldenChime();
    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.7 },
      colors: ["#14F195", "#9945FF", "#F59E0B"],
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="arcade" className="relative w-full pt-6 sm:pt-10 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-solana-purple/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-between gap-10 lg:gap-12">
        {/* Left Column: Vision, Pitch & Verified CA */}
        <div className="flex-1 text-center lg:text-left space-y-6 max-w-2xl">
          {/* Live Status Badges */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              LIVE ON SOLANA MAINNET
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-solana-purple/10 text-solana-purple border border-solana-purple/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% CC0 Public Domain
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-candy-amber/10 text-candy-gold border border-candy-amber/30">
              <Sparkles className="w-3.5 h-3.5" />
              Phaser 3 Arcade
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
            The Hungry <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-solana-green bg-clip-text text-transparent">Open-Source</span> Mascot of Web3
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-sm sm:text-lg leading-relaxed">
            Meet <strong>Nomster</strong>: an unpermissioned, zero-copyright mascot designed for decentralized culture. Play the retro physics arcade, remix CC0 vector graphics, compose 8-bit chiptunes, and hold <strong>$NOM</strong> to unlock immortal daily revives and Whale perks.
          </p>

          {/* 1-Click Verified Mint Address Pill */}
          <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2.5 text-left">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-solana-green/15 border border-solana-green/30 flex items-center justify-center text-solana-green shrink-0">
                <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[9px] sm:text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  Contract Address (Token-2022)
                </div>
                <div className="text-xs sm:text-sm font-mono text-slate-200 truncate select-all">
                  {TOKEN_CONFIG.mintAddress}
                </div>
              </div>
            </div>

            <button
              onClick={handleCopyMint}
              className="inline-flex items-center gap-1 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-emerald-500/50 transition-all shrink-0 active:scale-95"
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

          {/* Primary CTA Action Row - Mobile Responsive Grid */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3.5 pt-1">
            <Link
              href="/play"
              className="col-span-1 sm:col-auto inline-flex items-center justify-center gap-2 px-4 py-3 sm:px-6 sm:py-3.5 rounded-2xl font-black text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-solana-green shadow-[0_0_25px_rgba(20,241,149,0.4)] hover:shadow-[0_0_35px_rgba(20,241,149,0.7)] hover:scale-105 active:scale-95 transition-all cursor-pointer text-center"
            >
              <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 shrink-0" />
              <span>Enter Arcade</span>
            </Link>

            <a
              href="#tokenomics"
              className="col-span-1 sm:col-auto inline-flex items-center justify-center gap-2 px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 hover:border-emerald-500/60 hover:scale-105 transition-all text-center"
            >
              <Flame className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Buy $NOM</span>
            </a>

            <a
              href={TOKEN_CONFIG.pumpFunUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-1 sm:col-auto inline-flex items-center justify-center gap-1.5 px-3 py-2.5 sm:px-5 sm:py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 transition-all text-center"
            >
              <Rocket className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>pump.fun</span>
            </a>

            <a
              href="https://github.com/jsepkt/nomverse"
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-1 sm:col-auto inline-flex items-center justify-center gap-1.5 px-3 py-2.5 sm:px-4 sm:py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-800 transition-all text-center"
            >
              <GithubIcon className="w-3.5 h-3.5 shrink-0" />
              <span>GitHub</span>
            </a>
          </div>

          {/* Three Key Trust Metrics */}
          <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-800/80">
            <div>
              <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">0% TAX</div>
              <div className="text-xs text-slate-400">Zero Trading Friction</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black font-mono text-teal-300">100% CC0</div>
              <div className="text-xs text-slate-400">Public Domain Forever</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black font-mono text-solana-green">1 BILLION</div>
              <div className="text-xs text-slate-400">Fixed Supply (No Inflation)</div>
            </div>
          </div>
        </div>

        {/* Right Column: Playable Interactive Game Arena */}
        <div className="w-full lg:w-auto flex-1 flex justify-center">
          <GameContainer showGameRoomButton={true} />
        </div>
      </div>

      {/* Real-Data Raydium Bonding Milestones */}
      <div className="max-w-7xl mx-auto mt-10 sm:mt-12">
        <BondingMilestonesCard />
      </div>
    </section>
  );
};
