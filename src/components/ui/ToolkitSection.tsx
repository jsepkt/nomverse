"use client";

import React, { useState } from "react";
import Image from "next/image";
import { GitFork, Code2, Rocket, Download, Copy, CheckCircle2, ExternalLink, Sparkles } from "lucide-react";
import { MemeStudio } from "../tools/MemeStudio";
import { ChiptuneStudio } from "../audio/ChiptuneStudio";

export const ToolkitSection: React.FC = () => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <section id="toolkit" className="w-full py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-slate-950/40">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-candy-amber/10 text-candy-gold border border-candy-amber/30 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OPEN-SOURCE ECOSYSTEM</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
            Developer &amp; Creator Toolkit
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Because NomVerse is dedicated to the public domain under CC0, there are zero intellectual property restrictions. Remix the physics engine, design 3D prints, build Telegram mini-apps, or expand the canon.
          </p>
        </div>

        {/* 3-Step Contribution Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Step 1: Fork & Clone */}
          <div className="rounded-2xl bg-surface border border-slate-800/90 p-6 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
                <GitFork className="w-6 h-6" />
              </div>
              <div className="text-xs font-mono text-emerald-400 font-bold mb-1">STEP 01</div>
              <h3 className="text-xl font-bold text-white mb-2">Fork &amp; Clone</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Fork the canonical NomVerse GitHub repository to your own account, install Node dependencies, and run the hot-reloading dev environment on Windows, Mac, or Linux.
              </p>
            </div>

            <div className="relative mt-2 p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
              <code>git clone https://github.com/nomverse/nomverse.git<br/>cd nomverse &amp;&amp; npm i<br/>npm run dev</code>
              <button
                onClick={() => copyToClipboard("git clone https://github.com/nomverse/nomverse.git\ncd nomverse && npm i\nnpm run dev", "clone")}
                className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Copy commands"
              >
                {copiedCmd === "clone" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Step 2: Build & Mod */}
          <div className="rounded-2xl bg-surface border border-slate-800/90 p-6 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-solana-purple/10 border border-solana-purple/30 flex items-center justify-center text-solana-purple mb-5">
                <Code2 className="w-6 h-6" />
              </div>
              <div className="text-xs font-mono text-solana-purple font-bold mb-1">STEP 02</div>
              <h3 className="text-xl font-bold text-white mb-2">Build &amp; Mod</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Hack on the Phaser 3 physics scenes in <code>src/components/game/</code>, add new particle fx, integrate Solana wallet signatures, or write fresh chapters in <code>src/content/stories/</code>.
              </p>
            </div>

            <div className="mt-2 p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 flex items-center justify-between">
              <span className="text-emerald-400">src/components/game/MainScene.ts</span>
              <span className="text-[11px] text-slate-500">Phaser 3</span>
            </div>
          </div>

          {/* Step 3: Merge & Deploy */}
          <div className="rounded-2xl bg-surface border border-slate-800/90 p-6 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-5">
                <Rocket className="w-6 h-6" />
              </div>
              <div className="text-xs font-mono text-cyan-400 font-bold mb-1">STEP 03</div>
              <h3 className="text-xl font-bold text-white mb-2">Merge &amp; Deploy</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Submit your Pull Request. Once approved by community maintainers and merged into <code>main</code>, the CI/CD pipeline triggers an automated live deployment on Vercel.
              </p>
            </div>

            <div className="mt-2 p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>CI/CD: Zero Downtime Edge Deploy</span>
            </div>
          </div>
        </div>

        {/* In-Browser CC0 Nomster PFP & Meme Maker Studio */}
        <div className="mb-14">
          <MemeStudio />
        </div>

        {/* 8-Bit Chiptune Beat Studio (NomBeats) */}
        <div className="mb-16">
          <ChiptuneStudio />
        </div>

        {/* CC0 Public Domain Vector Asset Showcase */}
        <div className="rounded-2xl bg-surface border border-slate-800/90 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                Download CC0 Vector Assets
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                100% royalty-free vector SVG files. Free to remix, print, sell, or include in any commercial game.
              </p>
            </div>
            <a
              href="#license"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 hover:underline"
            >
              <span>View CC0 1.0 Legal Code</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Mascot Card */}
            <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-5 flex items-center gap-5">
              <div className="relative w-20 h-20 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2 flex items-center justify-center shrink-0">
                <Image
                  src="/mascot.svg"
                  alt="Nomster Vector SVG"
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white text-base truncate">Nomster Mascot</h4>
                <p className="text-xs text-slate-400 mb-3">Vibrant green vector mascot SVG with expressive cartoon eyes.</p>
                <a
                  href="/mascot.svg"
                  download="nomster.svg"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download SVG</span>
                </a>
              </div>
            </div>

            {/* Candy Card */}
            <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-5 flex items-center gap-5">
              <div className="relative w-20 h-20 rounded-xl bg-candy-amber/10 border border-candy-amber/30 p-2 flex items-center justify-center shrink-0">
                <Image
                  src="/candy.svg"
                  alt="Solana Candy Vector SVG"
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white text-base truncate">Solana Crypto Candy</h4>
                <p className="text-xs text-slate-400 mb-3">Golden candy drop with Solana speed transaction stripes.</p>
                <a
                  href="/candy.svg"
                  download="candy.svg"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download SVG</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
