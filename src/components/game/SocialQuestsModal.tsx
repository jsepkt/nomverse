"use client";

import React, { useState, useEffect } from "react";
import { Portal } from "../ui/Portal";
import {
  X,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Gift,
  Heart,
  Send,
  Share2,
  Award,
  Zap,
  Star,
} from "lucide-react";
import { TOKEN_CONFIG } from "@/config/token";
import { sounds } from "../audio/soundEffects";
import confetti from "canvas-confetti";

interface SocialQuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed?: (type: "lives" | "candies" | "xp", amount: number) => void;
}

interface Quest {
  id: string;
  title: string;
  desc: string;
  rewardText: string;
  rewardType: "lives" | "candies" | "xp";
  rewardAmount: number;
  actionUrl: string;
  actionLabel: string;
  icon: any;
  color: string;
}

const QUESTS: Quest[] = [
  {
    id: "quest_follow_x",
    title: "Follow @NomverseSol on X",
    desc: "Stay updated on live arcade raids, tournaments, and token burns.",
    rewardText: "+3 Free Hearts & +250 XP",
    rewardType: "lives",
    rewardAmount: 3,
    actionUrl: TOKEN_CONFIG.twitterUrl,
    actionLabel: "Follow on X",
    icon: Share2,
    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  },
  {
    id: "quest_join_tg",
    title: "Join Official Telegram Community",
    desc: "Hang out with 1,200+ Nomsters, chat with builders, and coordinate raids.",
    rewardText: "+5 Free Hearts & Ninja Skin",
    rewardType: "lives",
    rewardAmount: 5,
    actionUrl: TOKEN_CONFIG.telegramUrl,
    actionLabel: "Join Telegram",
    icon: Send,
    color: "text-sky-400 bg-sky-500/10 border-sky-500/30",
  },
  {
    id: "quest_tweet_flex",
    title: "Flex Arcade Score with #NOM",
    desc: "Post your score or flex card to Twitter with hashtag #NOM & #Solana.",
    rewardText: "+1,000 $NOM Credits",
    rewardType: "candies",
    rewardAmount: 1000,
    actionUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `🎮 Just played @NomverseSol Arcade! 100% CC0 public domain game on Solana with 1% auto-burn. Play free in browser: https://nomverse.org/play $NOM #Solana #pumpfun`
    )}`,
    actionLabel: "Tweet with #NOM",
    icon: Sparkles,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
  {
    id: "quest_github_star",
    title: "Star NomVerse on GitHub",
    desc: "Support open-source Web3 gaming by starring our public repository.",
    rewardText: "+500 Contributor XP",
    rewardType: "xp",
    rewardAmount: 500,
    actionUrl: TOKEN_CONFIG.githubUrl,
    actionLabel: "Star on GitHub",
    icon: Star,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  },
  {
    id: "quest_dexscreener",
    title: "Watchlist $NOM on DexScreener",
    desc: "Add $NOM to your DexScreener watchlist and drop a live rocket reaction.",
    rewardText: "+500 $NOM Credits",
    rewardType: "candies",
    rewardAmount: 500,
    actionUrl: TOKEN_CONFIG.dexScreenerUrl,
    actionLabel: "View on DexScreener",
    icon: Zap,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
];

const STORAGE_KEY = "nomverse_completed_quests_v1";

export const SocialQuestsModal: React.FC<SocialQuestsModalProps> = ({
  isOpen,
  onClose,
  onRewardClaimed,
}) => {
  const [completedQuests, setCompletedQuests] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCompletedQuests(JSON.parse(raw));
    } catch {}
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCompleteQuest = (quest: Quest) => {
    sounds.playGoldenChime();
    window.open(quest.actionUrl, "_blank");

    const updated = { ...completedQuests, [quest.id]: true };
    setCompletedQuests(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.5 },
      colors: ["#14F195", "#9945FF", "#F59E0B"],
    });

    if (onRewardClaimed) {
      onRewardClaimed(quest.rewardType, quest.rewardAmount);
    }
  };

  const completedCount = Object.keys(completedQuests).length;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
        <div className="relative w-full max-w-lg rounded-3xl bg-slate-950 border border-emerald-500/40 shadow-2xl p-5 sm:p-6 text-white max-h-[90vh] overflow-y-auto">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">Viral Quests &amp; Airdrop Faucet</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  {completedCount}/{QUESTS.length} Done
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Complete quick social tasks to earn instant free lives, $NOM credits &amp; XP.
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4 space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>Quest Progress</span>
              <span className="text-emerald-400 font-bold">{Math.round((completedCount / QUESTS.length) * 100)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-solana-green transition-all duration-300"
                style={{ width: `${(completedCount / QUESTS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Quests List */}
          <div className="space-y-2.5">
            {QUESTS.map((q) => {
              const isDone = completedQuests[q.id];
              const Icon = q.icon;
              return (
                <div
                  key={q.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isDone
                      ? "bg-slate-900/40 border-slate-800/80 opacity-75"
                      : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${q.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate">{q.title}</h4>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold shrink-0">
                          {q.rewardText}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{q.desc}</p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isDone ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Claimed</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleCompleteQuest(q)}
                        className="px-3 py-1.5 rounded-xl font-bold font-mono text-xs bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        <span>{q.actionLabel}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer CTA */}
          <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>More weekly quests unlocking in Season 1!</span>
            <button
              onClick={onClose}
              className="text-emerald-400 hover:underline cursor-pointer font-bold"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};
