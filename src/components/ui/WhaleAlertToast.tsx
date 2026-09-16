"use client";

import React, { useState, useEffect, useRef } from "react";
import { TOKEN_CONFIG } from "@/config/token";
import { ExternalLink, Flame, X, TrendingUp, Sparkles } from "lucide-react";
import { sounds } from "../audio/soundEffects";

interface WhaleAlertToastProps {
  onTriggerFrenzy?: () => void;
}

interface RealTokenStats {
  priceUsd: string;
  priceNative: string;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  bondingProgress: number;
  updatedAt: number;
}

export const WhaleAlertToast: React.FC<WhaleAlertToastProps> = ({ onTriggerFrenzy }) => {
  const [stats, setStats] = useState<RealTokenStats | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const prevVolumeRef = useRef<number>(0);

  // Poll real on-chain token stats from /api/token-stats every 25 seconds
  useEffect(() => {
    let isMounted = true;

    const fetchRealData = async () => {
      try {
        const res = await fetch("/api/token-stats");
        const data = await res.json();
        if (data.success && isMounted) {
          const currentStats: RealTokenStats = {
            priceUsd: data.priceUsd,
            priceNative: data.priceNative,
            marketCap: data.marketCap,
            volume24h: data.volume24h,
            priceChange24h: data.priceChange24h,
            bondingProgress: data.bondingProgress,
            updatedAt: Date.now(),
          };

          // Detect if real volume increased or curve moved
          if (prevVolumeRef.current > 0 && currentStats.volume24h > prevVolumeRef.current) {
            if (onTriggerFrenzy) {
              onTriggerFrenzy();
              sounds.playGoldenChime();
            }
          }
          prevVolumeRef.current = currentStats.volume24h;

          setStats(currentStats);
        }
      } catch (err) {
        // network hiccup silent
      }
    };

    fetchRealData();

    // Show initial alert after 4 seconds
    const showTimer = setTimeout(() => {
      if (isMounted) setIsVisible(true);
    }, 4000);

    const interval = setInterval(fetchRealData, 25000);

    return () => {
      isMounted = false;
      clearTimeout(showTimer);
      clearInterval(interval);
    };
  }, [onTriggerFrenzy]);

  if (!isVisible || !stats) return null;

  const raydiumTarget = 69000;
  const distanceToRaydium = Math.max(0, raydiumTarget - stats.marketCap);

  return (
    <aside
      aria-label="Live On-Chain pump.fun Stats"
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
            LIVE PUMP.FUN STATS
          </span>
          <span className="text-[10px] font-mono text-slate-400 ml-auto mr-5">DexScreener API</span>
        </div>

        {/* Real Price & Market Cap */}
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <span className="text-base font-black font-mono text-white">
              ${stats.priceUsd}
            </span>
            <span
              className={`text-xs font-mono ml-1.5 font-bold ${
                stats.priceChange24h >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {stats.priceChange24h >= 0 ? "+" : ""}
              {stats.priceChange24h.toFixed(1)}% (24h)
            </span>
          </div>
          <div className="text-[11px] font-mono font-semibold text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            <Flame className="w-3 h-3 text-amber-400" />
            <span>{stats.bondingProgress}% Curve</span>
          </div>
        </div>

        {/* Real Progress to Raydium $69k Target */}
        <div className="text-[10px] font-mono text-slate-300 bg-slate-900/80 rounded-lg p-2 border border-slate-800 mb-2.5 space-y-1">
          <div className="flex justify-between text-slate-400">
            <span>MCap: ${stats.marketCap.toLocaleString()}</span>
            <span>24h Vol: ${stats.volume24h.toLocaleString()}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, stats.bondingProgress)}%` }}
            />
          </div>
          <div className="text-[9px] text-emerald-400/90 text-right">
            ${distanceToRaydium.toLocaleString()} to Raydium graduation
          </div>
        </div>

        {/* Action Button to pump.fun */}
        <a
          href={TOKEN_CONFIG.pumpFunUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(20,241,149,0.3)] transition-all"
        >
          <span>TRADE ON PUMP.FUN</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </aside>
  );
};
