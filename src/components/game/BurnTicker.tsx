"use client";

import React, { useState, useEffect } from "react";
import { Flame, Trophy, Coins, Sparkles, TrendingUp } from "lucide-react";
import { getCommunityFeed, CommunityFeedItem } from "@/lib/burnFeedStorage";
import { getTotalNomBurned } from "@/lib/arcadeVault";

export const BurnTicker: React.FC = () => {
  const [items, setItems] = useState<CommunityFeedItem[]>([]);
  const [totalBurned, setTotalBurned] = useState<number>(42850);

  useEffect(() => {
    const update = () => {
      setItems(getCommunityFeed().slice(0, 10));
      setTotalBurned(getTotalNomBurned());
    };
    update();

    window.addEventListener("NOM_COMMUNITY_FEED_UPDATE", update);
    window.addEventListener("NOM_BURN_UPDATE", update);
    return () => {
      window.removeEventListener("NOM_COMMUNITY_FEED_UPDATE", update);
      window.removeEventListener("NOM_BURN_UPDATE", update);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-rose-950/30 to-slate-950 border border-rose-500/30 shadow-lg py-2 px-3 font-mono text-xs select-none">
      <div className="flex items-center gap-2">
        {/* Ticker Fixed Header Tag */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold shrink-0 shadow-sm animate-pulse">
          <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-400 shrink-0" />
          <span className="text-[10px] tracking-wider uppercase">DEFLATION TICKER</span>
        </div>

        {/* Total Burn Counter Pill */}
        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 shrink-0">
          <span className="text-slate-500">Cumulative:</span>
          <strong className="text-rose-400 font-black">{totalBurned.toLocaleString()} $NOM</strong>
        </div>

        {/* Scrolling Items Ribbon */}
        <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-4 py-0.5">
          {items.map((item) => {
            const isWin = item.type === "bounty_win";
            const isRoyalty = item.type === "creator_royalty";

            return (
              <div
                key={item.id}
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg shrink-0 transition-colors ${
                  isWin
                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                    : isRoyalty
                    ? "bg-amber-500/15 border border-amber-500/30 text-amber-300"
                    : "bg-slate-900/80 border border-slate-800 text-slate-300"
                }`}
              >
                {isWin ? (
                  <Trophy className="w-3 h-3 text-emerald-400 shrink-0" />
                ) : isRoyalty ? (
                  <Coins className="w-3 h-3 text-amber-400 shrink-0" />
                ) : (
                  <Flame className="w-3 h-3 text-rose-400 shrink-0" />
                )}

                <span className="font-bold text-white text-[11px] truncate max-w-[100px] sm:max-w-none">
                  {item.playerName}
                </span>

                {isWin ? (
                  <span className="text-[11px] text-emerald-400 font-black">
                    won +{item.amountNom.toLocaleString()} $NOM
                  </span>
                ) : isRoyalty ? (
                  <span className="text-[11px] text-amber-400 font-black">
                    +{item.amountNom.toLocaleString()} royalty
                  </span>
                ) : (
                  <span className="text-[11px] text-rose-400 font-bold">
                    burned {item.burnedNom || Math.max(1, Math.round(item.amountNom * 0.01))} $NOM 🔥
                  </span>
                )}

                {item.roomTitle && (
                  <span className="text-[10px] text-slate-400 hidden md:inline truncate max-w-[120px]">
                    ({item.roomTitle})
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
