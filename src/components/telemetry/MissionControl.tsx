"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Rocket,
  Flame,
  ShieldCheck,
  TrendingUp,
  Coins,
  ExternalLink,
  Zap,
  Calculator,
  Compass,
  Sparkles,
  Orbit,
} from "lucide-react";
import { TOKEN_CONFIG } from "@/config/token";
import { GravitationalSingularity } from "./GravitationalSingularity";

// Real pump.fun constant product bonding curve parameters
const VIRTUAL_SOL_RESERVES = 30; // 30 SOL initial virtual reserve
const TOTAL_SUPPLY = 1_000_000_000; // 1 Billion total tokens
const CURVE_SUPPLY = 800_000_000; // 800M available on bonding curve
const VIRTUAL_TOKEN_RESERVES = 1_073_000_000; // pump.fun invariant virtual token reserve
const K_INVARIANT = VIRTUAL_SOL_RESERVES * VIRTUAL_TOKEN_RESERVES;
const TARGET_SOL_MIGRATION = 85; // ~85 SOL to graduate to Raydium (~$69K market cap)

export const MissionControl: React.FC = () => {
  // Calculator state
  const [solInput, setSolInput] = useState<number>(1);
  const [currentSolCollected, setCurrentSolCollected] = useState<number>(1.09);
  const [liveSolPriceUsd, setLiveSolPriceUsd] = useState<number>(115);
  const [visualMode, setVisualMode] = useState<"singularity" | "orbit">("singularity");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync with live on-chain token stats
  useEffect(() => {
    fetch("/api/token-stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success) {
          if (typeof data.solCollected === "number") {
            setCurrentSolCollected(parseFloat(data.solCollected.toFixed(2)));
          } else if (typeof data.bondingProgressPercent === "number") {
            const realSol = (data.bondingProgressPercent / 100) * TARGET_SOL_MIGRATION;
            setCurrentSolCollected(parseFloat(realSol.toFixed(2)));
          }

          if (data.priceUsd > 0 && data.priceNativeSol > 0) {
            setLiveSolPriceUsd(Math.round(data.priceUsd / data.priceNativeSol));
          }
        }
      })
      .catch(() => {});
  }, []);

  // Compute exact bonding curve math
  const currentSol = VIRTUAL_SOL_RESERVES + currentSolCollected;
  const currentTokensRemaining = K_INVARIANT / currentSol;
  const nextSol = currentSol + solInput;
  const nextTokensRemaining = K_INVARIANT / nextSol;
  const tokensReceived = Math.max(0, currentTokensRemaining - nextTokensRemaining);

  // Price calculations
  const priceSolPerToken = solInput / (tokensReceived || 1);
  const marketCapUsd = Math.round(priceSolPerToken * TOTAL_SUPPLY * liveSolPriceUsd);
  const graduationProgressPercent = Math.min(
    100,
    parseFloat(((currentSolCollected / TARGET_SOL_MIGRATION) * 100).toFixed(2))
  );
  const solNeededToMigrate = Math.max(0, TARGET_SOL_MIGRATION - currentSolCollected);

  // Animate the orbital canvas trajectory
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.02;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Deep space background
      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, w, h);

      // Starfield twinkle
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 40; i++) {
        const sx = ((i * 47) % w);
        const sy = ((i * 83 + Math.sin(t + i) * 3) % h);
        const size = (i % 3) === 0 ? 1.5 : 1;
        ctx.globalAlpha = 0.3 + 0.5 * Math.sin(t * 2 + i);
        ctx.fillRect(sx, sy, size, size);
      }
      ctx.globalAlpha = 1;

      // Orbit arc trajectory from Earth (left) to Moon (right)
      ctx.strokeStyle = "rgba(20, 241, 149, 0.25)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(40, h - 30);
      ctx.quadraticCurveTo(w / 2, 20, w - 40, 40);
      ctx.stroke();
      ctx.setLineDash([]);

      // Earth / pump.fun Launchpad (bottom left)
      const earthGrad = ctx.createRadialGradient(40, h - 30, 2, 40, h - 30, 24);
      earthGrad.addColorStop(0, "#10b981");
      earthGrad.addColorStop(1, "#047857");
      ctx.fillStyle = earthGrad;
      ctx.beginPath();
      ctx.arc(40, h - 30, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px monospace";
      ctx.fillText("pump.fun", 16, h - 5);

      // Raydium Moon (top right)
      const moonGrad = ctx.createRadialGradient(w - 40, 40, 2, w - 40, 40, 20);
      moonGrad.addColorStop(0, "#f59e0b");
      moonGrad.addColorStop(1, "#d97706");
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(w - 40, 40, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#fde68a";
      ctx.font = "bold 9px monospace";
      ctx.fillText("Raydium ($69K)", w - 75, 70);

      // Calculate current rocket position along quadratic bezier curve
      const p = graduationProgressPercent / 100;
      const rx = (1 - p) * (1 - p) * 40 + 2 * (1 - p) * p * (w / 2) + p * p * (w - 40);
      const ry = (1 - p) * (1 - p) * (h - 30) + 2 * (1 - p) * p * 20 + p * p * 40;

      // Rocket flame particles
      const flameGrad = ctx.createRadialGradient(rx - 8, ry + 6, 1, rx - 16, ry + 12, 10);
      flameGrad.addColorStop(0, "#fbbf24");
      flameGrad.addColorStop(0.5, "#f97316");
      flameGrad.addColorStop(1, "rgba(239, 68, 68, 0)");
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.arc(rx - 10, ry + 6, 8 + Math.sin(t * 10) * 3, 0, Math.PI * 2);
      ctx.fill();

      // Rocket Emoji / Sprite
      ctx.font = "20px serif";
      ctx.fillText("🚀", rx - 10, ry + 7);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [graduationProgressPercent]);

  return (
    <div className="w-full rounded-3xl bg-slate-950/80 border border-slate-800 p-5 sm:p-6 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: "12s" }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white">Raydium Orbital Mission Control</h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30">
                Constant Product Math
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Live pump.fun bonding curve physics, Raydium graduation target &amp; swap calculator.
            </p>
          </div>
        </div>

        <a
          href={TOKEN_CONFIG.pumpFunUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all shrink-0 self-start sm:self-auto hover:scale-105"
        >
          <Rocket className="w-3.5 h-3.5" />
          <span>View on pump.fun</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Visualizer Mode Switcher Deck */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
          Bonding Spacetime Physics Engine:
        </span>
        <div className="grid grid-cols-2 sm:flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setVisualMode("singularity")}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              visualMode === "singularity"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Orbit className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="sm:hidden">Singularity</span>
            <span className="hidden sm:inline">Gravitational Singularity</span>
          </button>
          <button
            onClick={() => setVisualMode("orbit")}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              visualMode === "orbit"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Rocket className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="sm:hidden">Trajectory</span>
            <span className="hidden sm:inline">Starship Trajectory</span>
          </button>
        </div>
      </div>

      {/* Render Selected Visualizer */}
      {visualMode === "singularity" ? (
        <GravitationalSingularity
          solCollected={currentSolCollected}
          onSimulateSol={(s) => setCurrentSolCollected(s)}
        />
      ) : (
        <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-slate-800 bg-[#030712]">
          <canvas ref={canvasRef} width={600} height={144} className="w-full h-full block" />
          <div className="absolute top-3 left-4 text-xs font-mono text-emerald-400 font-bold bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>TRAJECTORY: {graduationProgressPercent}% TO RAYDIUM</span>
          </div>
        </div>
      )}

      {/* Real-time Math Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Interactive Swap Simulator */}
        <div className="lg:col-span-6 p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>Bonding Curve Calculator</span>
            </h4>
            <span className="text-[11px] font-mono text-slate-400">Formula: x * y = k</span>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-1.5">
              <span>Simulate SOL Input:</span>
              <strong className="text-emerald-400">{solInput} SOL</strong>
            </div>
            <div className="flex items-center gap-2">
              {[0.1, 0.5, 1, 2, 5].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setSolInput(amt)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    solInput === amt
                      ? "bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20"
                      : "bg-slate-950 text-slate-300 border border-slate-700 hover:border-slate-500"
                  }`}
                >
                  {amt} SOL
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Tokens Received:</span>
              <span className="text-emerald-400 font-black text-sm sm:text-base">
                ~{Math.round(tokensReceived).toLocaleString()} $NOM
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Effective Token Price:</span>
              <span className="text-white font-semibold">{(priceSolPerToken * 1e6).toFixed(4)} µSOL</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Projected Market Cap:</span>
              <span className="text-candy-gold font-bold">${marketCapUsd.toLocaleString()} USD</span>
            </div>
          </div>
        </div>

        {/* Right Column: Graduation Roadmap & Tokenomics */}
        <div className="lg:col-span-6 p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-solana-green" />
              <span>Raydium Migration Threshold</span>
            </h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-solana-green/15 text-solana-green font-bold">
              100% CC0
            </span>
          </div>

          <div className="space-y-2.5 font-mono text-xs text-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Graduation Target:</span>
              <strong className="text-white">{TARGET_SOL_MIGRATION} SOL (~$69K MC)</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Remaining to Graduate:</span>
              <strong className="text-amber-400">{solNeededToMigrate.toFixed(1)} SOL</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Liquidity Burn on Raydium:</span>
              <strong className="text-rose-400">$12,000 USD (Burned LP)</strong>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1 pt-1 font-mono">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Bonding Curve Progress</span>
              <span className="text-emerald-400 font-bold">{graduationProgressPercent}%</span>
            </div>
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-solana-green transition-all duration-300 shadow-[0_0_12px_rgba(20,241,149,0.4)]"
                style={{ width: `${graduationProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Interactive Curve Simulation Slider */}
          <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Simulate Orbit Trajectory:</span>
              <span className="text-solana-green font-bold">{currentSolCollected.toFixed(1)} SOL ({graduationProgressPercent}%)</span>
            </div>
            <input
              type="range"
              min="0"
              max={TARGET_SOL_MIGRATION}
              step="0.5"
              value={currentSolCollected}
              onChange={(e) => setCurrentSolCollected(parseFloat(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[9px] font-mono text-slate-500">
              <span>0 SOL (Genesis)</span>
              <span>42.5 SOL (50%)</span>
              <span>85 SOL (Raydium 🚀)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
