"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import {
  getClientLifeState,
  decrementClientLife,
  replenishClientLives,
  saveClientLifeState,
  COOLDOWN_DURATION_MS,
  MAX_LIVES,
} from "@/lib/lifeSystem";
import { SkinId, getEquippedSkin, setEquippedSkin } from "@/lib/skins";
import { PowerUpType, POWER_UPS } from "@/lib/powerUps";
import { ArcadeLockscreen } from "./ArcadeLockscreen";
import { GameOverModal } from "./GameOverModal";
import { SkinSelector } from "./SkinSelector";
import { MobileWaddlePaddles } from "./MobileWaddlePaddles";
import { RaidBossBanner } from "./RaidBossBanner";
import { HolderPerksModal } from "../wallet/HolderPerksModal";
import { WhaleAlertToast } from "../ui/WhaleAlertToast";
import { ArcadeJukebox } from "../audio/ArcadeJukebox";
import {
  HOLDER_TIERS,
  HolderPerks,
  getStoredHolderState,
  getTierForBalance,
} from "@/lib/holderTiers";
import { sounds } from "../audio/soundEffects";
import { EpisodeSelectModal } from "./EpisodeSelectModal";
import { EpisodeVictoryCard } from "./EpisodeBanner";
import { EPISODES, EpisodeConfig, saveEpisodeCompletion } from "@/lib/episodes";
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Trophy,
  Sparkles,
  Heart,
  Flame,
  Shirt,
  Maximize2,
  Minimize2,
  Play,
  Swords,
  Coins,
  Crown,
  Film,
  Zap,
  Gamepad2,
} from "lucide-react";
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

export interface GameContainerProps {
  initialFullWindow?: boolean;
  showGameRoomButton?: boolean;
  expandedMode?: boolean;
}

export const GameContainer: React.FC<GameContainerProps> = ({
  initialFullWindow = false,
  showGameRoomButton = false,
  expandedMode = false,
}) => {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(MAX_LIVES);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [resetSignal, setResetSignal] = useState<number>(0);
  const [startSignal, setStartSignal] = useState<number>(0);
  const [gameState, setGameState] = useState<"idle" | "countdown" | "playing" | "respawning" | "gameover">("idle");
  const [isFullWindow, setIsFullWindow] = useState<boolean>(initialFullWindow);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [recentNom, setRecentNom] = useState<boolean>(false);
  const [hasPostedHighScore, setHasPostedHighScore] = useState<boolean>(false);
  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);

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

  // Rival Challenge & Holder Tiers State
  const [rival, setRival] = useState<{ score: number; challenger: string } | null>(null);
  const [rivalDethroned, setRivalDethroned] = useState<boolean>(false);
  const [isHolderModalOpen, setIsHolderModalOpen] = useState<boolean>(false);
  const [holderPerks, setHolderPerks] = useState<HolderPerks>(HOLDER_TIERS.fish);
  const [frenzySignal, setFrenzySignal] = useState<number>(0);

  // Episodic Campaign & Dash & Fever State
  const [currentEpisodeId, setCurrentEpisodeId] = useState<string | null>(null);
  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState<boolean>(false);
  const [victoryData, setVictoryData] = useState<{
    episode: EpisodeConfig;
    score: number;
    streak: number;
    stars: number;
  } | null>(null);
  const [feverPercent, setFeverPercent] = useState<number>(0);
  const [isFeverOverdrive, setIsFeverOverdrive] = useState<boolean>(false);
  const [dashReady, setDashReady] = useState<boolean>(true);
  const [dashSignal, setDashSignal] = useState<number>(0);
  const [nextHeartCountdown, setNextHeartCountdown] = useState<number>(120);
  const [toddlerMode, setToddlerMode] = useState<boolean>(false);

  // Toddler auto-waddle intervals and audio
  const handleToggleToddlerMode = () => {
    const next = !toddlerMode;
    setToddlerMode(next);
    if (next) {
      sounds.playGoldenChime();
    }
  };

  const handleStartEpisode = (ep: EpisodeConfig) => {
    setCurrentEpisodeId(ep.id);
    setIsEpisodeModalOpen(false);
    setVictoryData(null);
    setResetSignal((prev) => prev + 1);
    setStartSignal((prev) => prev + 1);
    setGameState("playing");
  };

  const handleEpisodeComplete = useCallback((epId: string, finalScore: number, stars: number) => {
    const epConfig = EPISODES.find((e) => e.id === epId);
    if (epConfig) {
      saveEpisodeCompletion(epId, finalScore, stars, user?.id || "guest");
      setVictoryData({
        episode: epConfig,
        score: finalScore,
        streak,
        stars,
      });
    }
  }, [user, streak]);

  const handleNextEpisode = useCallback(() => {
    if (!victoryData) return;
    const nextIndex = EPISODES.findIndex((e) => e.id === victoryData.episode.id) + 1;
    if (nextIndex < EPISODES.length && !EPISODES[nextIndex].isComingSoon) {
      setCurrentEpisodeId(EPISODES[nextIndex].id);
      setVictoryData(null);
      setResetSignal((prev) => prev + 1);
      setStartSignal((prev) => prev + 1);
    }
  }, [victoryData]);

  // Synchronize life and skin state on user login or guest session
  useEffect(() => {
    if (user) {
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
    } else {
      // Guest session initialization
      try {
        const savedGuestScore = localStorage.getItem("nomverse_guest_high_score");
        if (savedGuestScore) {
          setHighScore(parseInt(savedGuestScore, 10) || 0);
        }
        const savedGuestStreak = localStorage.getItem("nomverse_guest_max_streak");
        if (savedGuestStreak) {
          setMaxStreak(parseInt(savedGuestStreak, 10) || 0);
        }
        const savedCooldown = localStorage.getItem("nomverse_guest_cooldown");
        if (savedCooldown) {
          const cd = parseInt(savedCooldown, 10);
          if (cd && Date.now() < cd) {
            setCooldownUntil(cd);
            setLives(0);
            setIsGameOver(true);
          } else {
            setCooldownUntil(null);
            setLives(MAX_LIVES);
            setIsGameOver(false);
          }
        }
      } catch {
        // ignore
      }
    }
  }, [user]);

  // Parse Rival Challenge URL and Holder Tier State on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        const rScore = parseInt(params.get("rivalScore") || "", 10);
        const rChallenger = params.get("challenger");
        if (!isNaN(rScore) && rScore > 0 && rChallenger) {
          setRival({ score: rScore, challenger: rChallenger });
        }
      } catch {
        // ignore
      }

      const savedHolder = getStoredHolderState();
      if (savedHolder) {
        const perks = getTierForBalance(savedHolder.balance);
        setHolderPerks(perks);
      }
    }
  }, []);

  const handleRivalDethroned = useCallback((finalScore: number, challenger: string) => {
    setRivalDethroned(true);
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.4 },
      colors: ["#F59E0B", "#14F195", "#9945FF", "#38BDF8"],
    });
  }, []);

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
      try {
        if (user) {
          localStorage.setItem(`nomverse_max_streak_${user.id}`, newStreak.toString());
        } else {
          localStorage.setItem("nomverse_guest_max_streak", newStreak.toString());
        }
      } catch {
        // ignore
      }
    }

    if (newScore > highScore) {
      setHighScore(newScore);
      try {
        if (user) {
          localStorage.setItem(`nomverse_high_score_${user.id}`, newScore.toString());
        } else {
          localStorage.setItem("nomverse_guest_high_score", newScore.toString());
        }
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
      const current = getClientLifeState(user.id);
      current.lives = newLives;
      if (newLives <= 0 && !current.cooldownUntil) {
        current.cooldownUntil = Date.now() + COOLDOWN_DURATION_MS;
      } else if (newLives > 0) {
        current.cooldownUntil = null;
      }
      saveClientLifeState(current);
      setCooldownUntil(current.cooldownUntil);
    } else {
      if (newLives <= 0) {
        const cd = Date.now() + COOLDOWN_DURATION_MS;
        setCooldownUntil(cd);
        try {
          localStorage.setItem("nomverse_guest_cooldown", cd.toString());
        } catch {}
      } else {
        setCooldownUntil(null);
        try {
          localStorage.removeItem("nomverse_guest_cooldown");
        } catch {}
      }
    }
  };

  const handleGameOver = (finalScore: number) => {
    setIsGameOver(true);
    setGameState("gameover");
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

  // Full Window / Theater Mode Toggle
  const toggleFullWindow = async () => {
    const nextState = !isFullWindow;
    setIsFullWindow(nextState);

    if (nextState) {
      try {
        if (containerRef.current && containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen().catch(() => {});
        }
      } catch {
        // Fallback to CSS full-screen
      }
    } else {
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen().catch(() => {});
        }
      } catch {
        // ignore
      }
    }

    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 120);
  };

  // Synchronize fullscreen exit & keyboard shortcuts
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullWindow) {
        setIsFullWindow(false);
        setTimeout(() => {
          window.dispatchEvent(new Event("resize"));
        }, 120);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullWindow) {
        setIsFullWindow(false);
        setTimeout(() => {
          window.dispatchEvent(new Event("resize"));
        }, 120);
      } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        setWaddleSignal({ direction: "left", timestamp: Date.now() });
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        setWaddleSignal({ direction: "right", timestamp: Date.now() });
      } else if (e.key === " " && gameState === "idle") {
        handleStartGame();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullWindow, gameState]);

  // Lock background body scroll in full window mode
  useEffect(() => {
    if (isFullWindow) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullWindow]);

  const handleStartGame = () => {
    if (lives <= 0) return;
    setStartSignal((prev) => prev + 1);
    setGameState("countdown");
  };

  const handleGameStateChange = (state: "idle" | "countdown" | "playing" | "respawning" | "gameover") => {
    setGameState(state);
    if (state === "gameover") {
      setIsGameOver(true);
    }
  };

  // Life restored via trivia, gift, or countdown expiry
  const handleLifeRestored = () => {
    if (!user) {
      setLives(MAX_LIVES);
      setCooldownUntil(null);
      setIsGameOver(false);
      setHasPostedHighScore(false);
      setScore(0);
      setStreak(0);
      setActivePowerUps([]);
      setResetSignal((prev) => prev + 1);
      setGameState("countdown");
      try {
        localStorage.removeItem("nomverse_guest_cooldown");
      } catch {}
      return;
    }
    const updated = replenishClientLives(user.id, MAX_LIVES);
    setLives(updated.lives);
    setCooldownUntil(null);
    setIsGameOver(false);
    setHasPostedHighScore(false);
    setScore(0);
    setStreak(0);
    setActivePowerUps([]);
    setResetSignal((prev) => prev + 1);
    setGameState("countdown");
  };

  const handleManualReset = () => {
    if (lives <= 0) return;
    setScore(0);
    setStreak(0);
    setActivePowerUps([]);
    setResetSignal((prev) => prev + 1);
    setGameState("countdown");
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
    <div
      ref={containerRef}
      className={
        isFullWindow
          ? "fixed inset-0 z-[999] w-screen h-screen bg-[#050914] flex flex-col items-center justify-between p-2 sm:p-4 overflow-hidden select-none"
          : expandedMode
          ? "relative w-full max-w-[560px] sm:max-w-[580px] mx-auto flex flex-col items-center"
          : "relative w-full max-w-[460px] mx-auto flex flex-col items-center"
      }
    >
      {/* Live Gift Received Announcement */}
      {liveGiftAlert && !isFullWindow && (
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

      {/* World Raid Boss: Lord Mega-FUD (Normal view) */}
      {!isFullWindow && <RaidBossBanner userId={user?.id} userName={user?.name} />}

      {/* Arcade Cockpit HUD */}
      <div className="w-full mb-3 rounded-2xl bg-slate-900/90 border border-slate-800/80 backdrop-blur-xl shadow-xl p-2 sm:p-3 flex flex-col gap-2">
        {/* Tier 1: Scoreboard Console Deck */}
        <div className="flex items-center justify-between gap-2 px-1">
          {/* Left: Hearts & Heart Drop Countdown */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-0.5" title={`${lives}/10 Lives Remaining`}>
              <div className="flex items-center gap-0.5 sm:gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((heartIndex) => {
                  const hasLife = lives >= heartIndex;
                  const isBonus = heartIndex > 5;
                  if (isBonus && lives <= 5 && heartIndex > 5) {
                    return null;
                  }
                  return (
                    <Heart
                      key={heartIndex}
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all ${
                        hasLife
                          ? isBonus
                            ? "text-pink-400 fill-pink-400 animate-bounce"
                            : "text-rose-500 fill-rose-500 animate-pulse"
                          : "text-slate-800 fill-slate-800/60"
                      }`}
                    />
                  );
                })}
              </div>
              {gameState === "playing" && (
                <div className="flex items-center gap-1 text-[9px] font-mono text-pink-400/90 font-bold">
                  <span>❤️ Drop in {Math.floor(nextHeartCountdown / 60)}:{(nextHeartCountdown % 60).toString().padStart(2, "0")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Center: Candies Score & Streak */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-slate-400">Score:</span>
              <span
                className={`text-xl sm:text-2xl font-black font-mono tracking-tight transition-transform ${
                  recentNom ? "scale-125 text-candy-gold" : "text-emerald-400"
                }`}
              >
                {score}
              </span>
            </div>

            {/* Combo Streak */}
            {streak > 1 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] sm:text-xs font-mono font-bold animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>x{streak}</span>
              </div>
            )}
          </div>

          {/* Right: Best High Score */}
          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] sm:text-xs font-mono text-amber-400/90">
            <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-bold"><span className="hidden sm:inline">Best: </span>{highScore}</span>
          </div>
        </div>

        {/* Tier 2: Ergonomic Control Actions Dock */}
        <div className="flex items-center justify-between gap-1 sm:gap-1.5 pt-2 border-t border-slate-800/80 w-full overflow-hidden">
          {/* Game Modes & Customization Cluster */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Episodes Campaign Button */}
            <button
              onClick={() => setIsEpisodeModalOpen(true)}
              aria-label="Story Episodes"
              title="Play Story Episodes & Boss Battles"
              className={`px-2 py-1.5 rounded-xl text-[11px] sm:text-xs font-mono transition-all border flex items-center gap-1 shadow-sm hover:scale-105 active:scale-95 shrink-0 ${
                currentEpisodeId
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)] font-bold"
                  : "bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/80 text-slate-300 hover:text-white"
              }`}
            >
              <Film className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-bold">
                {currentEpisodeId
                  ? `EP 0${EPISODES.find((e) => e.id === currentEpisodeId)?.number || 1}`
                  : "Story"}
              </span>
            </button>

            {/* Holder Perks Bag Button */}
            <button
              onClick={() => setIsHolderModalOpen(true)}
              aria-label="Proof of Bag - Holder Perks"
              title={`Proof of Bag: ${holderPerks.label}`}
              className="px-2 py-1.5 rounded-xl text-[11px] sm:text-xs font-mono transition-all border flex items-center gap-1 shadow-sm hover:scale-105 active:scale-95 shrink-0"
              style={{
                backgroundColor: `${holderPerks.accentColor}18`,
                borderColor: `${holderPerks.accentColor}50`,
                color: holderPerks.accentColor,
              }}
            >
              <Coins className="w-3.5 h-3.5 shrink-0" />
              <span className="font-bold">{holderPerks.badge}</span>
              {holderPerks.hasCrown && <Crown className="w-3 h-3 text-amber-400 shrink-0" />}
            </button>

            {/* CC0 Closet Button */}
            <button
              onClick={() => setIsSkinModalOpen(true)}
              aria-label="Nomster CC0 Closet"
              title="Nomster CC0 Closet & Accessories"
              className="p-1.5 sm:p-2 rounded-xl text-xs font-mono transition-all border bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 flex items-center justify-center hover:scale-105 active:scale-95 shrink-0"
            >
              <Shirt className="w-3.5 h-3.5 text-purple-400" />
            </button>

            {/* Toddler / Kid Mode (Age 3-5) Toggle */}
            <button
              onClick={handleToggleToddlerMode}
              aria-label={toddlerMode ? "Disable Kid Mode" : "Enable Kid Mode (Age 3-5)"}
              title={
                toddlerMode
                  ? "Kid Mode Active: Floaty Candies, Auto-Waddle & Magic Vacuum ON"
                  : "Kid Mode (Age 3-5): Floaty Candies, Auto-Waddle & Magic Vacuum for Toddlers"
              }
              className={`px-2 py-1.5 rounded-xl text-[11px] sm:text-xs font-mono transition-all border flex items-center gap-1 shadow-sm hover:scale-105 active:scale-95 cursor-pointer shrink-0 ${
                toddlerMode
                  ? "bg-amber-500/25 border-amber-400 text-amber-300 font-bold shadow-[0_0_12px_rgba(245,158,11,0.45)]"
                  : "bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/80 text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="text-sm leading-none">🧸</span>
              <span className="font-bold text-[10px] sm:text-[11px]">
                {toddlerMode ? "ON" : "Kid"}
              </span>
            </button>
          </div>

          {/* Hardware & Display Controls Cluster */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Sound Toggle */}
            <button
              onClick={handleToggleMute}
              aria-label={isMuted ? "Unmute audio" : "Mute audio"}
              title={isMuted ? "Unmute Sound" : "Mute Sound"}
              className={`p-1.5 sm:p-2 rounded-xl text-xs font-mono transition-all border hover:scale-105 active:scale-95 shrink-0 ${
                isMuted
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
              }`}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Fullscreen / Full Window Toggle */}
            {isFullWindow ? (
              <button
                onClick={toggleFullWindow}
                aria-label="Exit Fullscreen"
                title="Exit Fullscreen (Esc)"
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-mono transition-all border bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30 flex items-center gap-1 font-bold shadow-lg hover:scale-105 active:scale-95 shrink-0"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">EXIT</span>
              </button>
            ) : (
              <button
                onClick={toggleFullWindow}
                aria-label="Full Size Window"
                title="Play in Full Size Window (Distraction-Free)"
                className="p-1.5 sm:p-2 rounded-xl text-xs font-mono transition-all border bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 flex items-center justify-center hover:scale-105 active:scale-95 shrink-0"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Dedicated Game Room Link Button */}
            {showGameRoomButton && (
              <Link
                href="/play"
                title="Enter Game Room with Stages & Community Mods"
                className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl text-xs font-mono transition-all border bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 flex items-center gap-1 font-bold hover:scale-105 active:scale-95 shrink-0"
              >
                <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline text-[10px]">ROOM</span>
              </Link>
            )}

            {/* Reset / Restart Drop Button */}
            <button
              onClick={handleManualReset}
              disabled={lives <= 0}
              aria-label="Restart drop"
              title="Restart Drop"
              className="p-1.5 sm:p-2 rounded-xl text-xs font-mono bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-slate-700 text-slate-300 transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* NOM-RAGE Fever Overdrive Progress Bar */}
      <div className="w-full mb-2.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2 select-none shadow-sm">
        <Flame className={`w-4 h-4 shrink-0 ${isFeverOverdrive ? "text-amber-400 animate-bounce" : "text-slate-400"}`} />
        <div className="flex-1 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80 relative">
          <div
            className={`h-full transition-all duration-150 ${
              isFeverOverdrive
                ? "bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-300 animate-pulse shadow-[0_0_12px_#f59e0b]"
                : "bg-gradient-to-r from-emerald-500 to-solana-green"
            }`}
            style={{ width: `${feverPercent}%` }}
          />
        </div>
        <span className={`text-[10px] font-mono font-bold shrink-0 ${isFeverOverdrive ? "text-amber-400 animate-pulse" : "text-slate-300"}`}>
          {isFeverOverdrive ? "🔥 OVERDRIVE 3X!" : `FEVER ${Math.round(feverPercent)}%`}
        </span>
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

      {/* Rival Challenge Banner */}
      {rival && (
        <div className="w-full mb-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border border-amber-500/30 flex items-center justify-between text-xs font-mono animate-in fade-in">
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {rivalDethroned ? (
                <strong className="text-emerald-400">👑 VICTORY! You dethroned {rival.challenger}!</strong>
              ) : (
                <span>
                  <strong>RIVAL BOUNTY:</strong> Beat <span className="text-amber-300 font-bold">{rival.challenger}&apos;s</span> score of <span className="text-white font-bold">{rival.score}</span>!
                </span>
              )}
            </span>
          </div>
          <span className="text-[10px] text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            {rivalDethroned ? "RIVAL DETHRONED" : "ACTIVE BOUNTY"}
          </span>
        </div>
      )}

      {/* Phaser Canvas Container with Lockscreen / Game Over Overlays */}
      <div
        className={
          isFullWindow
            ? "relative flex-1 w-full flex items-center justify-center min-h-0 my-auto"
            : expandedMode
            ? "relative w-full max-w-[540px] mx-auto aspect-[440/520] rounded-2xl overflow-hidden shadow-[0_0_45px_rgba(20,241,149,0.25)]"
            : "relative w-full max-w-[440px] mx-auto aspect-[440/520] rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(20,241,149,0.2)]"
        }
      >
        {/* Unauthenticated Lockscreen: only shown if not logged in AND has not chosen Play as Guest */}
        {!user && !isGuestMode && (
          <ArcadeLockscreen
            onPlayAsGuest={() => {
              setIsGuestMode(true);
              handleStartGame();
            }}
          />
        )}

        {/* Game Over Modal (3-Hour Cooldown & Community Life SOS) */}
        {(user || isGuestMode) && isGameOver && (
          <GameOverModal
            score={score}
            streak={streak}
            equippedSkin={equippedSkin}
            cooldownUntil={cooldownUntil}
            onRequestSOS={handleRequestSOS}
            onLifeRestored={handleLifeRestored}
          />
        )}

        {/* Ready to Play Start Overlay */}
        {(user || isGuestMode) && gameState === "idle" && !isGameOver && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 text-center select-none animate-fade-in rounded-2xl">
            <div className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-3">
              PUMP.FUN FAIR LAUNCH ARCADE
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white font-mono mb-2">
              FEED NOMSTER!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xs mb-5 leading-relaxed">
              Collect falling crypto candies! Drag Nomster left &amp; right, or flick candies into his mouth. Don&apos;t drop them!
            </p>
            <button
              onClick={handleStartGame}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-300 to-solana-green hover:from-emerald-300 hover:to-teal-200 text-slate-950 font-black text-sm font-mono shadow-[0_0_35px_rgba(20,241,149,0.5)] hover:shadow-[0_0_50px_rgba(20,241,149,0.8)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>START GAME (5 LIVES)</span>
            </button>
            <span className="text-[10px] font-mono text-slate-400 mt-3">
              (Press Space or tap anywhere on canvas to start)
            </span>
          </div>
        )}

        {/* Story Episode Victory Card */}
        {victoryData && (
          <EpisodeVictoryCard
            episode={victoryData.episode}
            score={victoryData.score}
            streak={victoryData.streak}
            stars={victoryData.stars}
            onReplay={() => {
              setVictoryData(null);
              setResetSignal((prev) => prev + 1);
            }}
            onNextEpisode={handleNextEpisode}
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
          onGameStateChange={handleGameStateChange}
          onRivalDethroned={handleRivalDethroned}
          onFeverMeterUpdate={(percent, isOverdrive) => {
            setFeverPercent(percent);
            setIsFeverOverdrive(isOverdrive);
          }}
          onDashCooldownUpdate={(ready) => setDashReady(ready)}
          onEpisodeComplete={handleEpisodeComplete}
          onNextLifeDropCountdown={(sec) => setNextHeartCountdown(sec)}
          dashSignal={dashSignal}
          episodeId={currentEpisodeId}
          rival={rival || undefined}
          holderTierPerks={{
            extraLives: holderPerks.extraLives,
            scoreMultiplier: holderPerks.scoreMultiplier,
            raidMultiplier: holderPerks.raidMultiplier,
            hasCrown: holderPerks.hasCrown,
          }}
          frenzySignal={frenzySignal}
          resetSignal={resetSignal}
          startSignal={startSignal}
          initialLives={lives + holderPerks.extraLives}
          equippedSkin={equippedSkin}
          toddlerMode={toddlerMode}
          waddleSignal={waddleSignal}
          isFullWindow={isFullWindow}
          expandedMode={expandedMode}
        />
      </div>

      {/* Toddler / Kid Mode (Age 3-5) Active Banner */}
      {toddlerMode && (
        <div className="w-full mt-2.5 px-3.5 py-2 bg-gradient-to-r from-amber-500/15 via-pink-500/15 to-amber-500/15 border border-amber-500/40 rounded-xl flex items-center justify-between text-xs font-mono text-amber-300 animate-in fade-in shadow-[0_0_15px_rgba(245,158,11,0.15)]">
          <div className="flex items-center gap-2">
            <span className="text-base">🧸</span>
            <span>
              <strong>Kid Mode Active (Age 3-5):</strong> Candies float gently like balloons, Nomster auto-waddles to catch, and tapping anywhere eats the candy!
            </span>
          </div>
          <button
            onClick={handleToggleToddlerMode}
            className="text-[10px] text-amber-400 hover:text-white underline ml-2 shrink-0 cursor-pointer font-bold"
          >
            Switch to Normal
          </button>
        </div>
      )}

      {/* Mobile Virtual Waddle Paddles */}
      <MobileWaddlePaddles
        onWaddle={(dir) => setWaddleSignal({ direction: dir, timestamp: Date.now() })}
        onDash={() => setDashSignal((prev) => prev + 1)}
        dashReady={dashReady}
        disabled={(!user && !isGuestMode) || isGameOver || lives <= 0}
      />

      {/* Arcade Instructions & Status Footer (Hidden in Full Window for zero distraction) */}
      {!isFullWindow && (
        <div className="w-full mt-3 px-4 py-2.5 bg-surface/70 border border-slate-800/80 rounded-xl text-center flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-solana-green" />
            <span>
              <strong>Controls:</strong> Arrow Keys / A &amp; D to move, <strong>Space / Shift</strong> to Super Dash, <strong>Up / W</strong> to Air Juggle!
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
            <span className="text-rose-400 font-bold">5 Lives Base (Max 10)</span>
            <span>•</span>
            <span className="text-pink-400 font-bold">❤️ Drop Every 2 Min</span>
            <span>•</span>
            <span className="text-solana-green">Arcade 60 FPS</span>
          </div>
        </div>
      )}

      {/* CC0 Closet & Accessories Modal */}
      <SkinSelector
        isOpen={isSkinModalOpen}
        onClose={() => setIsSkinModalOpen(false)}
        equippedSkin={equippedSkin}
        onEquip={handleEquipSkin}
        highScore={highScore}
        maxStreak={maxStreak}
        karma={userKarma}
        isHolder={Boolean(holderPerks.unlockedSkinId === "diamond")}
      />

      {/* Proof of Bag - Holder Perks Modal */}
      <HolderPerksModal
        isOpen={isHolderModalOpen}
        onClose={() => setIsHolderModalOpen(false)}
        onTierUpdated={(perks) => setHolderPerks(perks)}
      />

      {/* Episode Selection & Campaign Modal */}
      <EpisodeSelectModal
        isOpen={isEpisodeModalOpen}
        onClose={() => setIsEpisodeModalOpen(false)}
        onSelectEpisode={(epId) => {
          setCurrentEpisodeId(epId);
          setVictoryData(null);
          setResetSignal((prev) => prev + 1);
        }}
        currentEpisodeId={currentEpisodeId}
        userId={user?.id}
      />

      {/* Live Whale Alert Toasts & In-Game Golden Frenzy Trigger */}
      <WhaleAlertToast
        onTriggerFrenzy={() => setFrenzySignal(Date.now())}
      />

      {/* Ambient Arcade Chiptune Jukebox */}
      <ArcadeJukebox />
    </div>
  );
};
