"use client";

import React, { useState, useEffect } from "react";
import { TOKEN_CONFIG } from "@/config/token";
import { ExternalLink, Flame, X, Sparkles, TrendingUp } from "lucide-react";
import { sounds } from "../audio/soundEffects";

interface WhaleAlertToastProps {
  onTriggerFrenzy?: () => void;
}

interface WhaleEvent {
  id: string;
  solAmount: number;
  usdValue: number;
  buyer: string;
  timestamp: number;
  bondingPercent: number;
}

export const WhaleAlertToast: React.FC<WhaleAlertToastProps> = ({ onTriggerFrenzy }) => {
  const [currentEvent, setCurrentEvent] = useState<WhaleEvent | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  // Periodic whale activity simulator / live market alert
  useEffect(() => {
    // Show initial welcome/frenzy alert after 5 seconds
    const initialTimer = setTimeout(() => {
      spawnWhaleAlert(1.85, 4.2);
    }, 5000);

    // Then spawn alerts periodically every 45 seconds
    const interval = setInterval(() => {
      const randomSol = +(Math.random() * 3 + 0.4).toFixed(2);
      const randomBonding = +(Math.random() * 1.5 + 4.1).toFixed(1);
      spawnWhaleAlert(randomSol, randomBonding);
    }, 45000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  const spawnWhaleAlert = (sol: number, bonding: number) => {
    const fakeBuyer = `${Math.random().toString(36).substring(2, 6)}...${Math.random()
      .toString(36)
      .substring(2, 6)}`;
    const usd = Math.round(sol * 165);

    setCurrentEvent({
      id: String(Date.now()),
      solAmount: sol,
      usdValue: usd,
      buyer: fakeBuyer,
      timestamp: Date.now(),
      bondingPercent: bonding,
    });
    setIsVisible(true);

    // Auto trigger in-game frenzy if sol buy is >= 1.0 SOL
    if (sol >= 1.0 && onTriggerFrenzy) {
      onTriggerFrenzy();
      sounds.playGoldenChime();
    }

    // Auto dismiss after 9 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 9000);
  };

  if (!isVisible || !currentEvent) return null;

  return (
    <aside
      aria-label="Live Token Transaction Alerts"
      className="fixed bottom-4 left-4 z-40 max-w-[340px] w-full animate-in slide-in-from-bottom-4 duration-300 pointer-events-auto"
    >
      <div className="relative rounded-2xl border border-emerald-500/40 bg-slate-950/95 p-3.5 shadow-[0_0_30px_rgba(16,185,129,0.25)] backdrop-blur-md">
        {/* Dismiss Button */}
        <button
          onClick={() => setIsVisible(false)}
          aria-label="Dismiss alert"
          className="absolute top-2.5 right-2.5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Top Header */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            PUMP.FUN WHALE APE!
          </span>
          <span className="text-[10px] font-mono text-slate-400 ml-auto mr-5">just now</span>
        </div>

        {/* Amount Description */}
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <span className="text-base font-black font-mono text-white">
              +{currentEvent.solAmount} SOL
            </span>
            <span className="text-xs font-mono text-slate-400 ml-1.5">
              (~${currentEvent.usdValue.toLocaleString()})
            </span>
          </div>
          <div className="text-[11px] font-mono font-semibold text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            <Flame className="w-3 h-3 text-amber-400" />
            <span>{currentEvent.bondingPercent}% Curve</span>
          </div>
        </div>

        {/* In-Game Frenzy Notice */}
        <div className="text-[10px] font-mono text-emerald-300/90 bg-emerald-950/40 rounded-lg p-1.5 border border-emerald-500/20 mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
          <span>Golden Frenzy 2X Candies triggered in Arcade!</span>
        </div>

        {/* Action Button to pump.fun */}
        <a
          href={TOKEN_CONFIG.pumpFunUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(20,241,149,0.3)] transition-all"
        >
          <span>APE IN ON PUMP.FUN</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </aside>
  );
};
