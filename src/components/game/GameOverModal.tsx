"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { claimTriviaEmergencyLife, COOLDOWN_DURATION_MS } from "@/lib/lifeSystem";
import { sounds } from "../audio/soundEffects";
import {
  Clock,
  Heart,
  MessageSquare,
  Gift,
  HelpCircle,
  Copy,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RotateCcw,
  Swords,
  ExternalLink,
  Wallet,
  Coins,
} from "lucide-react";
import { SkinId } from "@/lib/skins";
import { TOKEN_CONFIG } from "@/config/token";
import { ShareableScoreCard } from "./ShareableScoreCard";
import { copyToClipboard } from "@/lib/clipboard";

interface GameOverModalProps {
  score: number;
  streak?: number;
  equippedSkin?: SkinId;
  cooldownUntil: number | null;
  onRequestSOS: () => Promise<boolean>;
  onLifeRestored: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  streak = 0,
  equippedSkin = "default",
  cooldownUntil,
  onRequestSOS,
  onLifeRestored,
}) => {
  const { user, openAuthModal } = useAuth();
  const [timeLeft, setTimeLeft] = useState<string>("03:00:00");
  const [isRequestingSOS, setIsRequestingSOS] = useState<boolean>(false);
  const [sosSent, setSosSent] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedChallenge, setCopiedChallenge] = useState<boolean>(false);
  const [copiedBeacon, setCopiedBeacon] = useState<boolean>(false);

  // Trivia state
  const [showTrivia, setShowTrivia] = useState<boolean>(false);
  const [triviaResult, setTriviaResult] = useState<string | null>(null);
  const [triviaSelected, setTriviaSelected] = useState<number | null>(null);

  // Ticking countdown effect
  useEffect(() => {
    if (!cooldownUntil) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = cooldownUntil - now;

      if (diff <= 0) {
        setTimeLeft("00:00:00");
        clearInterval(interval);
        onLifeRestored();
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft(
          `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
            seconds
          ).padStart(2, "0")}`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownUntil, onLifeRestored]);

  const handleBroadcastSOS = async () => {
    if (!user) {
      openAuthModal();
      return;
    }
    setIsRequestingSOS(true);
    const success = await onRequestSOS();
    setIsRequestingSOS(false);
    if (success) {
      setSosSent(true);
    }
  };

  const handleCopyGiftLink = async () => {
    const url = `${window.location.origin}/#wall`;
    await copyToClipboard(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyChallengeLink = async () => {
    const challengerName = user?.name || "ArcadeChampion";
    const url = `${window.location.origin}/?rivalScore=${score}&challenger=${encodeURIComponent(
      challengerName
    )}`;
    await copyToClipboard(url);
    setCopiedChallenge(true);
    sounds.playGoldenChime();
    setTimeout(() => setCopiedChallenge(false), 2500);
  };

  const getBeaconId = () => {
    if (user?.id) return user.id;
    if (typeof window !== "undefined") {
      let guestId = localStorage.getItem("nomverse_guest_id");
      if (!guestId) {
        guestId = "guest_" + Math.random().toString(36).slice(2, 9);
        localStorage.setItem("nomverse_guest_id", guestId);
      }
      return guestId;
    }
    return "player";
  };

  const handleCopyBeaconLink = async () => {
    const id = getBeaconId();
    const beaconUrl = `${window.location.origin}/play?beacon=${id}`;
    await copyToClipboard(beaconUrl);
    setCopiedBeacon(true);
    sounds.playGoldenChime();
    setTimeout(() => setCopiedBeacon(false), 2500);
  };

  const handleShareTelegram = () => {
    const id = getBeaconId();
    const beaconUrl = `${window.location.origin}/play?beacon=${id}`;
    const text = `🚨 RESCUE MISSION: My Nomster is out of lives on NomVerse! Tap to feed him 1 candy to revive me — you will get 5 FREE lives too!`;
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(beaconUrl)}&text=${encodeURIComponent(text)}`;
    if (typeof window !== "undefined") {
      const tg = (window as unknown as { Telegram?: { WebApp?: { openTelegramLink?: (url: string) => void } } }).Telegram?.WebApp;
      if (tg?.openTelegramLink) {
        tg.openTelegramLink(tgUrl);
      } else {
        window.open(tgUrl, "_blank");
      }
    }
  };

  const handleShareWhatsApp = () => {
    const id = getBeaconId();
    const beaconUrl = `${window.location.origin}/play?beacon=${id}`;
    const text = `🚨 RESCUE MISSION: My Nomster is out of lives on NomVerse! Tap to feed him 1 candy to revive me — you will get 5 FREE lives too! ${beaconUrl}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    if (typeof window !== "undefined") {
      window.open(waUrl, "_blank");
    }
  };

  const handleTriviaAnswer = (index: number) => {
    setTriviaSelected(index);

    // Option 1 (index 1) is correct: CC0 1.0 Universal
    if (index === 1) {
      if (!user) {
        sounds.playGiftReceived();
        setTriviaResult("🎉 CORRECT! +1 CC0 Emergency Heart awarded! Nomster is back!");
        setTimeout(() => {
          onLifeRestored();
        }, 1200);
        return;
      }
      const res = claimTriviaEmergencyLife(user.id);
      if (res.success) {
        sounds.playGiftReceived();
        setTriviaResult("🎉 CORRECT! +1 CC0 Emergency Heart awarded! Nomster is back!");
        setTimeout(() => {
          onLifeRestored();
        }, 1500);
      } else {
        setTriviaResult(res.message || "Already claimed today.");
      }
    } else {
      setTriviaResult("❌ Incorrect! Hint: Nomster has zero copyright and is 100% public domain.");
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md text-center animate-fade-in select-none">
      <div className="relative w-full max-w-sm bg-surface border border-rose-500/30 rounded-2xl p-6 shadow-[0_0_50px_rgba(244,63,94,0.2)] space-y-4">
        {/* Starving Nomster Avatar */}
        <div className="relative w-20 h-20 mx-auto">
          <div className="relative w-full h-full rounded-full bg-rose-500/10 border-2 border-rose-500/40 p-2 flex items-center justify-center">
            <Image
              src="/mascot.svg"
              alt="Starving Nomster"
              width={64}
              height={64}
              className="object-contain opacity-70 grayscale-[40%]"
            />
          </div>
          <span className="absolute -top-1 -right-1 text-base animate-bounce">💤</span>
        </div>

        {/* Title & Final Score */}
        <div className="space-y-1">
          <h3 className="text-xl font-black text-rose-400 tracking-tight flex items-center justify-center gap-1.5">
            <span>OUT OF LIVES!</span>
          </h3>
          <p className="text-xs text-slate-300">
            Nomster is starving after eating <strong>{score}</strong> candies!
          </p>
        </div>

        {/* Guest Conversion Banner: Prompt to Save High Score */}
        {!user && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-solana-green/15 border border-emerald-500/30 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>SAVE YOUR {score} NOM RECORD!</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-tight">
              Sign in with Phantom, MetaMask, or Google to save to the Global Leaderboard &amp; NomWall!
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={openAuthModal}
                className="flex-1 py-2 px-3 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-400 to-solana-green text-slate-950 shadow-[0_0_15px_rgba(20,241,149,0.3)] hover:scale-105 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Wallet className="w-3.5 h-3.5 text-slate-950" />
                <span>Save Record</span>
              </button>
              <button
                onClick={onLifeRestored}
                className="py-2 px-3 rounded-xl font-mono text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                title="Play another round as guest"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Play Again</span>
              </button>
            </div>
          </div>
        )}

        {/* 3-Hour Countdown Clock Display */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-slate-400">
            <Clock className="w-3.5 h-3.5 text-rose-400 animate-spin" />
            <span>HEART RECHARGE COOLDOWN:</span>
          </div>
          <div className="text-3xl font-black font-mono tracking-widest text-rose-400">
            {timeLeft}
          </div>
          <p className="text-[10px] text-slate-500">
            Full refill in 3 hours, OR ask the community for a life gift below!
          </p>
        </div>

        {/* Community Life SOS Actions */}
        <div className="space-y-2.5">
          {/* Action 0: P2P Viral Revival Beacon (K > 1 Viral Flywheel) */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-pink-500/15 border border-pink-500/40 text-left space-y-2 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-pink-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>P2P REVIVAL BEACON (GET 5 LIVES)</span>
              </span>
              <span className="text-[9px] font-mono text-pink-400/90 bg-pink-500/20 px-1.5 py-0.5 rounded border border-pink-500/30 font-bold">
                FREE +5
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-tight">
              Share your beacon link. When anyone feeds Nomster 1 candy, <strong>BOTH of you get 5 free lives</strong> instantly!
            </p>
            <div className="flex items-center gap-1.5 pt-1">
              <button
                onClick={handleCopyBeaconLink}
                className="flex-1 py-2 px-2.5 rounded-xl font-mono text-xs font-bold bg-pink-600 hover:bg-pink-500 text-white shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                {copiedBeacon ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBeacon ? "Link Copied!" : "Copy Beacon"}</span>
              </button>
              <button
                onClick={handleShareTelegram}
                className="py-2 px-2.5 rounded-xl font-mono text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
                title="Share to Telegram Groups"
              >
                <span>📲 Telegram</span>
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="py-2 px-2.5 rounded-xl font-mono text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
                title="Share to WhatsApp"
              >
                <span>💬 WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Action 0b: Immortality Protocol (Direct Pump.fun Buy Conversion) */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-500/40 text-left space-y-2 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>IMMORTALITY: HOLD $NOM</span>
              </span>
              <span className="text-[9px] font-mono text-amber-400/90 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30 font-bold">
                AUTO-REVIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-tight">
              Tired of cooldowns? Holding 100k+ $NOM on pump.fun unlocks permanent extra lives, 5-min fast life regen, and score multipliers!
            </p>
            <a
              href={TOKEN_CONFIG.pumpFunUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                sounds.playGiftReceived();
                onLifeRestored();
              }}
              className="w-full py-2.5 px-3 rounded-xl font-mono font-bold text-xs bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02] block text-center"
            >
              <span>🚀 BUY $NOM ON PUMP.FUN &amp; REVIVE</span>
              <ExternalLink className="w-3.5 h-3.5 inline-block" />
            </a>
          </div>

          {/* Action 1: Post SOS on NomWall */}
          <button
            onClick={handleBroadcastSOS}
            disabled={isRequestingSOS || sosSent}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>
              {sosSent
                ? "✓ SOS Posted to The NomWall!"
                : isRequestingSOS
                ? "Broadcasting..."
                : "📢 Request Life on The NomWall"}
            </span>
          </button>

          {/* Action 2: Daily CC0 Lore Trivia Faucet */}
          {!showTrivia ? (
            <button
              onClick={() => setShowTrivia(true)}
              className="w-full py-2 px-4 rounded-xl font-semibold text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Answer CC0 Trivia (+1 Free Heart)</span>
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/40 text-left space-y-2">
              <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                <HelpCircle className="w-3 h-3 text-solana-green" />
                <span>Daily CC0 Lore Trivia Question:</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-tight">
                What legal license protects Nomster&apos;s artwork, code, and franchise?
              </p>
              <div className="space-y-1">
                {[
                  "A) Strict Copyright (All Rights Reserved)",
                  "B) CC0 1.0 Universal (100% Public Domain)",
                  "C) 10% Trademark Royalty License",
                ].map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTriviaAnswer(idx)}
                    className={`w-full text-left p-1.5 rounded-lg text-[10px] font-mono transition-colors ${
                      triviaSelected === idx
                        ? "bg-emerald-500/30 text-white"
                        : "bg-slate-950 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {triviaResult && (
                <div className="text-[10px] font-mono text-emerald-400 pt-1">
                  {triviaResult}
                </div>
              )}
            </div>
          )}

          {/* Action 3: Copy Gift Link */}
          <button
            onClick={handleCopyGiftLink}
            className="w-full py-2 px-4 rounded-xl font-mono text-xs bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 transition-colors flex items-center justify-center gap-1.5"
          >
            {copiedLink ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Wall Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Share SOS Link with Friends</span>
              </>
            )}
          </button>

          {/* Action 4: Challenge a Rival Button */}
          <button
            onClick={handleCopyChallengeLink}
            className="w-full py-2.5 px-4 rounded-xl font-mono text-xs bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.15)] font-bold"
          >
            {copiedChallenge ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Rival Challenge Copied! Send to Group Chat</span>
              </>
            ) : (
              <>
                <Swords className="w-3.5 h-3.5 text-amber-400" />
                <span>⚔️ Challenge a Rival (Beat My {score} Pts)</span>
              </>
            )}
          </button>

          {/* Shareable Arcade Flex Card Generator */}
          <ShareableScoreCard
            score={score}
            streak={streak}
            equippedSkin={equippedSkin}
            userName={user?.name}
          />
        </div>
      </div>
    </div>
  );
};
