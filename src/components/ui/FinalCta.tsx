"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Gamepad2, Zap, MessageSquare, Sparkles } from "lucide-react";
import { QuickBuyModal } from "../wallet/QuickBuyModal";

export const FinalCta: React.FC = () => {
  const [isQuickBuyOpen, setIsQuickBuyOpen] = useState<boolean>(false);

  const scrollToArcade = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("arcade-play");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-t border-slate-800/80 bg-gradient-to-b from-slate-950/40 via-emerald-950/20 to-slate-950">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative space-y-6">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-emerald-500/15 border-2 border-emerald-400/50 p-2 flex items-center justify-center shadow-[0_0_30px_rgba(20,241,149,0.3)]">
            <Image
              src="/mascot.svg"
              alt="Nomster Character"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>

          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE OPEN-SOURCE FRONTIER</span>
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Ready to Enter the <span className="text-solana-green">NomVerse</span>?
            </h2>

            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              No wallet required to start. Play the retro physics arcade, design community skins, or join thousands of holders powering the next legendary Web3 mascot.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={scrollToArcade}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-solana-green shadow-[0_0_25px_rgba(20,241,149,0.4)] hover:shadow-[0_0_35px_rgba(20,241,149,0.65)] hover:scale-105 active:scale-95 transition-all cursor-pointer min-h-[48px] touch-manipulation"
            >
              <Gamepad2 className="w-5 h-5 fill-slate-950 text-slate-950" />
              <span>PLAY NOMSTER NOW</span>
            </button>

            <button
              onClick={() => setIsQuickBuyOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-mono font-bold text-sm text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 hover:border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:scale-105 active:scale-95 transition-all cursor-pointer min-h-[48px] touch-manipulation"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>BUY $NOM</span>
            </button>

            <Link
              href="#community"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-500 hover:text-white transition-all hover:scale-105 active:scale-95 min-h-[48px] touch-manipulation"
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
