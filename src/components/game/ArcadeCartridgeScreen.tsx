"use client";

import React, { useState, useEffect } from "react";
import { sounds } from "../audio/soundEffects";
import {
  Gamepad2,
  Trophy,
  RotateCcw,
  Zap,
  ArrowLeft,
  Sparkles,
  Flame,
  Volume2,
} from "lucide-react";

export type CartridgeGameId =
  | "feed-nomster"
  | "nom-flap"
  | "nom-invaders"
  | "cyber-snake"
  | "candy-breakout"
  | "nom-runner"
  | "candy-hopper"
  | "whack-a-fud"
  | "tap-raid";

export interface CartridgeConfig {
  id: CartridgeGameId;
  name: string;
  icon: string;
  genre: string;
  tagline: string;
  color: string;
}

export const CARTRIDGES: CartridgeConfig[] = [
  { id: "feed-nomster", name: "Feed Nomster", icon: "🍬", genre: "Flagship Physics", tagline: "Catch falling crypto candies!", color: "from-emerald-400 to-teal-400" },
  { id: "nom-flap", name: "Nom Flap", icon: "🦆", genre: "Flappy Arcade", tagline: "Flap through red candlestick market dips!", color: "from-cyan-400 to-blue-400" },
  { id: "nom-invaders", name: "Nom Invaders", icon: "👾", genre: "Space Shooter", tagline: "Blast descending red FUD aliens with lasers!", color: "from-purple-400 to-pink-400" },
  { id: "cyber-snake", name: "Cyber Snake", icon: "🐍", genre: "Retro Nokia Grid", tagline: "Eat candies and expand your green candle tail!", color: "from-emerald-400 to-green-500" },
  { id: "candy-breakout", name: "Candy Breakout", icon: "🧱", genre: "Arkanoid Smasher", tagline: "Bounce the crypto orb into candy bricks!", color: "from-sky-400 to-indigo-400" },
  { id: "nom-runner", name: "Nom Runner", icon: "🏃", genre: "Chrome Dino Highway", tagline: "Jump over red FUD cacti on the Solana highway!", color: "from-amber-400 to-orange-400" },
  { id: "candy-hopper", name: "Candy Hopper", icon: "🦘", genre: "Doodle Platformer", tagline: "Hop up endlessly onto bouncing candy clouds!", color: "from-yellow-400 to-amber-500" },
  { id: "whack-a-fud", name: "Whack-A-FUD", icon: "🔨", genre: "Reflex Hammer Smash", tagline: "Smash FUD bears and avoid volatility bombs!", color: "from-rose-400 to-red-500" },
  { id: "tap-raid", name: "Mega-FUD Tap", icon: "⚔️", genre: "Raid Boss Clicker", tagline: "Rapid-tap attacks to banish Lord Mega-FUD!", color: "from-pink-400 to-purple-500" },
];

interface ArcadeCartridgeScreenProps {
  gameId: CartridgeGameId;
  onSelectGame: (gameId: CartridgeGameId) => void;
  onBackToFeedNomster: () => void;
}

export const ArcadeCartridgeScreen: React.FC<ArcadeCartridgeScreenProps> = ({
  gameId,
  onSelectGame,
  onBackToFeedNomster,
}) => {
  const currentConfig = CARTRIDGES.find((c) => c.id === gameId) || CARTRIDGES[0];

  // ================= 1. NOM FLAP STATE =================
  const [flappyActive, setFlappyActive] = useState(false);
  const [flappyScore, setFlappyScore] = useState(0);
  const [flappyBest, setFlappyBest] = useState(0);
  const [flappyY, setFlappyY] = useState(80);
  const [flappyGameOver, setFlappyGameOver] = useState(false);

  useEffect(() => {
    if (gameId === "feed-nomster") {
      onBackToFeedNomster();
    }
  }, [gameId, onBackToFeedNomster]);

  useEffect(() => {
    if (gameId !== "nom-flap" || !flappyActive || flappyGameOver) return;
    const interval = setInterval(() => {
      setFlappyY((prev) => {
        const next = prev + 5;
        if (next >= 190) {
          setFlappyGameOver(true);
          sounds.playFUDHit();
          return 190;
        }
        return next;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [gameId, flappyActive, flappyGameOver]);

  const handleFlappyJump = () => {
    if (!flappyActive || flappyGameOver) {
      setFlappyActive(true);
      setFlappyGameOver(false);
      setFlappyScore(0);
      setFlappyY(80);
      sounds.playJumpSound();
      return;
    }
    setFlappyY((prev) => Math.max(15, prev - 36));
    setFlappyScore((prev) => {
      const next = prev + 1;
      if (next > flappyBest) setFlappyBest(next);
      return next;
    });
    sounds.playNom();
  };

  // ================= 2. NOM INVADERS STATE =================
  const [invadersScore, setInvadersScore] = useState(0);
  const [invadersBest, setInvadersBest] = useState(0);
  const [invadersActive, setInvadersActive] = useState(false);
  const [invaderPlayerX, setInvaderPlayerX] = useState(50);
  const [invaders, setInvaders] = useState<{ id: number; x: number; y: number; alive: boolean }[]>([
    { id: 1, x: 18, y: 35, alive: true },
    { id: 2, x: 34, y: 35, alive: true },
    { id: 3, x: 50, y: 35, alive: true },
    { id: 4, x: 66, y: 35, alive: true },
    { id: 5, x: 82, y: 35, alive: true },
    { id: 6, x: 26, y: 75, alive: true },
    { id: 7, x: 42, y: 75, alive: true },
    { id: 8, x: 58, y: 75, alive: true },
    { id: 9, x: 74, y: 75, alive: true },
  ]);
  const [invaderLasers, setInvaderLasers] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    if (gameId !== "nom-invaders" || !invadersActive) return;
    const interval = setInterval(() => {
      setInvaderLasers((prevLasers) => {
        if (prevLasers.length === 0) return prevLasers;
        const updated = prevLasers
          .map((l) => ({ ...l, y: l.y - 12 }))
          .filter((l) => l.y > 0);

        setInvaders((prevInv) => {
          let hits = 0;
          const nextInv = prevInv.map((inv) => {
            if (!inv.alive) return inv;
            const isHit = updated.some((l) => Math.abs(l.x - inv.x) < 8 && Math.abs(l.y - inv.y) < 16);
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
                  { id: 1, x: 18, y: 35, alive: true },
                  { id: 2, x: 34, y: 35, alive: true },
                  { id: 3, x: 50, y: 35, alive: true },
                  { id: 4, x: 66, y: 35, alive: true },
                  { id: 5, x: 82, y: 35, alive: true },
                  { id: 6, x: 26, y: 75, alive: true },
                  { id: 7, x: 42, y: 75, alive: true },
                  { id: 8, x: 58, y: 75, alive: true },
                  { id: 9, x: 74, y: 75, alive: true },
                ]);
              }, 400);
            }
          }
          return nextInv;
        });

        return updated.filter(
          (l) => !invaders.some((inv) => inv.alive && Math.abs(l.x - inv.x) < 8 && Math.abs(l.y - inv.y) < 16)
        );
      });
    }, 45);

    return () => clearInterval(interval);
  }, [gameId, invadersActive, invaders, invadersBest]);

  const handleFireInvaderLaser = () => {
    sounds.playLaser();
    setInvadersActive(true);
    setInvaderLasers((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), x: invaderPlayerX, y: 220 },
    ]);
  };

  // ================= 3. CYBER SNAKE STATE =================
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
    if (gameId !== "cyber-snake" || !snakeActive || snakeGameOver) return;
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
    }, 150);

    return () => clearInterval(interval);
  }, [gameId, snakeActive, snakeGameOver, snakeDir, snakeFood, snakeBest]);

  // ================= 4. CANDY BREAKOUT STATE =================
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
    if (gameId !== "candy-breakout" || !breakoutActive || breakoutGameOver) return;
    const interval = setInterval(() => {
      setBreakoutBall((prev) => {
        let nextX = prev.x + prev.vx;
        let nextY = prev.y + prev.vy;
        let nextVx = prev.vx;
        let nextVy = prev.vy;

        if (nextX <= 4 || nextX >= 96) nextVx = -nextVx;
        if (nextY <= 4) nextVy = -nextVy;

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
  }, [gameId, breakoutActive, breakoutGameOver, breakoutPaddleX, breakoutBest]);

  // ================= 5. NOM RUNNER STATE =================
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
      sounds.playJumpSound();
      return;
    }
    if (runnerY === 0) {
      sounds.playJumpSound();
      setRunnerY(42);
      setTimeout(() => setRunnerY(0), 450);
    }
  };

  useEffect(() => {
    if (gameId !== "nom-runner" || !runnerActive || runnerGameOver) return;
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
  }, [gameId, runnerActive, runnerGameOver, runnerY, runnerBest]);

  // ================= 6. CANDY HOPPER STATE =================
  const [hopperScore, setHopperScore] = useState(0);
  const [hopperBest, setHopperBest] = useState(0);
  const [hopperX, setHopperX] = useState(50);
  const [hopperPlatformX, setHopperPlatformX] = useState(50);

  const handleHopperBounce = (dir: "left" | "right") => {
    sounds.playJumpSound();
    setHopperX((prev) => (dir === "left" ? Math.max(15, prev - 25) : Math.min(85, prev + 25)));
    setHopperPlatformX(Math.floor(Math.random() * 60) + 20);
    setHopperScore((s) => {
      const ns = s + 10;
      if (ns > hopperBest) setHopperBest(ns);
      return ns;
    });
  };

  // ================= 7. WHACK-A-FUD STATE =================
  const [whackActive, setWhackActive] = useState(false);
  const [whackScore, setWhackScore] = useState(0);
  const [whackBest, setWhackBest] = useState(0);
  const [whackHoles, setWhackHoles] = useState<(string | null)[]>(Array(9).fill(null));

  useEffect(() => {
    if (gameId !== "whack-a-fud" || !whackActive) return;
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * 9);
      const types = ["bear", "candy", "bear", "bomb"];
      const t = types[Math.floor(Math.random() * types.length)];
      setWhackHoles((prev) => {
        const next = [...prev];
        next[idx] = t;
        return next;
      });
      setTimeout(() => {
        setWhackHoles((prev) => {
          const next = [...prev];
          next[idx] = null;
          return next;
        });
      }, 850);
    }, 700);

    return () => clearInterval(interval);
  }, [gameId, whackActive]);

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

  // ================= 8. MEGA-FUD TAP RAID STATE =================
  const [bossHp, setBossHp] = useState(500);
  const [tapHits, setTapHits] = useState(0);
  const [floatingDamages, setFloatingDamages] = useState<{ id: number; dmg: number; x: number; y: number }[]>([]);

  const handleTapBoss = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = typeof e.clientX === "number" && e.clientX > 0 ? e.clientX - rect.left : rect.width / 2;
    const y = typeof e.clientY === "number" && e.clientY > 0 ? e.clientY - rect.top : rect.height / 2;
    const dmg = Math.floor(Math.random() * 18) + 12;
    sounds.playBossHit();
    setTapHits((prev) => prev + 1);
    setBossHp((prev) => Math.max(0, prev - dmg));
    setFloatingDamages((prev) => [...prev.slice(-6), { id: Date.now() + Math.random(), dmg, x, y }]);
  };

  return (
    <div className="relative w-full h-full min-h-[460px] sm:min-h-[500px] flex flex-col justify-between bg-slate-950 p-3 sm:p-4 rounded-2xl border-2 border-emerald-500/30 overflow-hidden select-none">
      {/* Top Header Deck */}
      <div className="w-full flex items-center justify-between pb-2 border-b border-slate-800/80 gap-2 shrink-0">
        <button
          onClick={onBackToFeedNomster}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-emerald-400 font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Main</span>
        </button>

        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-base">{currentConfig.icon}</span>
          <span className="text-sm font-black font-mono text-white truncate">{currentConfig.name}</span>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold shrink-0">
          60 FPS
        </span>
      </div>

      {/* Main Playable Arena */}
      <div className="relative flex-1 w-full my-2 rounded-xl bg-slate-950/90 border border-slate-800/90 flex flex-col items-center justify-between p-3 overflow-hidden shadow-inner">
        {/* GAME: FEED NOMSTER FALLBACK */}
        {gameId === "feed-nomster" && (
          <div className="relative w-full h-full flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono text-emerald-400">Loading Feed Nomster Flagship...</span>
            <button
              onClick={onBackToFeedNomster}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-mono text-xs font-black cursor-pointer shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              Return to Feed Nomster
            </button>
          </div>
        )}

        {/* GAME: NOM FLAP */}
        {gameId === "nom-flap" && (
          <div className="relative w-full h-full flex flex-col justify-between">
            <div className="w-full flex items-center justify-between text-xs font-mono text-slate-300 z-10">
              <span>SCORE: <strong className="text-cyan-400">{flappyScore}</strong></span>
              <span className="text-amber-300 font-bold">BEST: {flappyBest}</span>
            </div>

            <div
              className="absolute left-1/2 -translate-x-1/2 text-3xl transition-all duration-75 select-none"
              style={{ top: `${flappyY}px` }}
            >
              🦆
            </div>

            {/* Bottom Candlesticks */}
            <div className="w-full flex items-end justify-around h-12 border-t border-emerald-500/30 bg-emerald-950/20 mt-auto">
              <div className="w-4 h-9 bg-emerald-500/50 rounded-t" />
              <div className="w-4 h-6 bg-rose-500/50 rounded-t" />
              <div className="w-4 h-11 bg-emerald-500/50 rounded-t" />
              <div className="w-4 h-7 bg-emerald-500/50 rounded-t" />
            </div>

            {flappyGameOver && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-20">
                <span className="text-sm font-mono font-black text-rose-400">OOF! BONKED ON CANDLE!</span>
                <button
                  onClick={handleFlappyJump}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-mono text-xs font-black shadow-lg cursor-pointer"
                >
                  Flap Again
                </button>
              </div>
            )}

            <button
              onClick={handleFlappyJump}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-mono font-black text-xs shadow-lg mt-2 cursor-pointer z-10"
            >
              TAP TO FLAP JUMP 🚀
            </button>
          </div>
        )}

        {/* GAME: NOM INVADERS */}
        {gameId === "nom-invaders" && (
          <div className="relative w-full h-full flex flex-col justify-between">
            <div className="w-full flex items-center justify-between text-xs font-mono text-slate-300 z-10">
              <span>SCORE: <strong className="text-purple-400">{invadersScore}</strong></span>
              <span className="text-amber-300 font-bold">BEST: {invadersBest}</span>
            </div>

            {/* Invaders Grid */}
            <div className="relative w-full flex-1 my-1">
              {invaders.map((inv) =>
                inv.alive ? (
                  <span
                    key={inv.id}
                    className="absolute text-xl transition-transform duration-200"
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
                  className="absolute w-2 h-5 bg-purple-400 rounded-full shadow-[0_0_10px_#c084fc]"
                  style={{ left: `${l.x}%`, top: `${l.y}px`, transform: "translate(-50%, -50%)" }}
                />
              ))}

              {/* Player Ship */}
              <div
                className="absolute bottom-4 text-3xl transition-all duration-75"
                style={{ left: `${invaderPlayerX}%`, transform: "translateX(-50%)" }}
              >
                🚀
              </div>
            </div>

            <div className="w-full flex items-center justify-between gap-2 pt-2 z-10">
              <button
                onClick={() => setInvaderPlayerX((p) => Math.max(12, p - 14))}
                className="py-2.5 px-4 rounded-xl bg-slate-800 text-white font-mono font-bold text-xs"
              >
                ◀ LEFT
              </button>
              <button
                onClick={handleFireInvaderLaser}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-slate-950 font-mono font-black text-xs shadow-lg"
              >
                ⚡ FIRE LASER
              </button>
              <button
                onClick={() => setInvaderPlayerX((p) => Math.min(88, p + 14))}
                className="py-2.5 px-4 rounded-xl bg-slate-800 text-white font-mono font-bold text-xs"
              >
                RIGHT ▶
              </button>
            </div>
          </div>
        )}

        {/* GAME: CYBER SNAKE */}
        {gameId === "cyber-snake" && (
          <div className="relative w-full h-full flex flex-col justify-between items-center">
            <div className="w-full flex items-center justify-between text-xs font-mono text-slate-300 z-10">
              <span>SCORE: <strong className="text-emerald-400">{snakeScore}</strong></span>
              <span className="text-amber-300 font-bold">BEST: {snakeBest}</span>
            </div>

            {/* 12x12 Grid */}
            <div className="relative w-48 h-48 border border-emerald-500/30 bg-slate-950/80 rounded-xl overflow-hidden my-auto shadow-inner">
              <div
                className="absolute w-[8.33%] h-[8.33%] bg-amber-400 rounded-full shadow-[0_0_8px_#f59e0b] animate-ping"
                style={{ left: `${snakeFood.x * 8.33}%`, top: `${snakeFood.y * 8.33}%` }}
              />
              <div
                className="absolute w-[8.33%] h-[8.33%] bg-amber-300 rounded-full"
                style={{ left: `${snakeFood.x * 8.33}%`, top: `${snakeFood.y * 8.33}%` }}
              />

              {snake.map((seg, idx) => (
                <div
                  key={idx}
                  className={`absolute w-[8.33%] h-[8.33%] rounded-sm ${
                    idx === 0 ? "bg-emerald-400 shadow-[0_0_8px_#14f195] z-10" : "bg-emerald-600/90"
                  }`}
                  style={{ left: `${seg.x * 8.33}%`, top: `${seg.y * 8.33}%` }}
                />
              ))}

              {snakeGameOver && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-20">
                  <span className="text-xs font-mono font-black text-rose-400">SNAKE CRASH!</span>
                  <button
                    onClick={resetSnakeGame}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-mono text-xs font-black cursor-pointer"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </div>

            {/* D-Pad Controls */}
            <div className="w-full flex items-center justify-between gap-1.5 pt-1 z-10">
              <button
                onClick={() => { setSnakeDir("LEFT"); setSnakeActive(true); }}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-white font-mono font-bold text-xs"
              >
                ◀
              </button>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => { setSnakeDir("UP"); setSnakeActive(true); }}
                  className="py-1 px-4 rounded-xl bg-slate-800 text-white font-mono font-bold text-xs"
                >
                  ▲
                </button>
                <button
                  onClick={() => { setSnakeDir("DOWN"); setSnakeActive(true); }}
                  className="py-1 px-4 rounded-xl bg-slate-800 text-white font-mono font-bold text-xs"
                >
                  ▼
                </button>
              </div>
              <button
                onClick={() => { setSnakeDir("RIGHT"); setSnakeActive(true); }}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-white font-mono font-bold text-xs"
              >
                ▶
              </button>
            </div>
          </div>
        )}

        {/* GAME: CANDY BREAKOUT */}
        {gameId === "candy-breakout" && (
          <div className="relative w-full h-full flex flex-col justify-between">
            <div className="w-full flex items-center justify-between text-xs font-mono text-slate-300 z-10">
              <span>SCORE: <strong className="text-cyan-400">{breakoutScore}</strong></span>
              <span className="text-amber-300 font-bold">BEST: {breakoutBest}</span>
            </div>

            <div className="relative w-full flex-1 my-1">
              <div className="w-full grid grid-cols-4 gap-2 px-2 pt-2">
                {breakoutBricks.map((b) => (
                  <div
                    key={b.id}
                    className={`h-4 rounded-md transition-all ${
                      b.alive ? "shadow-sm border border-white/20" : "opacity-0 scale-50 pointer-events-none"
                    }`}
                    style={{ backgroundColor: b.color }}
                  />
                ))}
              </div>

              <div
                className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_10px_#38bdf8] pointer-events-none"
                style={{ left: `${breakoutBall.x}%`, top: `${breakoutBall.y}%`, transform: "translate(-50%, -50%)" }}
              />

              <div
                className="absolute bottom-6 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_12px_rgba(6,182,212,0.7)]"
                style={{ left: `${breakoutPaddleX - 14}%`, width: "28%" }}
              />

              {breakoutGameOver && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-20">
                  <span className="text-xs font-mono font-black text-rose-400">BALL DROPPED!</span>
                  <button
                    onClick={resetBreakout}
                    className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-mono text-xs font-black cursor-pointer"
                  >
                    Launch Again
                  </button>
                </div>
              )}
            </div>

            <div className="w-full flex items-center justify-between gap-3 pt-2 z-10">
              <button
                onClick={() => { setBreakoutActive(true); setBreakoutPaddleX((p) => Math.max(16, p - 14)); }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-white font-mono font-bold text-xs"
              >
                ◀ SLIDE LEFT
              </button>
              <button
                onClick={() => { setBreakoutActive(true); setBreakoutPaddleX((p) => Math.min(84, p + 14)); }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-white font-mono font-bold text-xs"
              >
                SLIDE RIGHT ▶
              </button>
            </div>
          </div>
        )}

        {/* GAME: NOM RUNNER */}
        {gameId === "nom-runner" && (
          <div className="relative w-full h-full flex flex-col justify-between">
            <div className="w-full flex items-center justify-between text-xs font-mono text-slate-300 z-10">
              <span>DISTANCE: <strong className="text-amber-400">{runnerScore}m</strong></span>
              <span className="text-amber-300 font-bold">BEST: {runnerBest}m</span>
            </div>

            <div className="relative w-full flex-1 my-2 overflow-hidden flex items-end">
              <div
                className="absolute text-3xl transition-all duration-150"
                style={{ left: "20%", bottom: `${16 + runnerY}px` }}
              >
                🦖
              </div>

              <div
                className="absolute text-3xl transition-all duration-75"
                style={{ left: `${runnerObstacleX}%`, bottom: "16px" }}
              >
                🌵
              </div>

              <div className="w-full h-1 bg-amber-500/50" />

              {runnerGameOver && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-20">
                  <span className="text-xs font-mono font-black text-rose-400">BONKED ON FUD!</span>
                  <button
                    onClick={handleRunnerJump}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-mono text-xs font-black cursor-pointer"
                  >
                    Run Again
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleRunnerJump}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 text-slate-950 font-mono font-black text-xs shadow-lg cursor-pointer z-10"
            >
              TAP / SPACE TO JUMP! 🚀
            </button>
          </div>
        )}

        {/* GAME: CANDY HOPPER */}
        {gameId === "candy-hopper" && (
          <div className="relative w-full h-full flex flex-col justify-between">
            <div className="w-full flex items-center justify-between text-xs font-mono text-slate-300 z-10">
              <span>HEIGHT: <strong className="text-yellow-400">{hopperScore}m</strong></span>
              <span className="text-amber-300 font-bold">BEST: {hopperBest}m</span>
            </div>

            <div className="relative w-full flex-1 my-2 overflow-hidden">
              <div
                className="absolute h-3.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 shadow-md transition-all duration-300"
                style={{ left: `${hopperPlatformX - 18}%`, width: "36%", bottom: "35px" }}
              />
              <div
                className="absolute text-3xl transition-all duration-200 animate-bounce"
                style={{ left: `${hopperX}%`, bottom: "48px" }}
              >
                😋
              </div>
            </div>

            <div className="w-full flex items-center justify-between gap-3 pt-2 z-10">
              <button
                onClick={() => handleHopperBounce("left")}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-white font-mono font-bold text-xs"
              >
                ◀ HOP LEFT
              </button>
              <button
                onClick={() => handleHopperBounce("right")}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-white font-mono font-bold text-xs"
              >
                HOP RIGHT ▶
              </button>
            </div>
          </div>
        )}

        {/* GAME: WHACK-A-FUD */}
        {gameId === "whack-a-fud" && (
          <div className="relative w-full h-full flex flex-col justify-between">
            <div className="w-full flex items-center justify-between text-xs font-mono text-slate-300 z-10">
              <span>SCORE: <strong className="text-rose-400">{whackScore}</strong></span>
              <button
                onClick={() => { setWhackScore(0); setWhackActive(true); sounds.playGoldenChime(); }}
                className="text-[10px] font-mono bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/40"
              >
                {whackActive ? "Active Round" : "Start Round"}
              </button>
            </div>

            <div className="w-full grid grid-cols-3 gap-3 px-2 my-auto">
              {whackHoles.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleWhack(idx)}
                  className="h-14 rounded-2xl bg-slate-900 border-2 border-slate-800 hover:border-rose-500/50 flex items-center justify-center text-2xl active:scale-90 transition-transform cursor-pointer"
                >
                  {item === "bear" && "🐻"}
                  {item === "candy" && "🍬"}
                  {item === "bomb" && "💣"}
                  {!item && "🕳️"}
                </button>
              ))}
            </div>

            <div className="text-[11px] font-mono text-slate-400 text-center py-1">
              🐻 Smash = +20 • 🍬 Eat = +10 • 💣 Bomb = -15
            </div>
          </div>
        )}

        {/* GAME: MEGA-FUD TAP RAID */}
        {gameId === "tap-raid" && (
          <div className="relative w-full h-full flex flex-col justify-between items-center">
            <div className="w-full flex items-center justify-between text-xs font-mono text-slate-300 z-10">
              <span>BOSS HP: <strong className="text-rose-400">{bossHp} / 500</strong></span>
              <span className="text-amber-300 font-bold">ATTACKS: {tapHits}</span>
            </div>

            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden my-2 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-100"
                style={{ width: `${(bossHp / 500) * 100}%` }}
              />
            </div>

            <button
              onClick={handleTapBoss}
              className="relative w-28 h-28 my-auto rounded-3xl bg-rose-500/15 border-2 border-rose-500/50 hover:border-rose-400 flex items-center justify-center text-5xl transition-transform active:scale-90 hover:scale-105 shadow-[0_0_30px_rgba(244,63,94,0.35)] cursor-pointer"
            >
              👾
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

            <span className="text-[11px] font-mono text-slate-400 py-1">
              {bossHp === 0 ? "🎉 VICTORY! Boss banished!" : "TAP RAPIDLY TO CRUSH LORD MEGA-FUD!"}
            </span>
          </div>
        )}
      </div>

      {/* Cartridge Carousel Switcher */}
      <div className="w-full pt-1 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0 select-none">
        {CARTRIDGES.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              sounds.playButtonClick();
              onSelectGame(c.id);
            }}
            className={`px-2 py-1 rounded-xl text-[11px] font-mono font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer ${
              gameId === c.id
                ? "bg-emerald-500 text-slate-950 font-black shadow-md"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <span>{c.icon}</span>
            <span>{c.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
