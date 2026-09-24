"use client";

import React, { useState, useEffect } from "react";
import {
  Flame,
  Trophy,
  Coins,
  Crown,
  Sparkles,
  Zap,
  TrendingUp,
  ShieldCheck,
  Award,
  ArrowUpRight,
  Clock,
  Filter,
} from "lucide-react";
import {
  getCommunityFeed,
  getTopBurners,
  getTopCreators,
  getTopWinners,
  CommunityFeedItem,
  LeaderboardEntry,
} from "@/lib/burnFeedStorage";
import {
  getTotalNomBurned,
  getUserVault,
  BURN_FEE_PERCENT,
  CREATOR_ROYALTY_PERCENT,
  PRIZE_POOL_PERCENT,
} from "@/lib/arcadeVault";
import { useAuth } from "@/context/AuthContext";

const TOTAL_SUPPLY_NOM = 1000000000; // 1 Billion Pump.fun Total Initial Supply

export const BurnHallOfFame: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || "guest";
  const userName = user?.name || "You";

  const [activeTab, setActiveTab] = useState<"burners" | "creators" | "winners" | "feed">("burners");
  const [feedFilter, setFeedFilter] = useState<"all" | "burn" | "bounty_win" | "creator_royalty">("all");

  const [totalBurned, setTotalBurned] = useState<number>(42850);
  const [feedItems, setFeedItems] = useState<CommunityFeedItem[]>([]);
  const [userStats, setUserStats] = useState({
    burned: 0,
    earned: 0,
    won: 0,
  });

  const [burners, setBurners] = useState<LeaderboardEntry[]>([]);
  const [creators, setCreators] = useState<LeaderboardEntry[]>([]);
  const [winners, setWinners] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const refreshData = () => {
      const burned = getTotalNomBurned();
      const vault = getUserVault(userId);
      const feed = getCommunityFeed();

      // Estimate user's burned tokens from total spent (1% of spent) + explicit burn transactions
      const estimatedUserBurn = Math.round(vault.totalSpent * 0.01);

      setTotalBurned(burned);
      setFeedItems(feed);
      setUserStats({
        burned: estimatedUserBurn,
        earned: vault.totalCreatorEarnings,
        won: vault.totalWon,
      });

      setBurners(getTopBurners(estimatedUserBurn, userName));
      setCreators(getTopCreators(vault.totalCreatorEarnings, userName));
      setWinners(getTopWinners(vault.totalWon, userName));
    };

    refreshData();

    window.addEventListener("NOM_COMMUNITY_FEED_UPDATE", refreshData);
    window.addEventListener("NOM_BURN_UPDATE", refreshData);
    window.addEventListener("NOM_VAULT_UPDATE", refreshData);

    return () => {
      window.removeEventListener("NOM_COMMUNITY_FEED_UPDATE", refreshData);
      window.removeEventListener("NOM_BURN_UPDATE", refreshData);
      window.removeEventListener("NOM_VAULT_UPDATE", refreshData);
    };
  }, [userId, userName]);

  const circulatingSupply = TOTAL_SUPPLY_NOM - totalBurned;
  const burnPercentage = (totalBurned / TOTAL_SUPPLY_NOM) * 100;

  const filteredFeed = feedItems.filter((item) => {
    if (feedFilter === "all") return true;
    if (feedFilter === "burn") return item.type === "burn" || item.type === "withdraw_burn";
    return item.type === feedFilter;
  });

  const formatTimeAgo = (timestamp: number) => {
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    return `${Math.floor(diffMin / 60)}h ago`;
  };

  return (
    <div className="space-y-6 font-mono">
      {/* GLOBAL DEFLATIONARY HERO DASHBOARD */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-slate-950 via-rose-950/40 to-slate-950 border-2 border-rose-500/40 shadow-2xl">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pb-5 border-b border-rose-500/20">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 mb-2">
              <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-400 animate-pulse" />
              <span>AUTOMATIC DEFLATION ENGINE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Community Burn Hall of Fame
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-sans mt-1 max-w-lg leading-relaxed">
              Every challenge entered and withdrawal burns 1% of $NOM forever. Explore top community incinerators, earning room creators, and live arcade activity.
            </p>
          </div>

          {/* Metric Counter Card */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-rose-500/40 shadow-xl min-w-[220px]">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Total $NOM Burned</span>
            <div className="text-2xl sm:text-3xl font-black text-rose-400 flex items-baseline gap-1 mt-0.5">
              <span>🔥 {totalBurned.toLocaleString()}</span>
              <span className="text-xs font-bold text-slate-400">$NOM</span>
            </div>
            <div className="text-[10px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Permanently Removed from Supply</span>
            </div>
          </div>
        </div>

        {/* Pump.fun Supply Reduction Progress Bar */}
        <div className="relative z-10 pt-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Pump.fun Supply: <strong className="text-white">1,000,000,000 $NOM</strong>
            </span>
            <span className="text-rose-400 font-bold">
              {burnPercentage.toFixed(5)}% Total Supply Reduced
            </span>
          </div>

          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5 relative">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-red-500 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(244,63,94,0.6)]"
              style={{ width: `${Math.max(1, Math.min(100, (totalBurned / 100000) * 100))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Circulating: <strong className="text-emerald-400">{circulatingSupply.toLocaleString()}</strong></span>
            <span>Fee Split: <strong className="text-white">90% Winner / 9% Creator / 1% Burn</strong></span>
          </div>
        </div>
      </div>

      {/* CATEGORY SELECTOR TABS */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800 overflow-x-auto">
        {[
          { id: "burners", label: "🔥 Top Burners", count: burners.length },
          { id: "creators", label: "👑 Top Creators", count: creators.length },
          { id: "winners", label: "🏆 Bounty Legends", count: winners.length },
          { id: "feed", label: "⚡ Live Stream Feed", count: feedItems.length },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "bg-slate-800 text-white border border-slate-700 shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/60"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                  isActive ? "bg-slate-700 text-emerald-300" : "bg-slate-900 text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: TOP BURNERS */}
      {activeTab === "burners" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>The biggest community contributors driving $NOM deflation through gameplay and burns:</span>
            <span className="text-rose-400 font-bold">1% Lowest Burn Fee Model</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {burners.map((burner) => {
              const isTop3 = burner.rank <= 3;
              return (
                <div
                  key={burner.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                    burner.isCurrentUser
                      ? "bg-emerald-950/30 border-emerald-500/60 shadow-[0_0_20px_rgba(20,241,149,0.15)]"
                      : isTop3
                      ? "bg-slate-950 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                      : "bg-slate-950/80 border-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                        burner.rank === 1
                          ? "bg-gradient-to-br from-amber-300 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/30"
                          : burner.rank === 2
                          ? "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950"
                          : burner.rank === 3
                          ? "bg-gradient-to-br from-amber-600 to-orange-700 text-white"
                          : "bg-slate-900 border border-slate-800 text-slate-400"
                      }`}
                    >
                      #{burner.rank}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-sm">{burner.name}</span>
                        {burner.isCurrentUser && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-black border border-emerald-500/40">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-amber-400/90 font-sans block">{burner.badge}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-black text-rose-400 flex items-center justify-end gap-1">
                      <Flame className="w-3.5 h-3.5 text-rose-400" />
                      <span>{burner.value.toLocaleString()}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase">$NOM Burned</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: TOP CREATORS */}
      {activeTab === "creators" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Room &amp; Meme Creators earning 9% passive royalties from community plays:</span>
            <span className="text-amber-400 font-bold">9% Creator Royalties</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {creators.map((creator) => {
              const isTop3 = creator.rank <= 3;
              return (
                <div
                  key={creator.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                    creator.isCurrentUser
                      ? "bg-emerald-950/30 border-emerald-500/60 shadow-[0_0_20px_rgba(20,241,149,0.15)]"
                      : isTop3
                      ? "bg-slate-950 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                      : "bg-slate-950/80 border-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                        creator.rank === 1
                          ? "bg-gradient-to-br from-amber-300 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/30"
                          : creator.rank === 2
                          ? "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950"
                          : creator.rank === 3
                          ? "bg-gradient-to-br from-amber-600 to-orange-700 text-white"
                          : "bg-slate-900 border border-slate-800 text-slate-400"
                      }`}
                    >
                      #{creator.rank}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-sm">{creator.name}</span>
                        {creator.isCurrentUser && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-black border border-emerald-500/40">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-sans block">
                        {creator.badge} • {creator.secondaryValue || 1} Rooms
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-black text-amber-300 flex items-center justify-end gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span>+{creator.value.toLocaleString()}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase">Royalties Earned</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: TOP WINNERS */}
      {activeTab === "winners" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>High-skilled players who smashed challenge room targets and claimed 90% bounties:</span>
            <span className="text-emerald-400 font-bold">90% Winner Prize Pot</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {winners.map((winner) => {
              const isTop3 = winner.rank <= 3;
              return (
                <div
                  key={winner.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                    winner.isCurrentUser
                      ? "bg-emerald-950/30 border-emerald-500/60 shadow-[0_0_20px_rgba(20,241,149,0.15)]"
                      : isTop3
                      ? "bg-slate-950 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                      : "bg-slate-950/80 border-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                        winner.rank === 1
                          ? "bg-gradient-to-br from-amber-300 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/30"
                          : winner.rank === 2
                          ? "bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950"
                          : winner.rank === 3
                          ? "bg-gradient-to-br from-amber-600 to-orange-700 text-white"
                          : "bg-slate-900 border border-slate-800 text-slate-400"
                      }`}
                    >
                      #{winner.rank}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-sm">{winner.name}</span>
                        {winner.isCurrentUser && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-black border border-emerald-500/40">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-emerald-400/90 font-sans block">{winner.badge}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-black text-emerald-400 flex items-center justify-end gap-1">
                      <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                      <span>+{winner.value.toLocaleString()}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase">Total Won</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: LIVE STREAM FEED */}
      {activeTab === "feed" && (
        <div className="space-y-4">
          {/* Feed Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: "all", label: "All Activity" },
              { id: "burn", label: "🔥 Burns Only" },
              { id: "bounty_win", label: "🏆 Bounties Won" },
              { id: "creator_royalty", label: "💰 Creator Royalties" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFeedFilter(f.id as typeof feedFilter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border cursor-pointer ${
                  feedFilter === f.id
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm"
                    : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Activity Stream List */}
          <div className="space-y-2.5">
            {filteredFeed.map((item) => {
              const isWin = item.type === "bounty_win";
              const isRoyalty = item.type === "creator_royalty";

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                    item.highlight
                      ? "bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 border-emerald-500/50 shadow-md"
                      : "bg-slate-950/80 border-slate-800/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isWin
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : isRoyalty
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {isWin ? (
                        <Trophy className="w-4 h-4" />
                      ) : isRoyalty ? (
                        <Coins className="w-4 h-4" />
                      ) : (
                        <Flame className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-xs sm:text-sm">{item.playerName}</span>
                        {isWin ? (
                          <span className="text-xs text-emerald-400 font-black">
                            smashed target &amp; won +{item.amountNom.toLocaleString()} $NOM!
                          </span>
                        ) : isRoyalty ? (
                          <span className="text-xs text-amber-400 font-bold">
                            earned +{item.amountNom.toLocaleString()} $NOM creator royalty
                          </span>
                        ) : (
                          <span className="text-xs text-rose-400 font-bold">
                            entered challenge (-{item.amountNom.toLocaleString()} $NOM) • {item.burnedNom || 10} burned 🔥
                          </span>
                        )}
                      </div>

                      {item.roomTitle && (
                        <span className="text-[11px] text-slate-400 font-sans block mt-0.5">
                          Room: &ldquo;{item.roomTitle}&rdquo;
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{formatTimeAgo(item.timestamp)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
