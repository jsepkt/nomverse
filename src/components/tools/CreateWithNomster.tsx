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
import { sounds } from "../audio/soundEffects";

type StudioTab = "memes" | "skins" | "beats" | "cards" | "assets";

interface StudioTool {
  id: StudioTab;
  title: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
  activeBorder: string;
}

const TOOLS: StudioTool[] = [
  {
    id: "memes",
    title: "Meme Studio",
    badge: "Viral Engine",
    icon: Smile,
    description: "Generate viral Nomster memes with custom top/bottom text, stickers, and 1-click downloads.",
    color: "text-amber-400",
    activeBorder: "border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)]",
  },
  {
    id: "skins",
    title: "Skin Workshop",
    badge: "16x16 Sprites",
    icon: Palette,
    description: "Design custom pixel art outfits and export playable Nomster arcade skins directly to PNG.",
    color: "text-emerald-400",
    activeBorder: "border-emerald-400 shadow-[0_0_25px_rgba(20,241,149,0.3)]",
  },
  {
    id: "beats",
    title: "NomBeats Studio",
    badge: "8-Bit Synth",
    icon: Music,
    description: "Compose authentic retro chiptune beats using browser Web Audio API oscillator nodes.",
    color: "text-solana-purple",
    activeBorder: "border-purple-400 shadow-[0_0_25px_rgba(153,69,255,0.3)]",
  },
  {
    id: "cards",
    title: "Flex Card Studio",
    badge: "Holographic",
    icon: CreditCard,
    description: "Forge dynamic holographic trading cards for arcade victories, streaks, and token burns.",
    color: "text-cyan-400",
    activeBorder: "border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)]",
  },
  {
    id: "assets",
    title: "CC0 Asset Vault",
    badge: "Vector SVGs",
    icon: Download,
    description: "Download pure vector mascot graphics, candy icons, and brand files free for commercial use.",
    color: "text-teal-400",
    activeBorder: "border-teal-400 shadow-[0_0_25px_rgba(20,241,149,0.3)]",
  },
];

export const CreateWithNomster: React.FC = () => {
  const [activeTab, setActiveTab] = useState<StudioTab>("memes");

  const handleSelectTab = (id: StudioTab) => {
    sounds.playButtonClick();
    setActiveTab(id);
  };

  return (
    <section
      id="create"
      className="scroll-mt-20 w-full py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 relative"
    >
      <div className="max-w-[1360px] mx-auto space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold glass-pill text-amber-400 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>COMMUNITY CREATIVE SUITE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Create with <span className="text-amber-400">Nomster</span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
            Everything you build here is 100% CC0 public domain. Pick a tool below to make memes, design pixel skins, write chiptunes, or download vector assets.
          </p>
        </div>

        {/* Clean Studio Switcher Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTab === tool.id;

            return (
              <button
                key={tool.id}
                onClick={() => handleSelectTab(tool.id)}
                className={`tactile-button p-3.5 sm:p-4 rounded-2xl text-left border transition-all duration-200 cursor-pointer min-h-[110px] flex flex-col justify-between touch-manipulation ${
                  isActive
                    ? `bg-slate-900 ${tool.activeBorder} ring-1 ring-white/20`
                    : "glass-card hover:border-slate-600"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-5 h-5 ${tool.color}`} />
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                      {tool.badge}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    {tool.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] font-mono">
                  <span className={isActive ? "text-amber-400 font-bold" : "text-slate-400"}>
                    {isActive ? "Active Studio" : "Open Tool"}
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

        {/* Studio Workspace Canvas Frame */}
        <div className="rounded-3xl glass-card p-4 sm:p-6 lg:p-8 shadow-2xl relative overflow-hidden">
          {activeTab === "memes" && <MemeStudio />}
          {activeTab === "skins" && <PixelSkinWorkshop />}
          {activeTab === "beats" && <ChiptuneStudio />}
          {activeTab === "cards" && <ViralCardStudio />}
          {activeTab === "assets" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
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
                <div className="rounded-2xl glass-card p-5 flex flex-col justify-between space-y-4">
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
                    onClick={() => sounds.playGoldenChime()}
                    className="tactile-button inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold min-h-[40px]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download SVG</span>
                  </a>
                </div>

                <div className="rounded-2xl glass-card p-5 flex flex-col justify-between space-y-4">
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
                    onClick={() => sounds.playGoldenChime()}
                    className="tactile-button inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold min-h-[40px]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Sprites</span>
                  </a>
                </div>

                <div className="rounded-2xl glass-card p-5 flex flex-col justify-between space-y-4">
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
                    onClick={() => sounds.playButtonClick()}
                    className="tactile-button inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-400 border border-purple-500/30 text-xs font-mono font-bold min-h-[40px]"
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
