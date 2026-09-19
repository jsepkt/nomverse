"use client";

import React, { useState, useEffect } from "react";
import { Portal } from "../ui/Portal";
import {
  DAILY_REWARDS_SCHEDULE,
  canClaimToday,
  claimDailyReward,
  DayReward,
} from "@/lib/dailyRewards";
import { sounds } from "../audio/soundEffects";
import confetti from "canvas-confetti";
import {
  Gift,
  Heart,
  Sparkles,
  Flame,
  Clock,
  CheckCircle2,
  Lock,
  X,
  Shield,
  Coins,
  Crown,
} from "lucide-react";
import { TOKEN_CONFIG } from "@/config/token";

interface DailyLootboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimLives?: (lives: number) => void;
  onClaimCandies?: (candies: number) => void;
}

export const DailyLootboxModal: React.FC<DailyLootboxModalProps> = ({
  isOpen,
  onClose,
  onClaimLives,
  onClaimCandies,
}) => {
  const [claimStatus, setClaimStatus] = useState(canClaimToday());
  const [countdownText, setCountdownText] = useState<string>("");
  const [claimedReward, setClaimedReward] = useState<{
    reward: DayReward;
    actualCandies: number;
    actualLives: number;
    isHolderDouble: boolean;
    streak: number;
  } | null>(null);

  // Sync claim status whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setClaimStatus(canClaimToday());
    }
  }, [isOpen]);

  // Countdown timer when already claimed
  useEffect(() => {
    if (!isOpen || claimStatus.canClaim || claimStatus.nextAvailableInMs <= 0) return;

    const interval = setInterval(() => {
      const updated = canClaimToday();
      setClaimStatus(updated);

      if (updated.nextAvailableInMs <= 0) {
        setCountdownText("Ready to Claim!");
        clearInterval(interval);
      } else {
        const hours = Math.floor(updated.nextAvailableInMs / (1000 * 60 * 60));
        const minutes = Math.floor((updated.nextAvailableInMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((updated.nextAvailableInMs % (1000 * 60)) / 1000);
        setCountdownText(
          `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
            seconds
          ).padStart(2, "0")}`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, claimStatus.canClaim, claimStatus.nextAvailableInMs]);

  if (!isOpen) return null;

  const handleClaim = () => {
    const result = claimDailyReward();
    if (result.success) {
      setClaimedReward({
        reward: result.reward,
        actualCandies: result.actualCandies,
        actualLives: result.actualLives,
        isHolderDouble: result.isHolderDouble,
        streak: result.newStreak,
      });

      // Play audio & particles
      sounds.playGoldenChime();
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#14F195", "#9945FF", "#F59E0B", "#38BDF8"],
      });

      if (onClaimLives && result.actualLives > 0) {
        onClaimLives(result.actualLives);
      }
      if (onClaimCandies && result.actualCandies > 0) {
        onClaimCandies(result.actualCandies);
      }

      setClaimStatus(canClaimToday());
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-amber-500/40 shadow-[0_0_60px_rgba(245,158,11,0.25)] p-5 sm:p-7 max-h-[90vh] overflow-y-auto text-center text-white">
          {/* Ambient Glows */}
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-solana-purple/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="space-y-1 mb-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Gift className="w-3.5 h-3.5" />
              <span>DAILY ARCADE STREAK</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Mystery Lootbox Crate
            </h2>
            <p className="text-xs text-slate-400">
              Log in daily to claim free lives, candies & perks. Keep your streak alive!
            </p>
          </div>

          {/* Holder 2x Perk Banner */}
          <div className="mb-5 p-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-amber-500/10 to-purple-500/10 border border-emerald-500/25 flex items-center justify-between text-left text-xs font-mono">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                2x
              </div>
              <div>
                <div className="font-bold text-white">Hold 100k+ $NOM: 2X Rewards</div>
                <div className="text-[10px] text-slate-400">Double candies, extra lives & streak shield</div>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${claimStatus.isHolderDouble ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-slate-800 text-slate-400"}`}>
              {claimStatus.isHolderDouble ? "ACTIVE ✓" : "STANDARD"}
            </span>
          </div>

          {/* 7-Day Streak Timeline Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-6">
            {DAILY_REWARDS_SCHEDULE.map((item) => {
              const isPast = item.day < claimStatus.effectiveDay;
              const isCurrent = item.day === claimStatus.effectiveDay;
              const isFuture = item.day > claimStatus.effectiveDay;

              return (
                <div
                  key={item.day}
                  className={`relative p-2 rounded-xl flex flex-col items-center justify-between border transition-all ${
                    isCurrent
                      ? "bg-amber-500/20 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.35)] scale-105"
                      : isPast
                      ? "bg-slate-950/80 border-slate-800 text-slate-500 opacity-60"
                      : "bg-slate-950/50 border-slate-800/80 text-slate-400"
                  }`}
                >
                  <div className="text-[9px] font-mono font-bold">D{item.day}</div>
                  <div className="my-1 text-base sm:text-lg">
                    {item.day === 7 ? "👑" : item.powerUp ? "⚡" : "🍬"}
                  </div>
                  <div className="text-[8px] font-mono font-bold text-amber-300">
                    +{item.candies}
                  </div>
                  {isPast && (
                    <div className="absolute inset-0 bg-slate-950/60 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                  )}
                  {isFuture && (
                    <div className="absolute top-1 right-1">
                      <Lock className="w-2.5 h-2.5 text-slate-600" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Main Action Area */}
          {claimedReward ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 mb-3 animate-in zoom-in-95">
              <div className="text-sm font-mono font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>CRATE UNLOCKED!</span>
              </div>
              <div className="text-xl font-black text-white">
                +{claimedReward.actualCandies} Candies & +{claimedReward.actualLives} Lives
              </div>
              <p className="text-xs text-slate-300">
                {claimedReward.isHolderDouble && "🐋 Whale Boost Applied: 2X Multiplier Awarded!"}
              </p>
              <button
                onClick={onClose}
                className="w-full mt-2 py-3 rounded-xl bg-emerald-500 text-slate-950 font-black font-mono text-xs hover:bg-emerald-400 transition-all cursor-pointer"
              >
                RETURN TO ARCADE
              </button>
            </div>
          ) : claimStatus.canClaim ? (
            <button
              onClick={handleClaim}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black font-mono text-sm sm:text-base shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Gift className="w-5 h-5" />
              <span>OPEN DAY {claimStatus.effectiveDay} CRATE</span>
              <Sparkles className="w-4 h-4" />
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-center">
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Next Mystery Crate Unlocks In:</span>
              </div>
              <div className="text-2xl font-black font-mono text-amber-400 tracking-wider">
                {countdownText || "Calculating..."}
              </div>
              <p className="text-[11px] text-slate-500">
                Come back tomorrow to keep your streak going!
              </p>
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
};
