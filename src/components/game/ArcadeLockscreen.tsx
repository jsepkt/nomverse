"use client";

import React from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { Lock, Wallet, Sparkles, ShieldCheck, Flame, Heart } from "lucide-react";

export const ArcadeLockscreen: React.FC = () => {
  const { openAuthModal } = useAuth();

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-slate-950/85 backdrop-blur-md text-center animate-fade-in select-none">
      {/* Background Neon Halo */}
      <div className="absolute w-72 h-72 rounded-full bg-solana-green/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-sm space-y-4">
        {/* Animated Mascot Preview */}
        <div className="relative w-24 h-24 mx-auto mb-2 group">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-30" />
          <div className="relative w-full h-full rounded-full bg-emerald-500/10 border-2 border-emerald-400/40 p-2 flex items-center justify-center shadow-[0_0_25px_rgba(34,197,94,0.3)]">
            <Image
              src="/mascot.svg"
              alt="Nomster Waiting"
              width={76}
              height={76}
              className="object-contain animate-bounce"
            />
          </div>
        </div>

        {/* Arcade Lock Marquee */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 mb-1">
            <Lock className="w-3 h-3 text-amber-400" />
            <span>AUTHENTICATION REQUIRED</span>
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">
            Feed Nomster
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Sign in with <strong>Phantom</strong>, <strong>MetaMask</strong>, or <strong>Google</strong> to enter the arcade.
          </p>
        </div>

        {/* Strict Rules Quick Bulletins */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-left space-y-2 text-[11px] text-slate-300 font-mono">
          <div className="flex items-center gap-2">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
            <span><strong>5 Lives (Max 10):</strong> Winged heart candies drop every 2 min!</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span><strong>FUD Hazard:</strong> Dodge red crypto spikes.</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-solana-green shrink-0" />
            <span><strong>High Scores:</strong> Auto-celebrated on The NomWall!</span>
          </div>
        </div>

        {/* Login Button */}
        <div className="pt-1">
          <button
            onClick={openAuthModal}
            className="w-full py-3 px-6 rounded-xl font-black text-sm bg-gradient-to-r from-emerald-400 via-teal-300 to-solana-green text-slate-950 shadow-[0_0_25px_rgba(20,241,149,0.4)] hover:shadow-[0_0_35px_rgba(20,241,149,0.7)] hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <Wallet className="w-4 h-4 text-slate-950" />
            <span>Connect Wallet / Sign In</span>
          </button>
        </div>
      </div>
    </div>
  );
};
