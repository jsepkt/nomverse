"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import {
  getClientLifeState,
  decrementClientLife,
  replenishClientLives,
  MAX_LIVES,
} from "@/lib/lifeSystem";
import { SkinId, getEquippedSkin, setEquippedSkin } from "@/lib/skins";
import { PowerUpType, POWER_UPS } from "@/lib/powerUps";
import { ArcadeLockscreen } from "./ArcadeLockscreen";
import { GameOverModal } from "./GameOverModal";
import { SkinSelector } from "./SkinSelector";
import { MobileWaddlePaddles } from "./MobileWaddlePaddles";
import { RaidBossBanner } from "./RaidBossBanner";
import { sounds } from "../audio/soundEffects";
import { Volume2, VolumeX, RotateCcw, Trophy, Sparkles, Heart, Flame, Shirt } from "lucide-react";
import confetti from "canvas-confetti";

const PhaserCanvasDynamic = dynamic(
  () => import("./PhaserCanvas").then((mod) => mod.PhaserCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-[440px] aspect-[440/520] mx-auto rounded-2xl border-2 border-emerald-500/20 bg-slate-950/70 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-emerald-400">LOADING ARCADE ENGINE...</p>
      </div>
    ),
  }
);

export const GameContainer: React.FC = () => {
  const { user } = useAuth();

  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(MAX_LIVES);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [resetSignal, setResetSignal] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [recentNom, setRecentNom] = useState<boolean>(false);
  const [hasPostedHighScore, setHasPostedHighScore] = useState<boolean>(false);

  // CC0 Cosmetics & Closet State
  const [equippedSkin, setEquippedSkinState] = useState<SkinId>("default");
  const [isSkinModalOpen, setIsSkinModalOpen] = useState<boolean>(false);

  // Active Power-Ups State
  const [activePowerUps, setActivePowerUps] = useState<PowerUpType[]>([]);

  // Mobile Paddle Controls
  const [waddleSignal, setWaddleSignal] = useState<{
    direction: "left" | "right";
    timestamp: number;
  } | null>(null);

  // Live community gift banner
  const [liveGiftAlert, setLiveGiftAlert] = useState<string | null>(null);

  // Synchronize life and skin state on user login
  useEffect(() => {
    if (!user) return;
    const lifeState = getClientLifeState(user.id);
    setLives(lifeState.lives);
    setCooldownUntil(lifeState.cooldownUntil);

    const savedSkin = getEquippedSkin(user.id);
    setEquippedSkinState(savedSkin);

    if (lifeState.lives <= 0 && lifeState.cooldownUntil && Date.now() < lifeState.cooldownUntil) {
      setIsGameOver(true);
    } else {
      setIsGameOver(false);
    }

    try {
      const savedScore = localStorage.getItem(`nomverse_high_score_${user.id}`);
      if (savedScore) {
        setHighScore(parseInt(savedScore, 10) || 0);
      }
      const savedStreak = localStorage.getItem(`nomverse_max_streak_${user.id}`);
      if (savedStreak) {
        setMaxStreak(parseInt(savedStreak, 10) || 0);
      }
    } catch {
      // ignore
    }
  }, [user]);

  // Real-time polling for incoming life gifts on The NomWall during Game Over
  useEffect(() => {
    if (!user || !isGameOver) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/lives?recipientId=${encodeURIComponent(user.id)}`);
        const data = await res.json();
        if (data.success && data.giftsReceived > 0) {
          sounds.playGiftReceived();
          confetti({
            particleCount: 90,
            spread: 90,
            origin: { y: 0.5 },
            colors: ["#14F195", "#9945FF", "#F59E0B"],
          });
          setLiveGiftAlert(
            "🎉 A generous builder on The NomWall sent you a Life Gift! Nomster is revived with full hearts!"
          );
          handleLifeRestored();
        }
      } catch (err) {
        // ignore network hiccup during poll
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [user, isGameOver]);

  // Post high score celebration to The NomWall
  const triggerHighScoreWallCelebration = useCallback(
    async (finalScore: number, finalStreak: number) => {
      if (!user || finalScore < 5 || hasPostedHighScore) return;

      setHasPostedHighScore(true);
      try {
        await fetch("/api/lives", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "post_high_score",
            authorId: user.id,
            authorName: user.name,
            authorProvider: user.provider,
            score: finalScore,
            streak: finalStreak,
          }),
        });
      } catch (err) {
        console.error("Failed to auto-post high score celebration to wall:", err);
      }
    },
    [user, hasPostedHighScore]
  );

  const handleScoreUpdate = (newScore: number, newStreak: number) => {
    setScore(newScore);
    setStreak(newStreak);

    if (newStreak > maxStreak) {
      setMaxStreak(newStreak);
      if (user) {
        try {
          localStorage.setItem(`nomverse_max_streak_${user.id}`, newStreak.toString());
        } catch {
          // ignore
        }
      }
    }

    if (user && newScore > highScore) {
      setHighScore(newScore);
      try {
        localStorage.setItem(`nomverse_high_score_${user.id}`, newScore.toString());
      } catch {
        // ignore
      }

      if (newScore >= 5 && newScore % 5 === 0) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#14F195", "#9945FF", "#F59E0B"],
        });
      }
    }
  };

  const handleLivesUpdate = (newLives: number) => {
    setLives(newLives);
    if (user) {
      const updated = decrementClientLife(user.id);
      setCooldownUntil(updated.cooldownUntil);
    }
  };

  const handleGameOver = (finalScore: number) => {
    setIsGameOver(true);
    setActivePowerUps([]);
    if (user) {
      triggerHighScoreWallCelebration(finalScore, streak);
    }
  };

  const handleNomNom = () => {
    setRecentNom(true);
    setTimeout(() => setRecentNom(false), 300);

    // Inflict 1 damage on the World Raid Boss Lord Mega-FUD
    if (user) {
      fetch("/api/raid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ damage: 1, authorName: user.name }),
      }).catch(() => {});
    }
  };

  // Power-Up handlers
  const handlePowerUpActive = (type: PowerUpType) => {
    if (type === "rainbow") return; // instant
    setActivePowerUps((prev) => (prev.includes(type) ? prev : [...prev, type]));
  };

  const handlePowerUpExpired = (type: PowerUpType) => {
    setActivePowerUps((prev) => prev.filter((t) => t !== type));
  };

  // Broadcast SOS Request to The NomWall
  const handleRequestSOS = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const res = await fetch("/api/lives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request_sos",
          authorId: user.id,
          authorName: user.name,
          authorProvider: user.provider,
          score,
        }),
      });
      const data = await res.json();
      return data.success;
    } catch (err) {
      console.error("Failed to broadcast SOS request:", err);
      return false;
    }
  };

  // Life restored via trivia, gift, or countdown expiry
  const handleLifeRestored = () => {
    if (!user) return;
    const updated = replenishClientLives(user.id, MAX_LIVES);
    setLives(updated.lives);
    setCooldownUntil(null);
    setIsGameOver(false);
    setHasPostedHighScore(false);
    setScore(0);
    setStreak(0);
    setActivePowerUps([]);
    setResetSignal((prev) => prev + 1);
  };

  const handleManualReset = () => {
    if (lives <= 0) return;
    setScore(0);
    setStreak(0);
    setActivePowerUps([]);
    setResetSignal((prev) => prev + 1);
  };

  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const handleEquipSkin = (skin: SkinId) => {
    setEquippedSkinState(skin);
    if (user) {
      setEquippedSkin(user.id, skin);
    }
  };

  const userKarma = user ? getClientLifeState(user.id).lifesaverKarma || 0 : 0;

  return (
    <div className="relative w-full max-w-lg mx-auto flex flex-col items-center">
      {/* Live Gift Received Announcement */}
      {liveGiftAlert && (
        <div className="w-full mb-3 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 text-xs font-bold flex items-center justify-between gap-2 shadow-[0_0_25px_rgba(20,241,149,0.3)] animate-pulse">
          <span>{liveGiftAlert}</span>
          <button
            onClick={() => setLiveGiftAlert(null)}
            className="text-slate-400 hover:text-white text-xs font-mono ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* World Raid Boss: Lord Mega-FUD */}
      <RaidBossBanner userId={user?.id} userName={user?.name} />

      {/* Arcade Header HUD */}
      <div className="w-full mb-3 flex items-center justify-between px-3 py-2 bg-surface/90 border border-slate-800/80 rounded-xl backdrop-blur-md shadow-lg">
        {/* Lives (3 Hearts) & Score */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Hearts Display */}
          <div className="flex items-center gap-1" title={`${lives} Lives Remaining`}>
            {[1, 2, 3].map((heartIndex) => {
              const hasLife = lives >= heartIndex;
              return (
                <Heart
                  key={heartIndex}
                  className={`w-4 h-4 transition-all ${
                    hasLife
                      ? "text-rose-500 fill-rose-500 animate-pulse"
                      : "text-slate-700 fill-slate-800"
                  }`}
                />
              );
            })}
          </div>

          {/* Candies Score */}
          <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Score:</span>
            <span
              className={`text-2xl font-black font-mono tracking-tight transition-transform ${
                recentNom ? "scale-125 text-candy-gold" : "text-emerald-400"
              }`}
            >
              {score}
            </span>
          </div>

          {/* Combo Streak */}
          {streak > 1 && (
            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold animate-pulse">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>x{streak}</span>
            </div>
          )}

          {/* High Score */}
          <div className="hidden md:flex items-center gap-1 text-xs font-mono text-amber-400/90 border-l border-slate-800 pl-3">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Best: {highScore}</span>
          </div>
        </div>

        {/* Action controls: Closet, Sound & Reset */}
        <div className="flex items-center gap-2">
          {/* CC0 Closet Button */}
          <button
            onClick={() => setIsSkinModalOpen(true)}
            aria-label="Nomster CC0 Closet"
            title="Nomster CC0 Closet & Accessories"
            className="p-2 rounded-lg text-xs font-mono transition-colors border bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 flex items-center gap-1.5"
          >
            <Shirt className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline font-bold">Closet</span>
          </button>

          <button
            onClick={handleToggleMute}
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
            className={`p-2 rounded-lg text-xs font-mono transition-colors border ${
              isMuted
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleManualReset}
            disabled={lives <= 0}
            aria-label="Restart drop"
            className="p-2 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-slate-700 text-slate-300 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Power-Ups Badges Pill Bar */}
      {activePowerUps.length > 0 && (
        <div className="w-full flex items-center justify-center gap-2 mb-2 select-none animate-fade-in">
          {activePowerUps.map((type) => {
            const config = POWER_UPS[type];
            return (
              <div
                key={type}
                className="px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg animate-pulse"
                style={{
                  backgroundColor: `${config.color}20`,
                  borderColor: `${config.color}80`,
                  borderWidth: "1px",
                  color: config.color,
                }}
              >
                <span>{config.badge} ACTIVE</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Phaser Canvas Container with Lockscreen / Game Over Overlays */}
      <div className="relative w-full">
        {/* Unauthenticated Lockscreen */}
        {!user && <ArcadeLockscreen />}

        {/* Game Over Modal (3-Hour Cooldown & Community Life SOS) */}
        {user && isGameOver && (
          <GameOverModal
            score={score}
            cooldownUntil={cooldownUntil}
            onRequestSOS={handleRequestSOS}
            onLifeRestored={handleLifeRestored}
          />
        )}

        {/* Playable Canvas */}
        <PhaserCanvasDynamic
          onScoreUpdate={handleScoreUpdate}
          onLivesUpdate={handleLivesUpdate}
          onGameOver={handleGameOver}
          onNomNom={handleNomNom}
          onPowerUpActive={handlePowerUpActive}
          onPowerUpExpired={handlePowerUpExpired}
          resetSignal={resetSignal}
          initialLives={lives}
          equippedSkin={equippedSkin}
          waddleSignal={waddleSignal}
        />
      </div>

      {/* Mobile Virtual Waddle Paddles */}
      <MobileWaddlePaddles
        onWaddle={(dir) => setWaddleSignal({ direction: dir, timestamp: Date.now() })}
        disabled={!user || isGameOver || lives <= 0}
      />

      {/* Arcade Instructions & Status Footer */}
      <div className="w-full mt-3 px-4 py-2.5 bg-surface/70 border border-slate-800/80 rounded-xl text-center flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-solana-green" />
          <span>
            <strong>Controls:</strong> Drag Nomster left/right to waddle. Fling candies into his mouth! Don&apos;t drop to the floor!
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
          <span className="text-rose-400 font-bold">3 Lives Rule</span>
          <span>•</span>
          <span className="text-solana-green">Arcade 60 FPS</span>
        </div>
      </div>

      {/* CC0 Closet & Accessories Modal */}
      <SkinSelector
        isOpen={isSkinModalOpen}
        onClose={() => setIsSkinModalOpen(false)}
        equippedSkin={equippedSkin}
        onEquip={handleEquipSkin}
        highScore={highScore}
        maxStreak={maxStreak}
        karma={userKarma}
      />
    </div>
  );
};
