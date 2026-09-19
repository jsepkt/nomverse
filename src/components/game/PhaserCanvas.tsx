"use client";

import React, { useEffect, useRef, useState } from "react";
import type * as PhaserType from "phaser";
import type { MainScene as MainSceneType } from "./MainScene";
import type { PowerUpType } from "@/lib/powerUps";
import type { SkinId } from "@/lib/skins";

interface PhaserCanvasProps {
  onScoreUpdate?: (score: number, streak: number) => void;
  onLivesUpdate?: (lives: number) => void;
  onGameOver?: (finalScore: number) => void;
  onNomNom?: () => void;
  onPowerUpActive?: (type: PowerUpType, durationSec: number) => void;
  onPowerUpExpired?: (type: PowerUpType) => void;
  onGameStateChange?: (state: "idle" | "countdown" | "playing" | "respawning" | "gameover") => void;
  onRivalDethroned?: (score: number, challenger: string) => void;
  onFeverMeterUpdate?: (feverPercent: number, isOverdrive: boolean) => void;
  onDashCooldownUpdate?: (dashReady: boolean) => void;
  onEpisodeComplete?: (episodeId: string, score: number, stars: number) => void;
  onBossHpUpdate?: (currentHp: number, maxHp: number) => void;
  onNextLifeDropCountdown?: (secondsRemaining: number) => void;
  rival?: { score: number; challenger: string };
  holderTierPerks?: {
    extraLives: number;
    scoreMultiplier: number;
    raidMultiplier: number;
    hasCrown: boolean;
  };
  frenzySignal?: number;
  resetSignal?: number;
  startSignal?: number;
  dashSignal?: number;
  episodeId?: string | null;
  initialLives?: number;
  equippedSkin?: SkinId;
  toddlerMode?: boolean;
  waddleSignal?: { direction: "left" | "right"; timestamp: number } | null;
  isFullWindow?: boolean;
}

export const PhaserCanvas: React.FC<PhaserCanvasProps> = ({
  onScoreUpdate,
  onLivesUpdate,
  onGameOver,
  onNomNom,
  onPowerUpActive,
  onPowerUpExpired,
  onGameStateChange,
  onRivalDethroned,
  onFeverMeterUpdate,
  onDashCooldownUpdate,
  onEpisodeComplete,
  onBossHpUpdate,
  onNextLifeDropCountdown,
  rival,
  holderTierPerks,
  frenzySignal,
  resetSignal,
  startSignal,
  dashSignal,
  episodeId,
  initialLives = 5,
  equippedSkin = "default",
  toddlerMode = false,
  waddleSignal,
  isFullWindow = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<PhaserType.Game | null>(null);
  const sceneRef = useRef<MainSceneType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const onScoreUpdateRef = useRef(onScoreUpdate);
  onScoreUpdateRef.current = onScoreUpdate;

  const onLivesUpdateRef = useRef(onLivesUpdate);
  onLivesUpdateRef.current = onLivesUpdate;

  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;

  const onNomNomRef = useRef(onNomNom);
  onNomNomRef.current = onNomNom;

  const onPowerUpActiveRef = useRef(onPowerUpActive);
  onPowerUpActiveRef.current = onPowerUpActive;

  const onPowerUpExpiredRef = useRef(onPowerUpExpired);
  onPowerUpExpiredRef.current = onPowerUpExpired;

  const onGameStateChangeRef = useRef(onGameStateChange);
  onGameStateChangeRef.current = onGameStateChange;

  const onRivalDethronedRef = useRef(onRivalDethroned);
  onRivalDethronedRef.current = onRivalDethroned;

  const onFeverMeterUpdateRef = useRef(onFeverMeterUpdate);
  onFeverMeterUpdateRef.current = onFeverMeterUpdate;

  const onDashCooldownUpdateRef = useRef(onDashCooldownUpdate);
  onDashCooldownUpdateRef.current = onDashCooldownUpdate;

  const onEpisodeCompleteRef = useRef(onEpisodeComplete);
  onEpisodeCompleteRef.current = onEpisodeComplete;

  const onBossHpUpdateRef = useRef(onBossHpUpdate);
  onBossHpUpdateRef.current = onBossHpUpdate;

  const onNextLifeDropCountdownRef = useRef(onNextLifeDropCountdown);
  onNextLifeDropCountdownRef.current = onNextLifeDropCountdown;

  useEffect(() => {
    let isMounted = true;

    async function initPhaser() {
      if (!containerRef.current) return;
      if (gameRef.current) return;

      try {
        const Phaser = await import("phaser");
        const { MainScene } = await import("./MainScene");

        if (!isMounted || !containerRef.current) return;

        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }

        const config: PhaserType.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          parent: containerRef.current,
          width: 440,
          height: 520,
          transparent: true,
          physics: {
            default: "arcade",
            arcade: {
              gravity: { x: 0, y: 0 },
              debug: false,
            },
          },
          scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
          },
        };

        const game = new Phaser.Game(config);
        gameRef.current = game;

        const scene = new MainScene();
        sceneRef.current = scene;

        game.scene.add("MainScene", scene, true, {
          initialLives,
          initialSkin: equippedSkin,
          initialToddlerMode: toddlerMode,
          rival,
          holderTierPerks,
          episodeId,
          callbacks: {
            onScoreUpdate: (score: number, streak: number) => {
              if (onScoreUpdateRef.current) {
                onScoreUpdateRef.current(score, streak);
              }
            },
            onLivesUpdate: (lives: number) => {
              if (onLivesUpdateRef.current) {
                onLivesUpdateRef.current(lives);
              }
            },
            onGameOver: (finalScore: number) => {
              if (onGameOverRef.current) {
                onGameOverRef.current(finalScore);
              }
            },
            onNomNom: () => {
              if (onNomNomRef.current) {
                onNomNomRef.current();
              }
            },
            onPowerUpActive: (type: PowerUpType, durationSec: number) => {
              if (onPowerUpActiveRef.current) {
                onPowerUpActiveRef.current(type, durationSec);
              }
            },
            onPowerUpExpired: (type: PowerUpType) => {
              if (onPowerUpExpiredRef.current) {
                onPowerUpExpiredRef.current(type);
              }
            },
            onGameStateChange: (state: "idle" | "countdown" | "playing" | "respawning" | "gameover") => {
              if (onGameStateChangeRef.current) {
                onGameStateChangeRef.current(state);
              }
            },
            onRivalDethroned: (score: number, challenger: string) => {
              if (onRivalDethronedRef.current) {
                onRivalDethronedRef.current(score, challenger);
              }
            },
            onFeverMeterUpdate: (feverPercent: number, isOverdrive: boolean) => {
              if (onFeverMeterUpdateRef.current) {
                onFeverMeterUpdateRef.current(feverPercent, isOverdrive);
              }
            },
            onDashCooldownUpdate: (dashReady: boolean) => {
              if (onDashCooldownUpdateRef.current) {
                onDashCooldownUpdateRef.current(dashReady);
              }
            },
            onEpisodeComplete: (epId: string, score: number, stars: number) => {
              if (onEpisodeCompleteRef.current) {
                onEpisodeCompleteRef.current(epId, score, stars);
              }
            },
            onBossHpUpdate: (currentHp: number, maxHp: number) => {
              if (onBossHpUpdateRef.current) {
                onBossHpUpdateRef.current(currentHp, maxHp);
              }
            },
            onNextLifeDropCountdown: (seconds: number) => {
              if (onNextLifeDropCountdownRef.current) {
                onNextLifeDropCountdownRef.current(seconds);
              }
            },
          },
        });

        if (isMounted) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to initialize Phaser game engine:", err);
      }
    }

    initPhaser();

    return () => {
      isMounted = false;
      if (gameRef.current) {
        try {
          gameRef.current.destroy(true);
        } catch (e) {
          console.warn("Error destroying Phaser game instance:", e);
        }
        gameRef.current = null;
        sceneRef.current = null;
      }
    };
  }, [initialLives, equippedSkin, episodeId]);

  // Handle live skin change
  useEffect(() => {
    if (sceneRef.current && equippedSkin) {
      sceneRef.current.setSkin(equippedSkin);
    }
  }, [equippedSkin]);

  // Handle start signal triggered from parent HUD
  useEffect(() => {
    if (startSignal && startSignal > 0 && sceneRef.current) {
      sceneRef.current.startGame();
    }
  }, [startSignal]);

  // Handle resets triggered from parent HUD
  useEffect(() => {
    if (resetSignal && resetSignal > 0 && sceneRef.current) {
      sceneRef.current.resetGame(initialLives);
    }
  }, [resetSignal, initialLives]);

  // Handle live super dash signals
  useEffect(() => {
    if (dashSignal && dashSignal > 0 && sceneRef.current) {
      sceneRef.current.performSuperDash();
    }
  }, [dashSignal]);

  // Handle live whale buy frenzy signals
  useEffect(() => {
    if (frenzySignal && frenzySignal > 0 && sceneRef.current) {
      sceneRef.current.triggerGoldenFrenzy(20);
    }
  }, [frenzySignal]);

  // Handle mobile waddle signals
  useEffect(() => {
    if (!waddleSignal || !sceneRef.current || !sceneRef.current.isReady) return;
    if (waddleSignal.direction === "left") {
      sceneRef.current.waddleLeft();
    } else if (waddleSignal.direction === "right") {
      sceneRef.current.waddleRight();
    }
  }, [waddleSignal]);

  // Handle live toddler mode changes
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setToddlerMode(Boolean(toddlerMode));
    }
  }, [toddlerMode]);

  // Refresh Phaser canvas scale when entering/exiting full-window mode
  useEffect(() => {
    if (gameRef.current) {
      const timer = setTimeout(() => {
        gameRef.current?.scale.refresh();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isFullWindow]);

  return (
    <div
      className={`relative mx-auto overflow-hidden rounded-2xl border-2 border-solana-green/40 bg-[#060a14] shadow-[inset_0_0_25px_rgba(0,0,0,0.9),0_0_35px_rgba(20,241,149,0.18)] flex items-center justify-center group ${
        isFullWindow
          ? "w-full h-full max-h-[min(78vh,680px)] aspect-[440/520] max-w-full"
          : "w-full max-w-[440px] aspect-[440/520]"
      }`}
    >
      {/* Top Arcade Cabinet Marquee Strip */}
      <div className="absolute top-0 inset-x-0 h-6 bg-gradient-to-b from-slate-900/95 to-slate-950/80 backdrop-blur-xs border-b border-emerald-500/20 px-3 flex items-center justify-between z-10 pointer-events-none select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
          <span className="text-[9px] sm:text-[10px] font-mono font-black tracking-widest text-emerald-400/90 uppercase">
            {toddlerMode ? "🧸 NOM-O-MATIC 3000 • KID ASSIST ON" : "NOM-O-MATIC 3000"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[8px] sm:text-[9px] font-mono text-slate-400/80">
          <span className="inline-block w-1 h-1 rounded-full bg-solana-purple" />
          <span>60 FPS • ARCADE READY</span>
        </div>
      </div>

      {/* Decorative Arcade Corner Rivets */}
      <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-slate-700/80 border border-slate-500/50 pointer-events-none z-10" />
      <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-slate-700/80 border border-slate-500/50 pointer-events-none z-10" />
      <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-slate-700/80 border border-slate-500/50 pointer-events-none z-10" />
      <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-slate-700/80 border border-slate-500/50 pointer-events-none z-10" />

      {/* Retro Arcade Glass Reflection Sheen */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.015] to-emerald-400/[0.04] z-10" />

      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-sm gap-3">
          <div className="w-10 h-10 border-4 border-solana-green border-t-transparent rounded-full animate-spin shadow-[0_0_15px_#14f195]" />
          <span className="text-xs font-mono tracking-wider text-emerald-400">
            INITIALIZING ARCADE PHYSICS...
          </span>
        </div>
      )}

      {/* Phaser Canvas Mount Point */}
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center cursor-crosshair touch-none select-none"
      />
    </div>
  );
};
