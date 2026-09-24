"use client";

import React, { useState } from "react";
import {
  X,
  PlusCircle,
  Trophy,
  Flame,
  Clock,
  Coins,
  ShieldCheck,
  Zap,
  Sparkles,
  Swords,
  Target,
} from "lucide-react";
import { createUgcRoom, ENTRY_FEE_PRESETS, UgcGameRoom } from "@/lib/gameRoomStorage";
import { getUserVault } from "@/lib/arcadeVault";
import { useAuth } from "@/context/AuthContext";
import { sounds } from "../audio/soundEffects";
import confetti from "canvas-confetti";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomCreated: (newRoom: UgcGameRoom) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onRoomCreated,
}) => {
  const { user } = useAuth();
  const userId = user?.id || "guest";
  const userName = user?.name || "Anonymous_Nommer";

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [gameMode, setGameMode] = useState<"candy_rush" | "survival_sprint" | "boss_attack">("candy_rush");
  const [entryFee, setEntryFee] = useState<number>(1000);
  const [customFee, setCustomFee] = useState<string>("");
  const [targetScore, setTargetScore] = useState<number>(350);
  const [timeLimit, setTimeLimit] = useState<number>(45);
  const [initialPrize, setInitialPrize] = useState<number>(5000);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeEntryFee = customFee ? parseInt(customFee, 10) || 0 : entryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please enter a challenge room title.");
      return;
    }
    if (activeEntryFee < 100) {
      setError("Minimum entry fee is 100 $NOM.");
      return;
    }
    if (targetScore < 50) {
      setError("Target score must be at least 50 candies.");
      return;
    }

    const res = createUgcRoom({
      title,
      description,
      creatorId: userId,
      creatorName: userName,
      creatorProvider: user?.provider,
      gameMode,
      entryFee: activeEntryFee,
      targetScore,
      timeLimitSeconds: timeLimit,
      initialPrizeDeposit: initialPrize,
    });

    if (res.success && res.room) {
      sounds.playGoldenChime();
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#14F195", "#9945FF", "#F59E0B"],
      });
      onRoomCreated(res.room);
      onClose();
    } else {
      setError(res.error || "Failed to create challenge room.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-950 border border-emerald-500/40 shadow-2xl p-5 sm:p-6 text-slate-100 max-h-[90vh] overflow-y-auto font-mono">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <span>Create Challenge Room</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                UGC Arena
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Set custom rules, entry fees, and earn a 9% creator royalty on every play!
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Challenge Title */}
          <div className="space-y-1">
            <label className="text-slate-300 font-bold block">Room Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Candy Dash 400: Solana Sprint"
              maxLength={60}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-slate-300 font-bold block">Description / Rules:</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Munch 400 candies in 45s without hitting blue bombs."
              maxLength={120}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* Game Mode Selector */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold block">Challenge Mode:</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "candy_rush", label: "Candy Rush", icon: Zap, color: "text-emerald-400" },
                { id: "survival_sprint", label: "Survival Sprint", icon: Target, color: "text-amber-400" },
                { id: "boss_attack", label: "Boss Raid", icon: Swords, color: "text-rose-400" },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setGameMode(m.id as any)}
                    className={`py-2 px-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      gameMode === m.id
                        ? "bg-slate-900 border-white text-white shadow-md scale-[1.02]"
                        : "bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${m.color}`} />
                    <span className="font-bold text-[11px]">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Entry Fee Preset Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-bold block">Entry Fee ($NOM):</label>
              <span className="text-emerald-400 font-bold">{activeEntryFee.toLocaleString()} $NOM</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {ENTRY_FEE_PRESETS.map((p) => (
                <button
                  key={p.amount}
                  type="button"
                  onClick={() => {
                    setEntryFee(p.amount);
                    setCustomFee("");
                  }}
                  className={`py-2 rounded-xl text-center border transition-all ${
                    entryFee === p.amount && !customFee
                      ? "bg-emerald-500 text-slate-950 font-black border-emerald-400 shadow-md"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
                  }`}
                >
                  <div className="text-[11px] font-bold">{p.amount}</div>
                  <div className="text-[8px] opacity-75">{p.badge}</div>
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <input
              type="number"
              placeholder="Or enter custom fee..."
              value={customFee}
              onChange={(e) => setCustomFee(e.target.value)}
              className="w-full mt-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white focus:outline-none focus:border-emerald-400 text-xs"
            />
          </div>

          {/* Target Score & Time Limit Slider */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Target Score:</span>
                <strong className="text-emerald-400">{targetScore} pts</strong>
              </div>
              <input
                type="range"
                min="100"
                max="800"
                step="25"
                value={targetScore}
                onChange={(e) => setTargetScore(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Time Limit:</span>
                <strong className="text-amber-400">{timeLimit}s</strong>
              </div>
              <input
                type="range"
                min="20"
                max="90"
                step="5"
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value, 10))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Economic Split Breakdown */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border border-emerald-500/25 space-y-1.5 text-[11px]">
            <div className="font-bold text-white flex items-center gap-1.5 pb-1 border-b border-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Automated Revenue &amp; Burn Split per Player Entry:</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>🏆 90% to Challenge Winner Prize Pool:</span>
              <strong className="text-emerald-400">+{Math.round(activeEntryFee * 0.9).toLocaleString()} $NOM</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>🎨 9% Creator Royalty (Paid to YOU):</span>
              <strong className="text-amber-300">+{Math.round(activeEntryFee * 0.09).toLocaleString()} $NOM</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>🔥 1% Deflationary Auto-Burn:</span>
              <strong className="text-rose-400">-{Math.max(1, Math.round(activeEntryFee * 0.01)).toLocaleString()} $NOM</strong>
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-emerald-400 via-teal-300 to-solana-green text-slate-950 shadow-[0_0_20px_rgba(20,241,149,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>Publish Room &amp; Start Collecting Royalties</span>
          </button>
        </form>
      </div>
    </div>
  );
};
