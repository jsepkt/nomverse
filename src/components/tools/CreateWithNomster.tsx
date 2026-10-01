"use client";

import React, { useState } from "react";
import {
  Palette,
  Sparkles,
  Music,
  CreditCard,
  Download,
  ExternalLink,
  ChevronRight,
  Layers,
  Smile,
} from "lucide-react";
import { MemeStudio } from "./MemeStudio";
import { PixelSkinWorkshop } from "./PixelSkinWorkshop";
import { ViralCardStudio } from "./ViralCardStudio";
import { ChiptuneStudio } from "../audio/ChiptuneStudio";

type StudioTab = "memes" | "skins" | "beats" | "cards" | "assets";

interface StudioTool {
  id: StudioTab;
  title: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
  bgGlow: string;
}

const TOOLS: StudioTool[] = [
  {
    id: "memes",
    title: "Meme Studio",
    badge: "Viral Engine",
    icon: Smile,
    description: "Generate viral Nomster memes with captions, stickers, and 1-click downloads.",
    color: "text-amber-400",
    bgGlow: "group-hover:border-amber-500/50",
  },
  {
    id: "skins",
    title: "Skin Workshop",
    badge: "16x16 Sprites",
    icon: Palette,
    description: "Design custom pixel art outfits and export playable Nomster arcade skins.",
    color: "text-emerald-400",
    bgGlow: "group-hover:border-emerald-500/50",
  },
  {
    id: "beats",
    title: "NomBeats Studio",
    badge: "8-Bit Synthesizer",
    icon: Music,
    description: "Compose authentic chiptune melodies using browser Web Audio oscillators.",
    color: "text-solana-purple",
    bgGlow: "group-hover:border-purple-500/50",
  },
  {
    id: "cards",
    title: "Flex Card Studio",
    badge: "Holographic",
    icon: CreditCard,
    description: "Forge dynamic holographic trading cards for scores, burns, and raid trophies.",
    color: "text-cyan-400",
    bgGlow: "group-hover:border-cyan-500/50",
  },
  {
    id: "assets",
    title: "CC0 Asset Vault",
    badge: "Free Vector SVGs",
    icon: Download,
    description: "Download high-res mascot vectors, game sprites, and brand assets for any project.",
    color: "text-teal-400",
    bgGlow: "group-hover:border-teal-500/50",
  },
];

export const CreateWithNomster: React.FC = () => {
  const [activeTab, setActiveTab] = useState<StudioTab>("memes");

  return (
    <section
      id="create"
      className="scroll-mt-20 w-full py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 relative"
    >
      <div className="max-w-[1360px] mx-auto space-y-10">
        {/* Section Header (Section 10 UX Audit: Combine into CREATE WITH NOMSTER) */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CREATIVE SUITE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Create with <span className="text-amber-400">Nomster</span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Everything you build here is 100% CC0 public domain. Pick a tool below to make memes, design pixel skins, write chiptunes, or download vector assets.
          </p>
        </div>

        {/* Clean Grid of Studio Tools (Section 10 UX Audit) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTab === tool.id;

            return (
              <button
                key={tool.id}
                onClick={() => setActiveTab(tool.id)}
                className={`group p-3 sm:p-4 rounded-2xl text-left border transition-all duration-200 cursor-pointer min-h-[110px] sm:min-h-[130px] flex flex-col justify-between touch-manipulation active:scale-[0.98] ${
                  isActive
                    ? "bg-slate-900 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/50"
                    : "bg-surface/70 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-5 h-5 ${tool.color}`} />
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                      {tool.badge}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    {tool.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] font-mono">
                  <span className={isActive ? "text-amber-400 font-bold" : "text-slate-400"}>
                    {isActive ? "Active Tool" : "Launch"}
                  </span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${
                      isActive ? "text-amber-400 translate-x-1" : "text-slate-500"
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Studio Workspace Container */}
        <div className="rounded-3xl bg-slate-950/90 border border-slate-800/90 p-4 sm:p-6 lg:p-8 shadow-2xl">
          {activeTab === "memes" && <MemeStudio />}
          {activeTab === "skins" && <PixelSkinWorkshop />}
          {activeTab === "beats" && <ChiptuneStudio />}
          {activeTab === "cards" && <ViralCardStudio />}
          {activeTab === "assets" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    Download CC0 Vector Assets
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    100% royalty-free vector SVG files. Free to remix, print, sell, or include in any commercial game.
                  </p>
                </div>
                <a
                  href="/manifesto"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 hover:underline shrink-0"
                >
                  <span>View CC0 1.0 Legal Code</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-surface border border-slate-800 p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
                      <Palette className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-white">Nomster Vector Mascot</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Full-resolution scalable SVG with editable color paths and expressions.
                    </p>
                  </div>
                  <a
                    href="/mascot.svg"
                    download="nomster-mascot.svg"
                    className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold transition-all min-h-[40px]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download SVG</span>
                  </a>
                </div>

                <div className="rounded-2xl bg-surface border border-slate-800 p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-white">Arcade Candies &amp; Items</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Solana candy, golden drop, shields, multipliers, and retro particle sprites.
                    </p>
                  </div>
                  <a
                    href="/favicon.svg"
                    download="nomster-candies.svg"
                    className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold transition-all min-h-[40px]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Sprites</span>
                  </a>
                </div>

                <div className="rounded-2xl bg-surface border border-slate-800 p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3">
                      <Layers className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-white">Full Brand Kit (CC0)</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Logotypes, Solana green color palettes, arcade typography specs, and banners.
                    </p>
                  </div>
                  <a
                    href="https://github.com/jsepkt/nomverse/tree/main/public"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-400 border border-purple-500/30 text-xs font-mono font-bold transition-all min-h-[40px]"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Brand Vault</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
