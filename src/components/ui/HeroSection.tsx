"use client";

import React from "react";
import Image from "next/image";
import { GameContainer } from "../game/GameContainer";
import { BondingMilestonesCard } from "../game/BondingMilestonesCard";
import { ShieldCheck, Sparkles, Flame, Rocket, Terminal, Zap } from "lucide-react";
import { GithubIcon } from "./icons";
import { TOKEN_CONFIG } from "@/config/token";

export const HeroSection: React.FC = () => {
  return (
    <section id="arcade" className="relative w-full pt-8 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-solana-purple/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-between gap-10 lg:gap-12">
        {/* Left Column: Vision & Pitch */}
        <div className="flex-1 text-center lg:text-left space-y-6 max-w-2xl">
          {/* Badges Bar */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% CC0 Public Domain
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-solana-purple/10 text-solana-purple border border-solana-purple/30">
              <Zap className="w-3.5 h-3.5" />
              Phaser 3 Physics
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-candy-amber/10 text-candy-gold border border-candy-amber/30">
              <Sparkles className="w-3.5 h-3.5" />
              Community Lore Engine
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
            The Hungry <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-solana-green bg-clip-text text-transparent">Open-Source</span> Mascot of Web3
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Meet <strong>Nomster</strong>: an unpermissioned, zero-copyright mascot built for the next generation of decentralized culture. Feed him Solana candies in the browser mini-game below, remix his vector SVGs, and submit new chapters to the living lore hub via GitHub PRs.
          </p>

          {/* Primary CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
            <a
              href={TOKEN_CONFIG.pumpFunUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-black text-sm text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-solana-green shadow-[0_0_25px_rgba(20,241,149,0.4)] hover:shadow-[0_0_35px_rgba(20,241,149,0.7)] hover:scale-105 transition-all"
            >
              <Rocket className="w-5 h-5 text-slate-950" />
              <span>Launch on pump.fun</span>
            </a>

            <a
              href="https://github.com/jsepkt/nomverse"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm text-slate-200 bg-surface hover:bg-slate-800 border border-slate-700 hover:border-slate-500 transition-all"
            >
              <GithubIcon className="w-5 h-5" />
              <span>Fork on GitHub</span>
            </a>
          </div>

          {/* Live Mascot Quick Stats */}
          <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-800/80">
            <div>
              <div className="text-xl sm:text-2xl font-black font-mono text-white">0%</div>
              <div className="text-xs text-slate-400">Royalties / IP Restrictions</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">100%</div>
              <div className="text-xs text-slate-400">Fair Launch on pump.fun</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black font-mono text-solana-green">CC0</div>
              <div className="text-xs text-slate-400">Open Public Domain</div>
            </div>
          </div>
        </div>

        {/* Right Column: Playable Interactive Game Arena */}
        <div className="w-full lg:w-auto flex-1 flex justify-center">
          <GameContainer />
        </div>
      </div>

      {/* Real-Data Raydium Bonding Milestones */}
      <div className="max-w-7xl mx-auto mt-10 sm:mt-12">
        <BondingMilestonesCard />
      </div>
    </section>
  );
};
