import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Heart, Sparkles, ExternalLink, Zap, Flame, Gamepad2, Palette, MessageSquare, Code2 } from "lucide-react";
import { GithubIcon } from "./icons";
import { TOKEN_CONFIG } from "@/config/token";

export const Footer: React.FC = () => {
  return (
    <footer id="license" className="w-full border-t border-slate-800 bg-[#05070B] text-slate-400 pt-16 pb-28 lg:pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1360px] mx-auto space-y-12">
        {/* Top Brand & Mission Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-400/50 p-1 flex items-center justify-center">
              <Image
                src="/mascot.svg"
                alt="Nomster Mascot"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div>
              <span className="text-xl font-black text-white tracking-tight flex items-center gap-1">
                NOM<span className="text-solana-green">VERSE</span>
              </span>
              <p className="text-xs text-slate-400 font-mono">
                The Open-Source Mascot Universe of Web3 (CC0)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% CC0 Public Domain
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-solana-purple/10 text-solana-purple border border-solana-purple/20">
              Solana Token-2022
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              0% Tax • 1% Auto-Burn
            </span>
          </div>
        </div>

        {/* Structured 5 Columns (Section 15 UX Audit: Play, Create, Community, Build, $NOM) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 text-xs font-sans">
          {/* Column 1: Play */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold font-mono uppercase tracking-wider text-xs">
              <Gamepad2 className="w-4 h-4 text-emerald-400" />
              <span>Play</span>
            </div>
            <ul className="space-y-2 text-slate-300">
              <li>
                <Link href="/play" className="hover:text-emerald-400 transition-colors">
                  Retro Arcade Game
                </Link>
              </li>
              <li>
                <Link href="/play" className="hover:text-emerald-400 transition-colors">
                  Wager &amp; Game Rooms
                </Link>
              </li>
              <li>
                <Link href="#community" className="hover:text-emerald-400 transition-colors">
                  Arcade Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/play" className="hover:text-emerald-400 transition-colors">
                  World Boss Raid
                </Link>
              </li>
              <li>
                <Link href="/hall-of-fame" className="hover:text-emerald-400 transition-colors">
                  High Score Champions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Create */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold font-mono uppercase tracking-wider text-xs">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>Create</span>
            </div>
            <ul className="space-y-2 text-slate-300">
              <li>
                <Link href="#create" className="hover:text-amber-400 transition-colors">
                  Meme Studio
                </Link>
              </li>
              <li>
                <Link href="#create" className="hover:text-amber-400 transition-colors">
                  Pixel Skin Workshop
                </Link>
              </li>
              <li>
                <Link href="#create" className="hover:text-amber-400 transition-colors">
                  NomBeats Chiptunes
                </Link>
              </li>
              <li>
                <Link href="#create" className="hover:text-amber-400 transition-colors">
                  Flex Card Studio
                </Link>
              </li>
              <li>
                <Link href="#create" className="hover:text-amber-400 transition-colors">
                  CC0 Vector Assets
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Community */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold font-mono uppercase tracking-wider text-xs">
              <MessageSquare className="w-4 h-4 text-teal-400" />
              <span>Community</span>
            </div>
            <ul className="space-y-2 text-slate-300">
              <li>
                <Link href="#community" className="hover:text-teal-400 transition-colors">
                  The NomWall Feed
                </Link>
              </li>
              <li>
                <Link href="#universe" className="hover:text-teal-400 transition-colors">
                  Living Lore Chapters
                </Link>
              </li>
              <li>
                <Link href="#community" className="hover:text-teal-400 transition-colors">
                  Bounties &amp; Quests
                </Link>
              </li>
              <li>
                <Link href="/hall-of-fame" className="hover:text-teal-400 transition-colors">
                  Burn Hall of Fame
                </Link>
              </li>
              <li>
                <Link href="#what-is-nomverse" className="hover:text-teal-400 transition-colors">
                  What is NomVerse?
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Build */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold font-mono uppercase tracking-wider text-xs">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>Build</span>
            </div>
            <ul className="space-y-2 text-slate-300">
              <li>
                <a
                  href="https://github.com/jsepkt/nomverse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1"
                >
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <Link href="#developer" className="hover:text-cyan-400 transition-colors">
                  Developer Docs
                </Link>
              </li>
              <li>
                <Link href="/manifesto" className="hover:text-cyan-400 transition-colors">
                  CC0 Legal Code
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/jsepkt/nomverse/pulls"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1"
                >
                  <span>Contribute (PRs)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: $NOM */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold font-mono uppercase tracking-wider text-xs">
              <Flame className="w-4 h-4 text-rose-400" />
              <span>$NOM</span>
            </div>
            <ul className="space-y-2 text-slate-300">
              <li>
                <Link href="/guide" className="hover:text-rose-400 transition-colors">
                  How to Buy Guide
                </Link>
              </li>
              <li>
                <Link href="/tokenomics" className="hover:text-rose-400 transition-colors">
                  Deflation Simulator
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-rose-400 transition-colors">
                  Contract Security Audit
                </Link>
              </li>
              <li>
                <a
                  href={TOKEN_CONFIG.pumpFunUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-rose-400 transition-colors flex items-center gap-1"
                >
                  <span>pump.fun Trading</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <Link href="/manifesto" className="hover:text-rose-400 transition-colors">
                  Anti-Rug Manifesto
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* CC0 1.0 Universal Statement Banner */}
        <div className="p-6 rounded-2xl bg-surface/60 border border-slate-800 text-xs text-slate-400 leading-relaxed space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold uppercase tracking-wider text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Creative Commons Zero 1.0 Universal (CC0 1.0) Public Domain Dedication</span>
          </div>
          <p className="text-slate-300">
            To the extent possible under law, the authors and contributors of <strong>NomVerse</strong> have dedicated all copyright and related neighboring rights to the mascot character (&ldquo;Nomster&rdquo;), vector SVGs, audio synthesis algorithms, story chapters, and source code to the public domain worldwide.
          </p>
          <p className="text-slate-400 text-[11px]">
            You can copy, modify, distribute, and perform the work, even for commercial purposes, all without asking permission. No rights reserved.
          </p>
        </div>

        {/* Bottom copyright-free line */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 text-xs text-slate-400 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for the open-source Web3 commons. No rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px]">
            <Link href="/guide" className="hover:text-white transition-colors">
              Guide
            </Link>
            <span>•</span>
            <Link href="/security" className="hover:text-white transition-colors">
              Security
            </Link>
            <span>•</span>
            <Link href="/tokenomics" className="hover:text-white transition-colors">
              Tokenomics
            </Link>
            <span>•</span>
            <Link href="/manifesto" className="hover:text-white transition-colors">
              Manifesto
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
