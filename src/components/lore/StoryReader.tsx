"use client";

import React, { useState } from "react";
import { StoryChapter } from "@/lib/stories";
import { BookOpen, GitPullRequest, Calendar, User, Tag, ChevronRight, CheckCircle2, Copy } from "lucide-react";
import { LoreStudioModal } from "./LoreStudioModal";
import { copyToClipboard } from "@/lib/clipboard";

interface StoryReaderProps {
  stories: StoryChapter[];
}

export const StoryReader: React.FC<StoryReaderProps> = ({ stories }) => {
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [copiedPrTemplate, setCopiedPrTemplate] = useState<boolean>(false);
  const [isStudioOpen, setIsStudioOpen] = useState<boolean>(false);

  const currentStory = stories[activeChapterIndex] || stories[0];

  const handleCopyPrTemplate = async () => {
    const template = `---
title: "The Great Candy Halving"
chapter: 3
date: "2026-09-17"
author: "YourNameOrWallet"
tags: ["arcade", "lore", "candy"]
summary: "Nomster encounters the legendary cryptographic halving and discovers hyper-candies."
---

# Chapter 3: The Great Candy Halving

Your story begins here...`;

    await copyToClipboard(template);
    setCopiedPrTemplate(true);
    setTimeout(() => setCopiedPrTemplate(false), 2000);
  };

  return (
    <section id="lore" className="w-full py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-solana-purple/10 text-solana-purple border border-solana-purple/30 mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            <span>COMMUNITY LORE ENGINE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
            The Living Franchise of Nomster
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            NomVerse lore is not dictated by a closed writers&apos; room. Every episode is stored as modular Markdown in the repository. When community PRs are merged, the universe evolves in real time.
          </p>
        </div>

        {/* Chapter Tabs & Submit Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-slate-800 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            {stories.map((story, idx) => (
              <button
                key={story.slug}
                onClick={() => setActiveChapterIndex(idx)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 border ${
                  activeChapterIndex === idx
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                    : "bg-surface text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <span>Ch. {story.chapter}:</span>
                <span className="truncate max-w-[140px] sm:max-w-none">{story.title}</span>
              </button>
            ))}
          </div>

          {/* Submit Chapter 3 PR Button */}
          <button
            onClick={() => setIsStudioOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/30 transition-all hover:scale-105 cursor-pointer"
          >
            <GitPullRequest className="w-4 h-4 text-pink-300" />
            <span>+ Open Chapter 3 Lore Studio</span>
          </button>
        </div>

        {/* Reader Display Card */}
        <div className="relative rounded-2xl bg-surface border border-slate-800/90 p-6 sm:p-10 shadow-2xl overflow-hidden">
          {/* Subtle background neon glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-solana-purple/5 rounded-full blur-3xl pointer-events-none" />

          {/* Chapter Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-800/80 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5 font-mono text-emerald-400">
                <User className="w-3.5 h-3.5" />
                <span>Written by: {currentStory.author}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{currentStory.date}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {currentStory.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-1"
                >
                  <Tag className="w-2.5 h-2.5 text-solana-green" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Story Body */}
          <div className="prose prose-invert prose-emerald max-w-none">
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-6">
              {currentStory.title}
            </h1>

            {/* Formatted Markdown Content */}
            <div className="space-y-4 text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line font-sans">
              {currentStory.content}
            </div>
          </div>

          {/* Chapter PR Callout Card */}
          <div className="mt-12 p-5 rounded-xl bg-slate-950/80 border border-emerald-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-solana-green" />
                Ready to contribute to the canon?
              </h4>
              <p className="text-xs text-slate-400">
                Add <code>src/content/stories/chapter-03.md</code> on GitHub with your character, lore, or mini-game twist.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={handleCopyPrTemplate}
                className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                {copiedPrTemplate ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Template Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy PR Template</span>
                  </>
                )}
              </button>

              <a
                href="https://github.com/jsepkt/nomverse/tree/main/src/content/stories"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
              >
                <span>Submit on GitHub</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* In-Browser Chapter 3 Lore Studio Modal */}
      {isStudioOpen && (
        <LoreStudioModal isOpen={isStudioOpen} onClose={() => setIsStudioOpen(false)} />
      )}
    </section>
  );
};
