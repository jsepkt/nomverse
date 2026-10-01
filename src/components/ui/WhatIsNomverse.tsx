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
  Zap,
} from "lucide-react";

interface PillarItem {
  id: string;
  verb: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  actionText: string;
  actionHref: string;
}

const PILLARS: PillarItem[] = [
  {
    id: "play",
    verb: "PLAY",
    title: "No-Wallet Retro Arcade",
    description:
      "Jump straight into 5 stages of physics arcade gameplay. Eat candies, dodge obstacles, and compete on the global leaderboard without needing a wallet.",
    icon: Gamepad2,
    accentColor: "border-emerald-500/30 hover:border-emerald-400 group-hover:shadow-[0_0_25px_rgba(20,241,149,0.2)]",
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-emerald-400",
    actionText: "Play Arcade",
    actionHref: "/play",
  },
  {
    id: "create",
    verb: "CREATE",
    title: "CC0 Creator Studio",
    description:
      "Design 16x16 pixel skins, generate viral memes, compose 8-bit chiptune beats, and forge holographic flex trading cards right in your browser.",
    icon: Palette,
    accentColor: "border-amber-500/30 hover:border-amber-400 group-hover:shadow-[0_0_25px_rgba(245,158,11,0.2)]",
    badgeBg: "bg-amber-500/15",
    badgeText: "text-amber-400",
    actionText: "Open Studio",
    actionHref: "#create",
  },
  {
    id: "write",
    verb: "WRITE",
    title: "Living Community Lore",
    description:
      "Nomster’s story is not locked in a corporate boardroom. Every canon episode is submitted by the community via GitHub Markdown pull requests.",
    icon: BookOpen,
    accentColor: "border-purple-500/30 hover:border-purple-400 group-hover:shadow-[0_0_25px_rgba(168,85,247,0.2)]",
    badgeBg: "bg-purple-500/15",
    badgeText: "text-purple-400",
    actionText: "Explore Lore",
    actionHref: "#universe",
  },
  {
    id: "build",
    verb: "BUILD",
    title: "Open-Source Web3 Codebase",
    description:
      "Fork the Next.js 14 & Phaser 3 repository. Inspect the zero-latency Web Audio engine, run local instances, or contribute game improvements.",
    icon: Code2,
    accentColor: "border-cyan-500/30 hover:border-cyan-400 group-hover:shadow-[0_0_25px_rgba(6,182,212,0.2)]",
    badgeBg: "bg-cyan-500/15",
    badgeText: "text-cyan-400",
    actionText: "View on GitHub",
    actionHref: "https://github.com/jsepkt/nomverse",
  },
  {
    id: "remix",
    verb: "REMIX",
    title: "100% CC0 Public Domain",
    description:
      "Nomster belongs to everyone. Zero copyright, zero trademark claims, and zero royalty fees. Print merchandise, launch games, or build derivative brands.",
    icon: ShieldCheck,
    accentColor: "border-solana-green/30 hover:border-solana-green group-hover:shadow-[0_0_25px_rgba(20,241,149,0.2)]",
    badgeBg: "bg-solana-green/15",
    badgeText: "text-solana-green",
    actionText: "Read CC0 Manifesto",
    actionHref: "/manifesto",
  },
];

export const WhatIsNomverse: React.FC = () => {
  return (
    <section
      id="what-is-nomverse"
      className="scroll-mt-20 w-full py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-slate-950/40 relative overflow-hidden"
    >
      {/* Background Neon Halo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1360px] mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>THE OPEN-SOURCE MASCOT UNIVERSE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            What is <span className="text-solana-green">NomVerse</span>?
          </h2>

          <p className="text-slate-300 text-sm sm:text-lg leading-relaxed font-medium">
            NomVerse is an open-source universe built around Nomster. You can{" "}
            <strong className="text-white">play it</strong>,{" "}
            <strong className="text-white">create with it</strong>, and{" "}
            <strong className="text-white">build on it</strong>.{" "}
            <strong className="text-emerald-400">$NOM</strong> is the ecosystem token.
          </p>
        </div>

        {/* 5 Pillars Grid (Section 5 & 18 UX Audit) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            const isExternal = pillar.actionHref.startsWith("http");

            return (
              <div
                key={pillar.id}
                className={`group relative rounded-2xl bg-surface/80 border p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm ${pillar.accentColor}`}
              >
                <div className="space-y-4">
                  {/* Top Header Badge */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-10 h-10 rounded-xl ${pillar.badgeBg} border border-white/10 flex items-center justify-center`}
                    >
                      <Icon className={`w-5 h-5 ${pillar.badgeText}`} />
                    </div>
                    <span
                      className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full ${pillar.badgeBg} ${pillar.badgeText} border border-white/10 tracking-wider`}
                    >
                      {pillar.verb}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Action Link */}
                <div className="pt-4 mt-4 border-t border-slate-800/80">
                  {isExternal ? (
                    <a
                      href={pillar.actionHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300 hover:text-white transition-colors"
                    >
                      <span>{pillar.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </a>
                  ) : (
                    <Link
                      href={pillar.actionHref}
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300 hover:text-white transition-colors"
                    >
                      <span>{pillar.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
