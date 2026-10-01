"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Gamepad2, Zap, MessageSquare, Sparkles } from "lucide-react";
import { QuickBuyModal } from "../wallet/QuickBuyModal";
import { sounds } from "../audio/soundEffects";

export const FinalCta: React.FC = () => {
  const [isQuickBuyOpen, setIsQuickBuyOpen] = useState<boolean>(false);

  const scrollToArcade = (e: React.MouseEvent) => {
    e.preventDefault();
    sounds.playJumpSound();
    const el = document.getElementById("arcade-play");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-t border-slate-800/80 bg-gradient-to-b from-slate-950/40 via-emerald-950/20 to-slate-950">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative space-y-6">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-3xl glass-card p-3 flex items-center justify-center border-2 border-emerald-400/50 shadow-[0_0_35px_rgba(20,241,149,0.35)] animate-float-gentle">
            <Image
              src="/mascot.svg"
              alt="Nomster Character"
              width={90}
              height={90}
              className="object-contain"
            />
          </div>

          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold glass-pill text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE OPEN-SOURCE FRONTIER</span>
            </span>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Ready to Enter the <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-solana-green bg-clip-text text-transparent">NomVerse</span>?
            </h2>

            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              No wallet required to start. Play the retro physics arcade, design community skins, or join thousands of holders powering the next legendary Web3 mascot.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 w-full max-w-sm sm:max-w-none mx-auto pt-2">
            <button
              onClick={scrollToArcade}
              className="tactile-button inline-flex items-center justify-center gap-2 px-7 py-3.5 sm:py-4 rounded-2xl font-black text-sm sm:text-base text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-solana-green shadow-[0_0_30px_rgba(20,241,149,0.45)] hover:shadow-[0_0_40px_rgba(20,241,149,0.7)] cursor-pointer min-h-[48px] sm:min-h-[52px] touch-manipulation"
            >
              <Gamepad2 className="w-5 h-5 fill-slate-950 text-slate-950" />
              <span>PLAY NOMSTER NOW</span>
            </button>

            <button
              onClick={() => {
                sounds.playGoldenChime();
                setIsQuickBuyOpen(true);
              }}
              className="tactile-button inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-2xl font-mono font-bold text-sm sm:text-base text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 hover:border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.25)] cursor-pointer min-h-[48px] sm:min-h-[52px] touch-manipulation"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>BUY $NOM</span>
            </button>

            <Link
              href="#community"
              onClick={() => sounds.playButtonClick()}
              className="tactile-button inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-2xl font-bold text-sm sm:text-base text-slate-200 glass-card hover:border-slate-500 hover:text-white transition-all cursor-pointer min-h-[48px] sm:min-h-[52px] touch-manipulation"
            >
              <MessageSquare className="w-4 h-4 text-teal-400" />
              <span>JOIN COMMUNITY</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Buy SOL Modal */}
      <QuickBuyModal
        isOpen={isQuickBuyOpen}
        onClose={() => setIsQuickBuyOpen(false)}
      />
    </>
  );
};
