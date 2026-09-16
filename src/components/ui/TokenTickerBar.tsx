"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, Rocket, Flame, Sparkles, ExternalLink } from "lucide-react";
import { TOKEN_CONFIG } from "@/config/token";

interface TokenStats {
  priceUsd: number;
  marketCapUsd: number;
  volume24hUsd: number;
  priceChange24h: number;
  bondingProgressPercent: number;
  isRaydiumMigrated: boolean;
}

export const TokenTickerBar: React.FC = () => {
  const [stats, setStats] = useState<TokenStats>({
    priceUsd: 0.0000028,
    marketCapUsd: 2800,
    volume24hUsd: 40,
    priceChange24h: 2.0,
    bondingProgressPercent: 4.1,
    isRaydiumMigrated: false,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchStats() {
      try {
        const res = await fetch("/api/token-stats");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setStats(data);
            setIsLoading(false);
          }
        }
      } catch {
        // keep existing
      }
    }

    fetchStats();
    const interval = setInterval(fetchStats, 20_000); // 20s live polling
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const formattedPrice =
    stats.priceUsd < 0.0001
      ? `$${stats.priceUsd.toFixed(7)}`
      : `$${stats.priceUsd.toFixed(4)}`;

  const isPositive = stats.priceChange24h >= 0;

  return (
    <div className="w-full bg-[#070b16] border-b border-emerald-500/20 px-3 py-1.5 overflow-x-auto select-none no-scrollbar">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs font-mono">
        {/* Left: Token ID & Live Indicator */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-white tracking-wider flex items-center gap-1">
              <span>$NOM</span>
              <span className="text-[10px] text-slate-400 font-normal">ON PUMP.FUN</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-300">
            <span className="text-slate-400 text-[11px]">PRICE:</span>
            <span className="font-bold text-emerald-400">{formattedPrice}</span>
          </div>

          <div
            className={`hidden sm:flex items-center gap-1 font-bold ${
              isPositive ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            <span>{isPositive ? "▲" : "▼"}</span>
            <span>{Math.abs(stats.priceChange24h).toFixed(1)}%</span>
          </div>
        </div>

        {/* Center: Bonding Curve Progress Towards Raydium */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          <span className="text-slate-400 text-[11px] uppercase">
            BONDING PROGRESS:
          </span>
          <div className="w-28 sm:w-36 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-solana-green transition-all duration-500 rounded-full"
              style={{ width: `${Math.max(4, stats.bondingProgressPercent)}%` }}
            />
          </div>
          <span className="font-bold text-solana-green text-[11px]">
            {stats.bondingProgressPercent}%
          </span>
          <span className="text-[10px] text-slate-500">
            (MCap: ${stats.marketCapUsd.toLocaleString()} / $69k)
          </span>
        </div>

        {/* Right: Quick Trade Action */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-1 text-slate-400 text-[11px]">
            <span>VOL:</span>
            <span className="text-slate-200 font-bold">
              ${stats.volume24hUsd.toLocaleString()}
            </span>
          </div>

          <a
            href={TOKEN_CONFIG.pumpFunUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 hover:text-white font-bold text-[11px] transition-all"
          >
            <Rocket className="w-3.5 h-3.5 text-emerald-400" />
            <span>TRADE ON PUMP.FUN</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>
    </div>
  );
};
