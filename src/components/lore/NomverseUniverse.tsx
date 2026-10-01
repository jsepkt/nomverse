"use client";

import React, { useState } from "react";
import Image from "next/image";
import { StoryChapter } from "@/lib/stories";
import {
  BookOpen,
  GitPullRequest,
  Calendar,
  User,
  Tag,
  ArrowRight,
  Sparkles,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { LoreStudioModal } from "./LoreStudioModal";
import { sounds } from "../audio/soundEffects";

interface NomverseUniverseProps {
  stories: StoryChapter[];
}

interface CharacterProfile {
  name: string;
  role: string;
  description: string;
  iconBg: string;
  badge: string;
  avatar: string;
  stats: { label: string; value: number; color: string }[];
}

const CHARACTERS: CharacterProfile[] = [
  {
    name: "Nomster",
    role: "The Hungry Mascot",
    description: "Born at slot 328M on Solana. Eats confirmed block candies, fears no market dips, and lives 100% in the CC0 public domain.",
    iconBg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    badge: "Protagonist",
    avatar: "/mascot.svg",
    stats: [
      { label: "Appetite", value: 100, color: "bg-emerald-400" },
      { label: "Agility", value: 95, color: "bg-teal-400" },
      { label: "CC0 Freedom", value: 100, color: "bg-solana-green" },
    ],
  },
  {
    name: "Byte the Bit-Bird",
    role: "The Navigator",
    description: "An 8-bit companion who guides Nomster through high-latency asteroid belts and chirps when golden drops enter the mempool.",
    iconBg: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    badge: "Sidekick",
    avatar: "/favicon.svg",
    stats: [
      { label: "Radar", value: 98, color: "bg-cyan-400" },
      { label: "Speed", value: 99, color: "bg-sky-400" },
      { label: "Latency", value: 100, color: "bg-emerald-400" },
    ],
  },
  {
    name: "Lord Mega-FUD",
    role: "The World Boss",
    description: "A colossal shadow behemoth made of outdated legacy financial paper. Spawns during community raid events to challenge all holders.",
    iconBg: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    badge: "Raid Boss",
    avatar: "/mascot.svg",
    stats: [
      { label: "Bureaucracy", value: 90, color: "bg-rose-500" },
      { label: "Resistance", value: 45, color: "bg-amber-400" },
      { label: "Solana Vulnerability", value: 100, color: "bg-purple-400" },
    ],
  },
];

export const NomverseUniverse: React.FC<NomverseUniverseProps> = ({ stories }) => {
  const [selectedStory, setSelectedStory] = useState<StoryChapter | null>(null);
  const [isStudioOpen, setIsStudioOpen] = useState<boolean>(false);

  const handleOpenReader = (story: StoryChapter) => {
    sounds.playGoldenChime();
    setSelectedStory(story);
  };

  const handleOpenStudio = () => {
    sounds.playButtonClick();
    setIsStudioOpen(true);
  };

  return (
    <section
      id="universe"
      className="scroll-mt-20 w-full py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-slate-950/60 relative"
    >
      <div className="max-w-[1360px] mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold glass-pill text-purple-400 border border-purple-500/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>LIVING CANON &amp; LORE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Characters, Lore &amp; <span className="text-purple-400">Living World</span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
            Unlike traditional corporate mascots, Nomster has no gatekept writers&apos; room. Read the canon chapters below or submit your own story directly via GitHub Pull Request.
          </p>
        </div>

        {/* Nintendo-Style Character Cards with Stat Meters */}
        <div>
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Notable Inhabitants</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {CHARACTERS.map((char) => (
              <div
                key={char.name}
                className="p-6 rounded-3xl glass-card glass-card-hover flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 p-1 flex items-center justify-center shadow-md">
                        <Image
                          src={char.avatar}
                          alt={char.name}
                          width={38}
                          height={38}
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">{char.name}</h4>
                        <span className="text-xs font-mono text-slate-400">{char.role}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-800">
                      {char.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {char.description}
                  </p>
                </div>

                {/* Character Stat Gauges */}
                <div className="pt-3 border-t border-white/10 space-y-2">
                  {char.stats.map((st) => (
                    <div key={st.label} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-400">{st.label}</span>
                        <span className="text-white font-bold">{st.value}%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden p-0.5 border border-slate-800">
                        <div
                          className={`h-full rounded-full ${st.color}`}
                          style={{ width: `${st.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Chapter Cards */}
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>Canon Story Chapters</span>
            </div>

            <button
              onClick={handleOpenStudio}
              className="tactile-button inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25 transition-all"
            >
              <GitPullRequest className="w-3.5 h-3.5 text-purple-400" />
              <span>
                <span className="hidden xs:inline">+ Submit Chapter via PR</span>
                <span className="xs:hidden">+ Submit PR</span>
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {stories.map((story) => (
              <div
                key={story.slug}
                className="group p-6 rounded-3xl glass-card glass-card-hover flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-black text-purple-300 bg-purple-500/15 px-3 py-1 rounded-full border border-purple-500/30">
                      CHAPTER {story.chapter < 10 ? `0${story.chapter}` : story.chapter}
                    </span>
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {story.date}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                    {story.title}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {story.summary || story.content.slice(0, 160) + "..."}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {story.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">
                    by {story.author}
                  </span>

                  <button
                    onClick={() => handleOpenReader(story)}
                    className="tactile-button inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-slate-900 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 transition-all touch-manipulation cursor-pointer"
                  >
                    <span>READ CHAPTER</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Community Contribution Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-950/40 via-slate-950 to-indigo-950/30 border border-purple-500/30 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
                    NEXT CHAPTER
                  </span>
                  <span className="text-xs font-mono text-emerald-400">Open for Submissions</span>
                </div>

                <h3 className="text-xl font-bold text-white">
                  Write the Next Canon Episode
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Have a great adventure for Nomster? Open our web studio to draft your chapter and copy the exact markdown template for a GitHub Pull Request.
                </p>
              </div>

              <div className="pt-4 border-t border-purple-500/20">
                <button
                  onClick={handleOpenStudio}
                  className="tactile-button w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg transition-all cursor-pointer"
                >
                  <GitPullRequest className="w-4 h-4 text-pink-300" />
                  <span>Launch Lore Studio</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reader Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[85vh] rounded-3xl glass-card border border-purple-500/40 p-6 sm:p-8 overflow-y-auto shadow-2xl space-y-6">
            <button
              onClick={() => setSelectedStory(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close chapter reader"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2 pr-8">
              <span className="text-xs font-mono font-black text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                CHAPTER {selectedStory.chapter}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white">
                {selectedStory.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
                <span className="text-emerald-400 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {selectedStory.author}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {selectedStory.date}
                </span>
              </div>
            </div>

            <div className="prose prose-invert prose-purple max-w-none text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line border-t border-white/10 pt-6">
              {selectedStory.content}
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">
                100% CC0 Public Domain Canon
              </span>
              <button
                onClick={() => setSelectedStory(null)}
                className="tactile-button px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-slate-900 hover:bg-slate-800 text-white border border-slate-700"
              >
                Close Reader
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lore Studio Modal */}
      <LoreStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
      />
    </section>
  );
};
