import React from "react";
import Image from "next/image";
import { ShieldCheck, Heart, Sparkles } from "lucide-react";
import { GithubIcon } from "./icons";

export const Footer: React.FC = () => {
  return (
    <footer id="license" className="w-full border-t border-slate-800 bg-[#05070B] text-slate-400 pt-12 pb-24 lg:pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Brand Icon */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 p-1 flex items-center justify-center">
            <Image
              src="/mascot.svg"
              alt="Nomster Logo"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
          <span className="text-lg font-black text-white tracking-tight">
            NOM<span className="text-solana-green">VERSE</span>
          </span>
        </div>

        {/* Official CC0 1.0 Universal Public Domain Statement */}
        <div className="max-w-2xl bg-surface/80 border border-slate-800 rounded-2xl p-6 mb-8 text-xs sm:text-sm text-slate-300 leading-relaxed shadow-lg">
          <div className="flex items-center justify-center gap-2 text-emerald-400 font-mono font-bold uppercase tracking-wider text-xs mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Creative Commons Zero 1.0 Universal (CC0 1.0)</span>
          </div>
          <p className="text-slate-300">
            To the extent possible under law, the authors and contributors of <strong>NomVerse</strong> have dedicated all copyright and related neighboring rights to the mascot character (&ldquo;Nomster&rdquo;), vector SVGs, audio synthesis algorithms, story chapters, and source code to the public domain worldwide.
          </p>
          <p className="mt-3 text-slate-400 text-xs">
            You can copy, modify, distribute, and perform the work, even for commercial purposes, all without asking permission. No rights reserved.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-400 mb-8">
          <a
            href="#wall"
            className="hover:text-solana-green transition-colors flex items-center gap-1.5 font-bold text-emerald-400"
          >
            <span>💬 The NomWall (Community)</span>
          </a>
          <span className="text-slate-700">•</span>
          <a
            href="https://github.com/jsepkt/nomverse"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-solana-green transition-colors flex items-center gap-1.5"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>GitHub Repository</span>
          </a>
          <span className="text-slate-700">•</span>
          <a
            href="https://pump.fun"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-solana-green transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>pump.fun Launch</span>
          </a>
          <span className="text-slate-700">•</span>
          <a
            href="https://creativecommons.org/publicdomain/zero/1.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-solana-green transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>CC0 Legal Deed</span>
          </a>
        </div>

        {/* Bottom copyright-free line */}
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <span>Crafted with</span>
          <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          <span>for the open-source Web3 commons. No Rights Reserved.</span>
        </div>
      </div>
    </footer>
  );
};
