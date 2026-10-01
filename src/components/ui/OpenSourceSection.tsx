"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  GitPullRequest,
  Code2,
  ExternalLink,
  Sparkles,
  BookOpen,
  Copy,
  Check,
} from "lucide-react";
import { GithubIcon } from "./icons";
import { copyToClipboard } from "@/lib/clipboard";

export const OpenSourceSection: React.FC = () => {
  const [copiedClone, setCopiedClone] = useState<boolean>(false);

  const handleCopyClone = async () => {
    await copyToClipboard("git clone https://github.com/jsepkt/nomverse.git");
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  return (
    <section
      id="open-source"
      className="scroll-mt-20 w-full py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-slate-950/40 relative overflow-hidden"
    >
      <div className="max-w-[1360px] mx-auto space-y-12">
        {/* SECTION 11 UX AUDIT: CC0 POSITIONING */}
        <div className="relative rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-950 to-purple-950/30 border border-emerald-500/30 p-6 sm:p-10 lg:p-12 shadow-2xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>CREATIVE COMMONS ZERO 1.0 (CC0)</span>
          </div>

          {/* Suggested Headline (Section 11 UX Audit) */}
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            NOMSTER BELONGS TO EVERYONE.
          </h2>

          <p className="text-slate-200 text-sm sm:text-lg max-w-3xl mx-auto leading-relaxed">
            No copyright claims. No trademark litigation. No royalty fees. Nomster and all associated vector assets, audio algorithms, and story chapters have been dedicated to the public domain worldwide.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/manifesto"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-950/40 transition-all hover:scale-105 active:scale-95 min-h-[44px] touch-manipulation"
            >
              <ShieldCheck className="w-4 h-4 fill-slate-950" />
              <span>Read the CC0 Manifesto</span>
            </Link>

            <a
              href="https://creativecommons.org/publicdomain/zero/1.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl font-mono text-xs sm:text-sm text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all min-h-[44px] touch-manipulation"
            >
              <span>CC0 Legal Deed</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* SECTION 12 UX AUDIT: DEVELOPER EXPERIENCE ("Build on NomVerse") */}
        <div id="developer" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-1">
                BUILD ON NOMVERSE
              </div>
              <h3 className="text-2xl font-black text-white">
                Open-Source Infrastructure
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyClone}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 transition-all"
              >
                {copiedClone ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">git clone copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy git clone</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl bg-surface/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-200">
                  <GithubIcon className="w-5 h-5 text-slate-200" />
                </div>
                <h4 className="text-base font-bold text-white">Fork the Repository</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Clone the canonical GitHub repository. Build custom physics mechanics, add powerups, and test locally with hot-reloading Next.js 14.
                </p>
              </div>
              <a
                href="https://github.com/jsepkt/nomverse"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 hover:underline"
              >
                <span>github.com/jsepkt/nomverse</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-6 rounded-2xl bg-surface/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-purple-400">
                  <Code2 className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white">Zero-Network Web Audio</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Our custom synthesizer runs 100% on client-side Web Audio API oscillator nodes. Zero audio files to fetch over the network (0KB download overhead, 0ms latency).
                </p>
              </div>
              <Link
                href="/manifesto#tech"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-purple-400 hover:underline"
              >
                <span>Read Architecture Specs</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-surface/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400">
                  <GitPullRequest className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white">Submit Community PRs</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  When community pull requests are reviewed and merged into main, edge CI/CD automatically deploys the changes live to the world.
                </p>
              </div>
              <a
                href="https://github.com/jsepkt/nomverse/pulls"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 hover:underline"
              >
                <span>Open Pull Requests</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
