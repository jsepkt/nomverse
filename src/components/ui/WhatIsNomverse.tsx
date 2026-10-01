"use client";

import React from "react";
import Link from "next/link";
import {
  Gamepad2,
  Palette,
  BookOpen,
  Code2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Flame,
  Zap,
  Cpu,
} from "lucide-react";
import { sounds } from "../audio/soundEffects";

interface BentoTile {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  href: string;
  isExternal?: boolean;
  actionText: string;
  colSpanClass: string;
}

const BENTO_TILES: BentoTile[] = [
  {
    id: "play",
    badge: "01 • PLAY",
    badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    title: "Zero-Friction Retro Arcade",
    subtitle: "5 Dynamic Stages • 0ms Web Audio",
    description:
      "Play instantly without connecting a wallet or signing up. Catch falling Solana candies, trigger power-ups, defeat Lord Mega-FUD in community raids, and earn provably fair high scores.",
    icon: Gamepad2,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    href: "/play",
    actionText: "Enter Game Room",
    colSpanClass: "col-12 col-lg-8",
  },
  {
    id: "remix",
    badge: "02 • REMIX",
    badgeColor: "bg-solana-green/15 text-solana-green border-solana-green/30",
    title: "100% CC0 Public Domain",
    subtitle: "No Copyright • Zero Restrictions",
    description:
      "Nomster belongs to humanity. You have 100% legal freedom to make merch, mint NFTs, release games, or build commercial brands without asking permission.",
    icon: ShieldCheck,
    iconColor: "text-solana-green",
    iconBg: "bg-solana-green/10 border-solana-green/20",
    href: "/manifesto",
    actionText: "Read CC0 Manifesto",
    colSpanClass: "col-12 col-lg-4",
  },
  {
    id: "create",
    badge: "03 • CREATE",
    badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    title: "CC0 Creator Studio",
    subtitle: "Memes, Skins, Beats & Cards",
    description:
      "Design 16x16 pixel outfits for Nomster, generate viral social memes, compose 8-bit chiptune tracks with Web Audio oscillators, and forge holographic trading cards.",
    icon: Palette,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10 border-amber-500/20",
    href: "#create",
    actionText: "Launch Studio",
    colSpanClass: "col-12 col-md-6 col-lg-4",
  },
  {
    id: "write",
    badge: "04 • WRITE",
    badgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    title: "Living Community Lore",
    subtitle: "Canon Written via GitHub PRs",
    description:
      "No corporate writers' room. All stories, characters, and universe events are submitted by players as Markdown PRs on GitHub and merged into canon.",
    icon: BookOpen,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/10 border-purple-500/20",
    href: "#universe",
    actionText: "Explore Universe",
    colSpanClass: "col-12 col-md-6 col-lg-4",
  },
  {
    id: "token",
    badge: "05 • TOKEN",
    badgeColor: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    title: "1% Auto-Burn Flywheel",
    subtitle: "Deflationary Utility on Solana",
    description:
      "0% DEX tax. 1% of every arcade game room wager is permanently incinerated, shrinking the 1 Billion $NOM supply with every match played.",
    icon: Flame,
    iconColor: "text-rose-400",
    iconBg: "bg-rose-500/10 border-rose-500/20",
    href: "/tokenomics",
    actionText: "View Deflation Model",
    colSpanClass: "col-12 col-md-6 col-lg-4",
  },
  {
    id: "build",
    badge: "06 • BUILD",
    badgeColor: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    title: "Open-Source Web3 Architecture",
    subtitle: "Next.js 14 • Phaser 3 • Multi-RPC Cluster",
    description:
      "Inspect the entire codebase on GitHub. Zero secret algorithms, decentralized telemetry failovers, and modular arcade architecture built for builders.",
    icon: Code2,
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/10 border-cyan-500/20",
    href: "https://github.com/jsepkt/nomverse",
    isExternal: true,
    actionText: "Fork on GitHub",
    colSpanClass: "col-12 col-lg-12",
  },
];

export const WhatIsNomverse: React.FC = () => {
  return (
    <section
      id="what-is-nomverse"
      className="scroll-mt-20 w-full py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-slate-950/40 relative overflow-hidden"
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-[1360px] mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold glass-pill text-emerald-400 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ECOSYSTEM ARCHITECTURE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            What is <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-solana-green bg-clip-text text-transparent">NomVerse</span>?
          </h2>

          <p className="text-slate-300 text-sm sm:text-lg leading-relaxed font-normal">
            NomVerse is an open-source universe built around Nomster. You can{" "}
            <strong className="text-white">play it</strong>,{" "}
            <strong className="text-white">create with it</strong>, and{" "}
            <strong className="text-white">build on it</strong>.{" "}
            <strong className="text-emerald-400">$NOM</strong> is the ecosystem token.
          </p>
        </div>

        {/* Bento Grid (2026 Layout Standard) */}
        <div className="row g-4">
          {BENTO_TILES.map((tile) => {
            const Icon = tile.icon;

            return (
              <div key={tile.id} className={tile.colSpanClass}>
                <div className="h-100 p-6 sm:p-8 rounded-3xl glass-card glass-card-hover flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    {/* Header Row */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] font-mono font-black px-3 py-1 rounded-full border ${tile.badgeColor}`}
                      >
                        {tile.badge}
                      </span>

                      <div
                        className={`w-11 h-11 rounded-2xl ${tile.iconBg} border flex items-center justify-center`}
                      >
                        <Icon className={`w-5 h-5 ${tile.iconColor}`} />
                      </div>
                    </div>

                    {/* Title & Subtitle */}
                    <div className="space-y-1">
                      <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {tile.title}
                      </h3>
                      <div className="text-xs font-mono font-bold text-slate-400">
                        {tile.subtitle}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                      {tile.description}
                    </p>
                  </div>

                  {/* Action Link */}
                  <div className="pt-4 border-t border-white/10">
                    {tile.isExternal ? (
                      <a
                        href={tile.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => sounds.playButtonClick()}
                        className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-200 hover:text-emerald-300 transition-colors"
                      >
                        <span>{tile.actionText}</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </a>
                    ) : (
                      <Link
                        href={tile.href}
                        onClick={() => sounds.playButtonClick()}
                        className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-200 hover:text-emerald-300 transition-colors"
                      >
                        <span>{tile.actionText}</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
