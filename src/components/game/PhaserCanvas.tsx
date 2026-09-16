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
  initialLives?: number;
  equippedSkin?: SkinId;
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
  rival,
  holderTierPerks,
  frenzySignal,
  resetSignal,
  startSignal,
  initialLives = 3,
  equippedSkin = "default",
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
          rival,
          holderTierPerks,
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
  }, [initialLives, equippedSkin]);

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
      sceneRef.current.resetGame(3);
    }
  }, [resetSignal]);

  // Handle live whale buy frenzy signals
  useEffect(() => {
    if (frenzySignal && frenzySignal > 0 && sceneRef.current) {
      sceneRef.current.triggerGoldenFrenzy(20);
    }
  }, [frenzySignal]);

  // Handle mobile waddle signals
  useEffect(() => {
    if (!waddleSignal || !sceneRef.current) return;
    if (waddleSignal.direction === "left") {
      sceneRef.current.waddleLeft();
    } else if (waddleSignal.direction === "right") {
      sceneRef.current.waddleRight();
    }
  }, [waddleSignal]);

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
      className={`relative mx-auto overflow-hidden rounded-2xl border-2 border-solana-green/30 bg-[#080D1A] shadow-[0_0_35px_rgba(20,241,149,0.15)] flex items-center justify-center ${
        isFullWindow
          ? "w-full h-full max-h-[min(78vh,680px)] aspect-[440/520] max-w-full"
          : "w-full max-w-[440px] aspect-[440/520]"
      }`}
    >
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm gap-3">
          <div className="w-10 h-10 border-4 border-solana-green border-t-transparent rounded-full animate-spin" />
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
