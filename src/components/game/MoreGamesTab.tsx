"use client";

import React, { useState, useEffect, useRef } from "react";
import { sounds } from "../audio/soundEffects";
import {
  Gamepad2,
  Play,
  ExternalLink,
  Sparkles,
  Code2,
  Flame,
  Volume2,
  Trophy,
  RotateCcw,
  Zap,
  Swords,
  Layers,
  Target,
  Shield,
  Heart,
} from "lucide-react";

export const MoreGamesTab: React.FC = () => {
  // Mini-Game 2: Flappy Waddle State
  const [flappyActive, setFlappyActive] = useState(false);
  const [flappyScore, setFlappyScore] = useState(0);
  const [flappyBest, setFlappyBest] = useState(0);
  const [flappyY, setFlappyY] = useState(60);
  const [flappyGameOver, setFlappyGameOver] = useState(false);

  // Mini-Game 3: Mega-FUD Tap Raid State
  const [bossHp, setBossHp] = useState(500);
  const [bossMaxHp] = useState(500);
  const [tapHits, setTapHits] = useState(0);
  const [floatingDamages, setFloatingDamages] = useState<{ id: number; dmg: number; x: number; y: number }[]>([]);

  // Mini-Game 4: NomBeats Soundboard
  const [activeBeat, setActiveBeat] = useState<string | null>(null);

  // Mini-Game 5: Nomster Candy Hopper
  const [hopperScore, setHopperScore] = useState(0);
  const [hopperBest, setHopperBest] = useState(0);
  const [hopperActive, setHopperActive] = useState(false);
  const [hopperX, setHopperX] = useState(50);
  const [hopperPlatformX, setHopperPlatformX] = useState(50);

  // Mini-Game 6: Nom Invaders Space Arcade
  const [invadersScore, setInvadersScore] = useState(0);
  const [invadersBest, setInvadersBest] = useState(0);
  const [invadersActive, setInvadersActive] = useState(false);
  const [invaderPlayerX, setInvaderPlayerX] = useState(50);
  const [invaders, setInvaders] = useState<{ id: number; x: number; y: number; alive: boolean }[]>([
    { id: 1, x: 18, y: 22, alive: true },
    { id: 2, x: 34, y: 22, alive: true },
    { id: 3, x: 50, y: 22, alive: true },
    { id: 4, x: 66, y: 22, alive: true },
    { id: 5, x: 82, y: 22, alive: true },
    { id: 6, x: 26, y: 48, alive: true },
    { id: 7, x: 42, y: 48, alive: true },
    { id: 8, x: 58, y: 48, alive: true },
    { id: 9, x: 74, y: 48, alive: true },
  ]);
  const [invaderLasers, setInvaderLasers] = useState<{ id: number; x: number; y: number }[]>([]);

  // Nom Invaders Laser & Collision Engine
  useEffect(() => {
    if (!invadersActive) return;
    const interval = setInterval(() => {
      setInvaderLasers((prevLasers) => {
        if (prevLasers.length === 0) return prevLasers;
        const updated = prevLasers
          .map((l) => ({ ...l, y: l.y - 10 }))
          .filter((l) => l.y > 0);

        setInvaders((prevInv) => {
          let hits = 0;
          const nextInv = prevInv.map((inv) => {
            if (!inv.alive) return inv;
            const isHit = updated.some((l) => Math.abs(l.x - inv.x) < 8 && Math.abs(l.y - inv.y) < 14);
            if (isHit) {
              hits++;
              return { ...inv, alive: false };
            }
            return inv;
          });

          if (hits > 0) {
            sounds.playFUDHit();
            setInvadersScore((s) => {
              const ns = s + hits * 25;
              if (ns > invadersBest) setInvadersBest(ns);
              return ns;
            });
            if (nextInv.every((i) => !i.alive)) {
              sounds.playGoldenChime();
              setTimeout(() => {
                setInvaders([
                  { id: 1, x: 18, y: 22, alive: true },
                  { id: 2, x: 34, y: 22, alive: true },
                  { id: 3, x: 50, y: 22, alive: true },
                  { id: 4, x: 66, y: 22, alive: true },
                  { id: 5, x: 82, y: 22, alive: true },
                  { id: 6, x: 26, y: 48, alive: true },
                  { id: 7, x: 42, y: 48, alive: true },
                  { id: 8, x: 58, y: 48, alive: true },
                  { id: 9, x: 74, y: 48, alive: true },
                ]);
              }, 400);
            }
          }
          return nextInv;
        });

        return updated.filter(
          (l) => !invaders.some((inv) => inv.alive && Math.abs(l.x - inv.x) < 8 && Math.abs(l.y - inv.y) < 14)
        );
      });
    }, 45);

    return () => clearInterval(interval);
  }, [invadersActive, invaders, invadersBest]);

  const handleFireInvaderLaser = () => {
    sounds.playLaser();
    setInvadersActive(true);
    setInvaderLasers((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), x: invaderPlayerX, y: 110 },
    ]);
  };

  const handleMoveInvaderPlayer = (dir: "left" | "right") => {
    setInvadersActive(true);
    setInvaderPlayerX((prev) => (dir === "left" ? Math.max(12, prev - 12) : Math.min(88, prev + 12)));
  };

  // Mini-Game 7: Cyber Snake
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([
    { x: 5, y: 5 },
    { x: 5, y: 6 },
    { x: 5, y: 7 },
  ]);
  const [snakeDir, setSnakeDir] = useState<"UP" | "DOWN" | "LEFT" | "RIGHT">("UP");
  const [snakeFood, setSnakeFood] = useState<{ x: number; y: number }>({ x: 3, y: 3 });
  const [snakeActive, setSnakeActive] = useState(false);
  const [snakeGameOver, setSnakeGameOver] = useState(false);
  const [snakeScore, setSnakeScore] = useState(0);
  const [snakeBest, setSnakeBest] = useState(0);

  const resetSnakeGame = () => {
    setSnake([
      { x: 5, y: 5 },
      { x: 5, y: 6 },
      { x: 5, y: 7 },
    ]);
    setSnakeDir("UP");
    setSnakeFood({ x: Math.floor(Math.random() * 10) + 1, y: Math.floor(Math.random() * 10) + 1 });
    setSnakeGameOver(false);
    setSnakeScore(0);
    setSnakeActive(true);
  };

  useEffect(() => {
    if (!snakeActive || snakeGameOver) return;
    const interval = setInterval(() => {
      setSnake((prev) => {
        const head = { ...prev[0] };
        if (snakeDir === "UP") head.y -= 1;
        if (snakeDir === "DOWN") head.y += 1;
        if (snakeDir === "LEFT") head.x -= 1;
        if (snakeDir === "RIGHT") head.x += 1;

        if (head.x < 0 || head.x >= 12 || head.y < 0 || head.y >= 12) {
          setSnakeGameOver(true);
          sounds.playFUDHit();
          return prev;
        }

        if (prev.some((seg) => seg.x === head.x && seg.y === head.y)) {
          setSnakeGameOver(true);
          sounds.playFUDHit();
          return prev;
        }

        if (head.x === snakeFood.x && head.y === snakeFood.y) {
          sounds.playNom();
          setSnakeScore((s) => {
            const ns = s + 10;
            if (ns > snakeBest) setSnakeBest(ns);
            return ns;
          });
          setSnakeFood({
            x: Math.floor(Math.random() * 11),
            y: Math.floor(Math.random() * 11),
          });
          return [head, ...prev];
        }

        return [head, ...prev.slice(0, -1)];
      });
    }, 160);

    return () => clearInterval(interval);
  }, [snakeActive, snakeGameOver, snakeDir, snakeFood, snakeBest]);

  // Mini-Game 8: Candy Breakout
  const [breakoutActive, setBreakoutActive] = useState(false);
  const [breakoutGameOver, setBreakoutGameOver] = useState(false);
  const [breakoutScore, setBreakoutScore] = useState(0);
  const [breakoutBest, setBreakoutBest] = useState(0);
  const [breakoutPaddleX, setBreakoutPaddleX] = useState(50);
  const [breakoutBall, setBreakoutBall] = useState({ x: 50, y: 70, vx: 2, vy: -2.5 });
  const [breakoutBricks, setBreakoutBricks] = useState<{ id: number; alive: boolean; color: string }[]>([
    { id: 0, alive: true, color: "#14F195" },
    { id: 1, alive: true, color: "#38BDF8" },
    { id: 2, alive: true, color: "#F59E0B" },
    { id: 3, alive: true, color: "#EC4899" },
    { id: 4, alive: true, color: "#14F195" },
    { id: 5, alive: true, color: "#38BDF8" },
    { id: 6, alive: true, color: "#F59E0B" },
    { id: 7, alive: true, color: "#EC4899" },
  ]);

  const resetBreakout = () => {
    setBreakoutPaddleX(50);
    setBreakoutBall({ x: 50, y: 70, vx: 2, vy: -2.5 });
    setBreakoutBricks((prev) => prev.map((b) => ({ ...b, alive: true })));
    setBreakoutGameOver(false);
    setBreakoutScore(0);
    setBreakoutActive(true);
  };

  useEffect(() => {
    if (!breakoutActive || breakoutGameOver) return;
    const interval = setInterval(() => {
      setBreakoutBall((prev) => {
        let nextX = prev.x + prev.vx;
        let nextY = prev.y + prev.vy;
        let nextVx = prev.vx;
        let nextVy = prev.vy;

        if (nextX <= 4 || nextX >= 96) {
          nextVx = -nextVx;
          sounds.playButtonClick();
        }
        if (nextY <= 4) {
          nextVy = -nextVy;
          sounds.playButtonClick();
        }

        if (nextY >= 82 && nextY <= 88 && Math.abs(nextX - breakoutPaddleX) < 18) {
          nextVy = -Math.abs(nextVy);
          nextVx = (nextX - breakoutPaddleX) * 0.25;
          sounds.playJumpSound();
        }

        if (nextY >= 96) {
          setBreakoutGameOver(true);
          sounds.playFUDHit();
          return prev;
        }

        if (nextY <= 45) {
          const col = Math.floor(nextX / 25);
          const row = Math.floor(nextY / 22);
          const idx = row * 4 + col;
          if (idx >= 0 && idx < 8) {
            setBreakoutBricks((bList) => {
              if (bList[idx] && bList[idx].alive) {
                sounds.playNom();
                setBreakoutScore((s) => {
                  const ns = s + 15;
                  if (ns > breakoutBest) setBreakoutBest(ns);
                  return ns;
                });
                nextVy = -nextVy;
                const nextB = [...bList];
                nextB[idx] = { ...nextB[idx], alive: false };
                if (nextB.every((b) => !b.alive)) {
                  sounds.playGoldenChime();
                  setTimeout(() => {
                    setBreakoutBricks((b) => b.map((item) => ({ ...item, alive: true })));
                  }, 400);
                }
                return nextB;
              }
              return bList;
            });
          }
        }

        return { x: nextX, y: nextY, vx: nextVx, vy: nextVy };
      });
    }, 40);

    return () => clearInterval(interval);
  }, [breakoutActive, breakoutGameOver, breakoutPaddleX, breakoutBest]);

  // Mini-Game 9: Nom Runner
  const [runnerActive, setRunnerActive] = useState(false);
  const [runnerGameOver, setRunnerGameOver] = useState(false);
  const [runnerScore, setRunnerScore] = useState(0);
  const [runnerBest, setRunnerBest] = useState(0);
  const [runnerY, setRunnerY] = useState(0);
  const [runnerObstacleX, setRunnerObstacleX] = useState(100);

  const handleRunnerJump = () => {
    if (!runnerActive || runnerGameOver) {
      setRunnerActive(true);
      setRunnerGameOver(false);
      setRunnerScore(0);
      setRunnerObstacleX(100);
      setRunnerY(0);
      return;
    }
    if (runnerY === 0) {
      sounds.playJumpSound();
      setRunnerY(38);
      setTimeout(() => setRunnerY(0), 450);
    }
  };

  useEffect(() => {
    if (!runnerActive || runnerGameOver) return;
    const interval = setInterval(() => {
      setRunnerObstacleX((prev) => {
        if (prev <= -10) {
          setRunnerScore((s) => {
            const ns = s + 10;
            if (ns > runnerBest) setRunnerBest(ns);
            return ns;
          });
          return 100;
        }

        if (prev >= 14 && prev <= 26 && runnerY < 20) {
          setRunnerGameOver(true);
          sounds.playFUDHit();
          return prev;
        }

        return prev - 4;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [runnerActive, runnerGameOver, runnerY, runnerBest]);

  // Mini-Game 10: Whack-A-FUD
  const [whackActive, setWhackActive] = useState(false);
  const [whackScore, setWhackScore] = useState(0);
  const [whackBest, setWhackBest] = useState(0);
  const [whackHoles, setWhackHoles] = useState<(string | null)[]>(Array(9).fill(null));

  const startWhackGame = () => {
    setWhackScore(0);
    setWhackActive(true);
    setWhackHoles(Array(9).fill(null));
    sounds.playGoldenChime();
  };

  useEffect(() => {
    if (!whackActive) return;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * 9);
      const types = ["bear", "candy", "bear", "bomb"];
      const type = types[Math.floor(Math.random() * types.length)];
      setWhackHoles((prev) => {
        const next = [...prev];
        next[randomIdx] = type;
        return next;
      });

      setTimeout(() => {
        setWhackHoles((prev) => {
          const next = [...prev];
          next[randomIdx] = null;
          return next;
        });
      }, 850);
    }, 700);

    return () => clearInterval(interval);
  }, [whackActive]);

  const handleWhack = (index: number) => {
    const item = whackHoles[index];
    if (!item) return;

    if (item === "bear") {
      sounds.playBossHit();
      setWhackScore((s) => {
        const ns = s + 20;
        if (ns > whackBest) setWhackBest(ns);
        return ns;
      });
    } else if (item === "candy") {
      sounds.playNom();
      setWhackScore((s) => {
        const ns = s + 10;
        if (ns > whackBest) setWhackBest(ns);
        return ns;
      });
    } else if (item === "bomb") {
      sounds.playFUDHit();
      setWhackScore((s) => Math.max(0, s - 15));
    }

    setWhackHoles((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  // Flappy gravity loop
  useEffect(() => {
    if (!flappyActive || flappyGameOver) return;
    const interval = setInterval(() => {
      setFlappyY((prev) => {
        const next = prev + 4;
        if (next >= 120) {
          setFlappyGameOver(true);
          sounds.playFUDHit();
          return 120;
        }
        return next;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [flappyActive, flappyGameOver]);

  const handleFlappyJump = () => {
    if (!flappyActive) {
      setFlappyActive(true);
      setFlappyGameOver(false);
      setFlappyScore(0);
      setFlappyY(40);
    } else if (flappyGameOver) {
      setFlappyGameOver(false);
      setFlappyScore(0);
      setFlappyY(40);
    } else {
      setFlappyY((prev) => Math.max(10, prev - 24));
      setFlappyScore((prev) => {
        const next = prev + 1;
        if (next > flappyBest) setFlappyBest(next);
        return next;
      });
      sounds.playNom();
    }
  };

  const handleTapBoss = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = typeof e.clientX === "number" && e.clientX > 0 ? e.clientX - rect.left : rect.width / 2;
    const y = typeof e.clientY === "number" && e.clientY > 0 ? e.clientY - rect.top : rect.height / 2;

    const dmg = Math.floor(Math.random() * 15) + 10;
    sounds.playBossHit();
    setTapHits((prev) => prev + 1);
    setBossHp((prev) => {
      const next = Math.max(0, prev - dmg);
      if (next === 0) {
        sounds.playGoldenChime();
      }
      return next;
    });

    const newFloating = { id: Date.now() + Math.random(), dmg, x, y };
    setFloatingDamages((prev) => [...prev.slice(-6), newFloating]);
  };

  const playBeatSound = (type: string) => {
    setActiveBeat(type);
    setTimeout(() => setActiveBeat(null), 250);

    switch (type) {
      case "laser":
        sounds.playBossHit();
        break;
      case "nom":
        sounds.playNom();
        break;
      case "chime":
        sounds.playGoldenChime();
        break;
      case "bomb":
        sounds.playFUDHit();
        break;
      default:
        sounds.playNom();
    }
  };

  const handleHopperBounce = (direction: "left" | "right") => {
    sounds.playJumpSound();
    setHopperActive(true);
    const newX = direction === "left" ? Math.max(15, hopperX - 25) : Math.min(85, hopperX + 25);
    setHopperX(newX);

    const newPlatform = Math.floor(Math.random() * 60) + 20;
    setHopperPlatformX(newPlatform);

    setHopperScore((prev) => {
      const next = prev + 10;
      if (next > hopperBest) setHopperBest(next);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <span>NomVerse Arcade Commons</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Community Sandbox
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Play community-crafted mini-games, test indie engine prototypes, or build your own with our CC0 open-source starter.
          </p>
        </div>

        <a
          href="https://github.com/jsepkt/nomverse"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all shrink-0 hover:scale-105"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Fork Game Starter</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Grid of Mini-Games */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GAME 1: Primary Nomster Candy Catcher */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-950 border border-emerald-500/40 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                Flagship Arcade
              </span>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                Active in Console
              </span>
            </div>

            <div>
              <h4 className="text-lg font-black text-white flex items-center gap-2">
                <span>Nomster Candy Catcher</span>
                <span className="text-lg">🍬</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                The core high-precision physics arcade experience. Catch falling candles, evade red glitch bombs, trigger NOM-RAGE fever overdrive, and unlock community skins.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-center">
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[9px] text-slate-400">ENGINE</div>
                <div className="text-xs font-bold text-white">Phaser 3</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[9px] text-slate-400">LIVES</div>
                <div className="text-xs font-bold text-pink-400">5 Hearts</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[9px] text-slate-400">FPS</div>
                <div className="text-xs font-bold text-emerald-400">60 Native</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Playing in left panel</span>
            <span className="text-emerald-400 font-bold">100% CC0 Public Domain</span>
          </div>
        </div>

        {/* GAME 2: Nomster Flappy Waddle (Playable Interactive Prototype) */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/30">
                Community Prototype #1
              </span>
              <span className="text-xs font-mono text-amber-400 font-bold flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" /> Best: {flappyBest}
              </span>
            </div>

            <div>
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <span>Nomster Flappy Waddle</span>
                <span className="text-lg">🪽</span>
              </h4>
              <p className="text-xs text-slate-400">
                Tap to flap! Keep Nomster airborne above the candlestick obstacles.
              </p>
            </div>

            {/* Interactive Flappy Arena */}
            <div
              onClick={handleFlappyJump}
              className="relative w-full h-36 rounded-xl bg-[#081020] border border-cyan-500/30 overflow-hidden cursor-pointer flex flex-col items-center justify-between p-2 select-none"
            >
              {/* Score HUD */}
              <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400 z-10">
                <span>TAP TO FLAP</span>
                <span className="text-lg font-black font-mono text-cyan-300">{flappyScore}</span>
              </div>

              {/* Character */}
              <div
                className="absolute left-1/2 -translate-x-1/2 text-2xl transition-all duration-75"
                style={{ top: `${flappyY}px` }}
              >
                🦆
              </div>

              {/* Ground & Candlesticks Visual */}
              <div className="w-full flex items-end justify-around h-8 border-t border-emerald-500/30 bg-emerald-950/20 z-10">
                <div className="w-3 h-6 bg-emerald-500/40 rounded-t" />
                <div className="w-3 h-4 bg-rose-500/40 rounded-t" />
                <div className="w-3 h-7 bg-emerald-500/40 rounded-t" />
                <div className="w-3 h-5 bg-emerald-500/40 rounded-t" />
              </div>

              {/* Game Over Overlay */}
              {flappyGameOver && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-1 z-20">
                  <span className="text-xs font-mono text-rose-400 font-bold">OOF! BONKED!</span>
                  <span className="text-[10px] font-mono text-slate-300">Tap anywhere to retry</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Contributed by: @pixelnommer</span>
            <button
              onClick={handleFlappyJump}
              className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
            >
              <Play className="w-3 h-3 fill-cyan-400" />
              <span>Flap Jump</span>
            </button>
          </div>
        </div>

        {/* GAME 3: Mega-FUD Tap Raid Boss Clicker */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/30">
                Community Prototype #2
              </span>
              <span className="text-xs font-mono text-rose-400 font-bold">
                {bossHp} / {bossMaxHp} HP
              </span>
            </div>

            <div>
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <span>Lord Mega-FUD Tap Clicker</span>
                <span className="text-lg">👾</span>
              </h4>
              <p className="text-xs text-slate-400">
                Rapid tap battle! Deal rapid damage to banish the FUD monster.
              </p>
            </div>

            {/* Tap Raid Boss Arena */}
            <div className="relative w-full h-36 rounded-xl bg-slate-950/80 border border-rose-500/30 flex flex-col items-center justify-between p-3 select-none overflow-hidden">
              {/* HP Bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-100"
                  style={{ width: `${(bossHp / bossMaxHp) * 100}%` }}
                />
              </div>

              {/* Tap Target Button */}
              <button
                onClick={handleTapBoss}
                className="w-16 h-16 rounded-2xl bg-rose-500/15 border-2 border-rose-500/50 hover:border-rose-400 flex items-center justify-center text-3xl transition-transform active:scale-90 hover:scale-105 shadow-[0_0_20px_rgba(244,63,94,0.3)] relative"
              >
                👾
                {/* Floating Damage Numbers */}
                {floatingDamages.map((item) => (
                  <span
                    key={item.id}
                    className="absolute text-xs font-mono font-black text-amber-300 pointer-events-none animate-ping"
                    style={{ left: `${item.x}px`, top: `${item.y}px` }}
                  >
                    -{item.dmg}
                  </span>
                ))}
              </button>

              <div className="text-[10px] font-mono text-slate-400">
                {bossHp === 0 ? "🎉 VICTORY! Boss banishment complete!" : `Total Attacks: ${tapHits}`}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Contributed by: @solslayer</span>
            <button
              onClick={() => {
                setBossHp(500);
                setTapHits(0);
                sounds.playGoldenChime();
              }}
              className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Boss</span>
            </button>
          </div>
        </div>

        {/* GAME 4: NomBeats 8-Bit Chiptune Jam */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/30">
                Community Prototype #3
              </span>
              <span className="text-xs font-mono text-purple-400 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5" /> Web Audio Synth
              </span>
            </div>

            <div>
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <span>NomBeats Rhythm Jam</span>
                <span className="text-lg">🎹</span>
              </h4>
              <p className="text-xs text-slate-400">
                Zero-asset 8-bit soundboard. Tap live synth pads to create arcade riffs.
              </p>
            </div>

            {/* Soundboard Pads */}
            <div className="grid grid-cols-2 gap-2 h-36">
              <button
                onClick={() => playBeatSound("nom")}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                  activeBeat === "nom"
                    ? "bg-emerald-500/30 border-emerald-400 text-emerald-300 scale-95"
                    : "bg-slate-950/60 border-slate-800 hover:border-emerald-500/40 text-slate-200"
                }`}
              >
                <span className="text-xl">🍬</span>
                <span className="text-[10px] font-mono font-bold uppercase">Nom Pop</span>
              </button>

              <button
                onClick={() => playBeatSound("laser")}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                  activeBeat === "laser"
                    ? "bg-cyan-500/30 border-cyan-400 text-cyan-300 scale-95"
                    : "bg-slate-950/60 border-slate-800 hover:border-cyan-500/40 text-slate-200"
                }`}
              >
                <span className="text-xl">⚡</span>
                <span className="text-[10px] font-mono font-bold uppercase">Laser Zap</span>
              </button>

              <button
                onClick={() => playBeatSound("chime")}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                  activeBeat === "chime"
                    ? "bg-amber-500/30 border-amber-400 text-amber-300 scale-95"
                    : "bg-slate-950/60 border-slate-800 hover:border-amber-500/40 text-slate-200"
                }`}
              >
                <span className="text-xl">🌟</span>
                <span className="text-[10px] font-mono font-bold uppercase">Gold Chime</span>
              </button>

              <button
                onClick={() => playBeatSound("bomb")}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
                  activeBeat === "bomb"
                    ? "bg-rose-500/30 border-rose-400 text-rose-300 scale-95"
                    : "bg-slate-950/60 border-slate-800 hover:border-rose-500/40 text-slate-200"
                }`}
              >
                <span className="text-xl">💣</span>
                <span className="text-[10px] font-mono font-bold uppercase">FUD Boom</span>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Contributed by: @synthsol</span>
            <span className="text-purple-400 font-bold">Pure Synthesized Audio</span>
          </div>
        </div>

        {/* GAME 5: Nomster Candy Hopper (Doodle Jump Style) */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between md:col-span-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                Community Prototype #4
              </span>
              <span className="text-xs font-mono text-amber-300 flex items-center gap-1 font-bold">
                <Trophy className="w-3.5 h-3.5" /> High Score: {hopperBest}
              </span>
            </div>

            <div>
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <span>Nomster Candy Hopper</span>
                <span className="text-lg">🍬</span>
              </h4>
              <p className="text-xs text-slate-400">
                Endless vertical hopper! Tap left or right to guide Nomster onto bouncing candy clouds.
              </p>
            </div>

            {/* Hopper Arena */}
            <div className="relative w-full h-40 rounded-xl bg-slate-950/80 border border-amber-500/30 flex flex-col items-center justify-between p-3 select-none overflow-hidden">
              {/* Score HUD */}
              <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400 z-10">
                <span>HEIGHT: <strong className="text-amber-300">{hopperScore}m</strong></span>
                <span className="text-[10px] text-emerald-400 font-bold">+10 $NOM BURN PER 100m</span>
              </div>

              {/* Moving Candy Platform */}
              <div
                className="absolute h-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-300"
                style={{
                  left: `${hopperPlatformX - 15}%`,
                  width: "30%",
                  bottom: "35px",
                }}
              />

              {/* Bouncing Nomster Character */}
              <div
                className="absolute text-2xl transition-all duration-200 animate-bounce"
                style={{
                  left: `${hopperX}%`,
                  bottom: "45px",
                }}
              >
                😋
              </div>

              {/* Steer Controls */}
              <div className="w-full flex items-center justify-between gap-3 pt-2 z-10">
                <button
                  onClick={() => handleHopperBounce("left")}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-mono font-bold text-xs border border-slate-700 transition-all flex items-center justify-center gap-1"
                >
                  <span>◀ HOP LEFT</span>
                </button>
                <button
                  onClick={() => handleHopperBounce("right")}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-mono font-bold text-xs border border-slate-700 transition-all flex items-center justify-center gap-1"
                >
                  <span>HOP RIGHT ▶</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Contributed by: @nomster_dev</span>
            <span className="text-amber-400 font-bold">1% Arcade Burn Active</span>
          </div>
        </div>

        {/* GAME 6: Nom Invaders (Space Invaders Retro Shoot'Em Up) */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between md:col-span-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                Community Prototype #5
              </span>
              <span className="text-xs font-mono text-emerald-300 flex items-center gap-1 font-bold">
                <Trophy className="w-3.5 h-3.5" /> High Score: {invadersBest}
              </span>
            </div>

            <div>
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <span>Nom Invaders (Retro Space Arcade)</span>
                <span className="text-lg">👾</span>
              </h4>
              <p className="text-xs text-slate-400">
                Retro 80s arcade shoot&apos;em up! Slide Nomster left and right to blast incoming red FUD aliens with green candle laser bolts.
              </p>
            </div>

            {/* Invaders Arena */}
            <div className="relative w-full h-44 rounded-xl bg-slate-950/90 border border-emerald-500/30 flex flex-col items-center justify-between p-3 select-none overflow-hidden">
              {/* Score HUD */}
              <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400 z-10">
                <span>SCORE: <strong className="text-emerald-400">{invadersScore}</strong></span>
                <span className="text-[10px] text-emerald-300 font-bold">50 $NOM BURN PER WAVE</span>
              </div>

              {/* Descending Invaders Grid */}
              <div className="absolute inset-0 pointer-events-none">
                {invaders.map((inv) =>
                  inv.alive ? (
                    <span
                      key={inv.id}
                      className="absolute text-lg transition-transform duration-200"
                      style={{ left: `${inv.x}%`, top: `${inv.y}px`, transform: "translate(-50%, -50%)" }}
                    >
                      👾
                    </span>
                  ) : null
                )}

                {/* Laser Bolts */}
                {invaderLasers.map((l) => (
                  <div
                    key={l.id}
                    className="absolute w-1.5 h-4 bg-emerald-400 rounded-full shadow-[0_0_8px_#14f195]"
                    style={{ left: `${l.x}%`, top: `${l.y}px`, transform: "translate(-50%, -50%)" }}
                  />
                ))}

                {/* Player Cannon */}
                <div
                  className="absolute bottom-12 text-2xl transition-all duration-75"
                  style={{ left: `${invaderPlayerX}%`, transform: "translateX(-50%)" }}
                >
                  🚀
                </div>
              </div>

              {/* Action Controls */}
              <div className="w-full flex items-center justify-between gap-2 pt-2 z-10 mt-auto">
                <button
                  onClick={() => handleMoveInvaderPlayer("left")}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-mono font-bold text-xs border border-slate-700 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>◀ LEFT</span>
                </button>

                <button
                  onClick={handleFireInvaderLaser}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 active:scale-95 text-slate-950 font-mono font-black text-xs shadow-[0_0_15px_rgba(20,241,149,0.4)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 fill-slate-950" />
                  <span>FIRE LASER!</span>
                </button>

                <button
                  onClick={() => handleMoveInvaderPlayer("right")}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-mono font-bold text-xs border border-slate-700 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>RIGHT ▶</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Contributed by: @retro_sol</span>
            <span className="text-emerald-400 font-bold">100% CC0 Public Domain</span>
          </div>
        </div>

        {/* GAME 7: Cyber Snake */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                Community Prototype #6
              </span>
              <span className="text-xs font-mono text-emerald-300 flex items-center gap-1 font-bold">
                <Trophy className="w-3.5 h-3.5" /> High Score: {snakeBest}
              </span>
            </div>

            <div>
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <span>Cyber Snake</span>
                <span className="text-lg">🐍</span>
              </h4>
              <p className="text-xs text-slate-400">
                Classic retro Nokia snake! Slither around the cyber grid eating candies and growing your tail.
              </p>
            </div>

            {/* Snake Arena (12x12 grid) */}
            <div className="relative w-full h-44 rounded-xl bg-slate-950/90 border border-emerald-500/30 flex flex-col items-center justify-between p-2 select-none overflow-hidden">
              <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400 z-10 px-1">
                <span>LENGTH: <strong className="text-emerald-400">{snake.length}</strong></span>
                <span>SCORE: <strong className="text-emerald-300">{snakeScore}</strong></span>
              </div>

              {/* Grid Canvas */}
              <div className="relative w-28 h-28 border border-emerald-500/20 bg-slate-950/80 rounded-lg overflow-hidden my-auto">
                {/* Food */}
                <div
                  className="absolute w-[8.33%] h-[8.33%] bg-amber-400 rounded-full shadow-[0_0_8px_#f59e0b] animate-ping"
                  style={{ left: `${snakeFood.x * 8.33}%`, top: `${snakeFood.y * 8.33}%` }}
                />
                <div
                  className="absolute w-[8.33%] h-[8.33%] bg-amber-300 rounded-full"
                  style={{ left: `${snakeFood.x * 8.33}%`, top: `${snakeFood.y * 8.33}%` }}
                />

                {/* Snake Segments */}
                {snake.map((seg, idx) => (
                  <div
                    key={idx}
                    className={`absolute w-[8.33%] h-[8.33%] rounded-sm ${
                      idx === 0
                        ? "bg-emerald-400 shadow-[0_0_6px_#14f195] z-10"
                        : "bg-emerald-600/90"
                    }`}
                    style={{ left: `${seg.x * 8.33}%`, top: `${seg.y * 8.33}%` }}
                  />
                ))}

                {/* Game Over Banner */}
                {snakeGameOver && (
                  <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center gap-1 z-20">
                    <span className="text-[11px] font-mono text-rose-400 font-bold">GAME OVER!</span>
                    <button
                      onClick={resetSnakeGame}
                      className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-mono text-[10px] font-bold cursor-pointer"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>

              {/* D-Pad Steering */}
              <div className="w-full flex items-center justify-between gap-1 pt-1 z-10">
                <button
                  onClick={() => { setSnakeDir("LEFT"); setSnakeActive(true); }}
                  className="flex-1 py-1 px-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold cursor-pointer"
                >
                  ◀
                </button>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => { setSnakeDir("UP"); setSnakeActive(true); }}
                    className="py-1 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold cursor-pointer"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => { setSnakeDir("DOWN"); setSnakeActive(true); }}
                    className="py-1 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold cursor-pointer"
                  >
                    ▼
                  </button>
                </div>
                <button
                  onClick={() => { setSnakeDir("RIGHT"); setSnakeActive(true); }}
                  className="flex-1 py-1 px-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold cursor-pointer"
                >
                  ▶
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Contributed by: @cyber_snake</span>
            <button
              onClick={resetSnakeGame}
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{snakeActive ? "Restart" : "Start"}</span>
            </button>
          </div>
        </div>

        {/* GAME 8: Candy Breakout */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/30">
                Community Prototype #7
              </span>
              <span className="text-xs font-mono text-cyan-300 flex items-center gap-1 font-bold">
                <Trophy className="w-3.5 h-3.5" /> High Score: {breakoutBest}
              </span>
            </div>

            <div>
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <span>Candy Breakout</span>
                <span className="text-lg">🧱</span>
              </h4>
              <p className="text-xs text-slate-400">
                Retro Arkanoid brick smasher! Slide the paddle to bounce the crypto orb into candy bricks.
              </p>
            </div>

            {/* Breakout Arena */}
            <div className="relative w-full h-44 rounded-xl bg-slate-950/90 border border-cyan-500/30 flex flex-col items-center justify-between p-2 select-none overflow-hidden">
              <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400 z-10">
                <span>SCORE: <strong className="text-cyan-400">{breakoutScore}</strong></span>
                <span className="text-[10px] text-cyan-300 font-bold">15 $NOM PER BRICK</span>
              </div>

              {/* Bricks Grid */}
              <div className="w-full grid grid-cols-4 gap-1.5 px-2 pt-1">
                {breakoutBricks.map((b) => (
                  <div
                    key={b.id}
                    className={`h-3 rounded-md transition-all ${
                      b.alive
                        ? "shadow-sm border border-white/20"
                        : "opacity-0 scale-50 pointer-events-none"
                    }`}
                    style={{ backgroundColor: b.color }}
                  />
                ))}
              </div>

              {/* Bouncing Ball */}
              <div
                className="absolute w-3 h-3 bg-white rounded-full shadow-[0_0_8px_#38bdf8] pointer-events-none"
                style={{
                  left: `${breakoutBall.x}%`,
                  top: `${breakoutBall.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />

              {/* Paddle */}
              <div
                className="absolute bottom-11 h-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                style={{
                  left: `${breakoutPaddleX - 12}%`,
                  width: "24%",
                }}
              />

              {/* Game Over Banner */}
              {breakoutGameOver && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center gap-1 z-20">
                  <span className="text-xs font-mono text-rose-400 font-bold">BALL DROPPED!</span>
                  <button
                    onClick={resetBreakout}
                    className="px-3 py-1 rounded bg-cyan-500 text-slate-950 font-mono text-xs font-bold cursor-pointer"
                  >
                    Play Again
                  </button>
                </div>
              )}

              {/* Paddle Controls */}
              <div className="w-full flex items-center justify-between gap-2 pt-2 z-10 mt-auto">
                <button
                  onClick={() => { setBreakoutActive(true); setBreakoutPaddleX((p) => Math.max(15, p - 14)); }}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-xs cursor-pointer"
                >
                  ◀ SLIDE LEFT
                </button>
                <button
                  onClick={() => { setBreakoutActive(true); setBreakoutPaddleX((p) => Math.min(85, p + 14)); }}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-xs cursor-pointer"
                >
                  SLIDE RIGHT ▶
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Contributed by: @arkanom</span>
            <button
              onClick={resetBreakout}
              className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{breakoutActive ? "Reset" : "Launch"}</span>
            </button>
          </div>
        </div>

        {/* GAME 9: Nom Runner */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                Community Prototype #8
              </span>
              <span className="text-xs font-mono text-amber-300 flex items-center gap-1 font-bold">
                <Trophy className="w-3.5 h-3.5" /> High Score: {runnerBest}
              </span>
            </div>

            <div>
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <span>Nom Runner (Chrome Dino)</span>
                <span className="text-lg">🏃</span>
              </h4>
              <p className="text-xs text-slate-400">
                Infinite side-scrolling runner! Tap to jump over oncoming red FUD cactus spikes.
              </p>
            </div>

            {/* Runner Arena */}
            <div className="relative w-full h-44 rounded-xl bg-slate-950/90 border border-amber-500/30 flex flex-col items-center justify-between p-3 select-none overflow-hidden">
              <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400 z-10">
                <span>DISTANCE: <strong className="text-amber-400">{runnerScore}m</strong></span>
                <span className="text-[10px] text-amber-300 font-bold">SPEED: 1.2X</span>
              </div>

              {/* Running Nomster */}
              <div
                className="absolute text-2xl transition-all duration-150"
                style={{
                  left: "20%",
                  bottom: `${30 + runnerY}px`,
                }}
              >
                🦖
              </div>

              {/* Approaching FUD Cactus Obstacle */}
              <div
                className="absolute text-2xl transition-all duration-75"
                style={{
                  left: `${runnerObstacleX}%`,
                  bottom: "30px",
                }}
              >
                🌵
              </div>

              {/* Ground Strip */}
              <div className="absolute bottom-6 left-0 right-0 h-1 bg-amber-500/40" />

              {/* Game Over Banner */}
              {runnerGameOver && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center gap-1 z-20">
                  <span className="text-xs font-mono text-rose-400 font-bold">BONKED ON FUD!</span>
                  <button
                    onClick={handleRunnerJump}
                    className="px-3 py-1 rounded bg-amber-500 text-slate-950 font-mono text-xs font-bold cursor-pointer"
                  >
                    Tap to Retry
                  </button>
                </div>
              )}

              {/* Jump Trigger Button */}
              <button
                onClick={handleRunnerJump}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 hover:from-amber-400 hover:to-orange-300 active:scale-95 text-slate-950 font-mono font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer z-10 mt-auto"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>TAP TO JUMP!</span>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Contributed by: @dino_nom</span>
            <span className="text-amber-400 font-bold">Infinite Procedural Track</span>
          </div>
        </div>

        {/* GAME 10: Whack-A-FUD */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/30">
                Community Prototype #9
              </span>
              <span className="text-xs font-mono text-rose-300 flex items-center gap-1 font-bold">
                <Trophy className="w-3.5 h-3.5" /> High Score: {whackBest}
              </span>
            </div>

            <div>
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <span>Whack-A-FUD Reflex Smash</span>
                <span className="text-lg">🔨</span>
              </h4>
              <p className="text-xs text-slate-400">
                Smash popping FUD bears 🐻 and eat green candies 🍬. Avoid the red bombs 💣!
              </p>
            </div>

            {/* Whack 3x3 Grid */}
            <div className="relative w-full h-44 rounded-xl bg-slate-950/90 border border-rose-500/30 flex flex-col items-center justify-between p-2 select-none overflow-hidden">
              <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400 z-10 px-1">
                <span>SCORE: <strong className="text-rose-400">{whackScore}</strong></span>
                <button
                  onClick={startWhackGame}
                  className="text-[10px] font-mono bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/40 cursor-pointer"
                >
                  {whackActive ? "Active" : "Start Round"}
                </button>
              </div>

              {/* 3x3 Grid Holes */}
              <div className="w-full grid grid-cols-3 gap-2 px-3 py-1">
                {whackHoles.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleWhack(idx)}
                    className="h-8 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 flex items-center justify-center text-lg active:scale-90 transition-transform cursor-pointer"
                  >
                    {item === "bear" && "🐻"}
                    {item === "candy" && "🍬"}
                    {item === "bomb" && "💣"}
                    {!item && "🕳️"}
                  </button>
                ))}
              </div>

              <div className="text-[10px] font-mono text-slate-500 mt-auto">
                🐻 Smash = +20 • 🍬 Eat = +10 • 💣 Bomb = -15
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Contributed by: @hammer_sol</span>
            <span className="text-rose-400 font-bold">Fast-Twitch Reflex</span>
          </div>
        </div>
      </div>
    </div>
  );
};
