"use client";

import React, { useRef, useEffect, useState } from "react";
import { Sparkles, Orbit, ShieldCheck, Flame, Radio, Zap } from "lucide-react";
import { sounds } from "../audio/soundEffects";

interface Photon {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hue: number;
  life: number;
  maxLife: number;
  size: number;
}

interface GravitationalSingularityProps {
  solCollected?: number;
  onSimulateSol?: (sol: number) => void;
}

export const GravitationalSingularity: React.FC<GravitationalSingularityProps> = ({
  solCollected = 3.5,
  onSimulateSol,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [localSol, setLocalSol] = useState<number>(solCollected);
  const [warpSpeedActive, setWarpSpeedActive] = useState<boolean>(false);

  useEffect(() => {
    setLocalSol(solCollected);
  }, [solCollected]);

  // Bonding Curve & Relativity Math
  const TARGET_SOL = 85.0; // Raydium Migration Threshold
  const progressRatio = Math.min(1.0, localSol / TARGET_SOL);
  const eventHorizonRadius = 14 + progressRatio * 32; // Schwarzschild radius Rs in pixels
  const photonSphereRadius = eventHorizonRadius * 1.5; // Relativistic photon orbit
  const gravitationalMass = 1200 + progressRatio * 4800; // GM gravitational constant
  const metricG00 = Math.max(0.01, 1 - (2 * progressRatio * 0.4)).toFixed(3); // Metric curvature tensor approximation
  const escapeVelocityRatio = Math.min(0.99, 0.2 + progressRatio * 0.79).toFixed(2); // Fraction of speed of light c

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    // Initialize 180 relativistic photon particles
    const photons: Photon[] = [];
    const numPhotons = 180;

    for (let i = 0; i < numPhotons; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = photonSphereRadius + 20 + Math.random() * 110;
      // Stable orbital velocity: v = sqrt(GM / r)
      const vOrbit = Math.sqrt(gravitationalMass / dist) * (0.85 + Math.random() * 0.3);
      const tangentAngle = angle + Math.PI / 2;

      photons.push({
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx: Math.cos(tangentAngle) * vOrbit,
        vy: Math.sin(tangentAngle) * vOrbit,
        hue: (i * 2) % 360,
        life: Math.random() * 300,
        maxLife: 200 + Math.random() * 200,
        size: Math.random() > 0.8 ? 2 : 1.2,
      });
    }

    let frame = 0;

    const render = () => {
      frame++;
      // Deep spacetime metric void background with motion trail
      ctx.fillStyle = "rgba(4, 7, 16, 0.22)";
      ctx.fillRect(0, 0, w, h);

      // 1. Spacetime Curvature Metric Grid (Gravitational Lensing)
      ctx.lineWidth = 1;
      const numRings = 7;
      for (let r = 1; r <= numRings; r++) {
        const baseRadius = (r / numRings) * (w * 0.46);
        // Metric distortion: compression near event horizon
        const distortedRadius = Math.max(
          eventHorizonRadius,
          baseRadius - (eventHorizonRadius * 22) / (baseRadius + 10)
        );

        ctx.strokeStyle = `rgba(20, 241, 149, ${0.04 + (r / numRings) * 0.08})`;
        ctx.beginPath();
        ctx.arc(cx, cy, distortedRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 2. Photon Geodesics Integration (Verlet/Euler Gravity)
      for (let i = 0; i < photons.length; i++) {
        const p = photons[i];
        p.life++;

        const dx = cx - p.x;
        const dy = cy - p.y;
        const rSq = dx * dx + dy * dy;
        const r = Math.sqrt(rSq);

        // Relativistic acceleration: a = GM / r^2 + Frame dragging cross product
        const speedScale = warpSpeedActive ? 1.8 : 1.0;
        const force = (gravitationalMass / Math.max(100, rSq)) * speedScale;
        const ax = (dx / r) * force;
        const ay = (dy / r) * force;

        p.vx += ax * 0.016;
        p.vy += ay * 0.016;

        // Frame dragging rotation
        const dragFactor = (eventHorizonRadius / Math.max(r, 1)) * 0.012;
        const perpX = -dy / r;
        const perpY = dx / r;
        p.vx += perpX * dragFactor;
        p.vy += perpY * dragFactor;

        p.x += p.vx * 0.016 * speedScale;
        p.y += p.vy * 0.016 * speedScale;

        // Relativistic Doppler Beaming Color Shift:
        // Approaching particles blueshift (cyan #00f0ff), receding particles redshift (amber #f59e0b)
        const isApproaching = p.vx * (p.y - cy) - p.vy * (p.x - cx) > 0;
        ctx.fillStyle = isApproaching
          ? `rgba(0, 240, 255, ${Math.min(1, 0.4 + (p.life / p.maxLife) * 0.6)})`
          : `rgba(245, 158, 11, ${Math.min(1, 0.4 + (p.life / p.maxLife) * 0.6)})`;

        // Draw photon particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Singularity Absorption & Hawking Radiation Jet Re-spawn
        if (r < eventHorizonRadius || p.life > p.maxLife || r > w * 0.65) {
          // Re-spawn on outer accretion boundary
          const angle = Math.random() * Math.PI * 2;
          const newDist = photonSphereRadius + 15 + Math.random() * 95;
          const vOrb = Math.sqrt(gravitationalMass / newDist) * (0.8 + Math.random() * 0.35);
          const tang = angle + Math.PI / 2;

          p.x = cx + Math.cos(angle) * newDist;
          p.y = cy + Math.sin(angle) * newDist;
          p.vx = Math.cos(tang) * vOrb;
          p.vy = Math.sin(tang) * vOrb;
          p.life = 0;
          p.maxLife = 180 + Math.random() * 220;
        }
      }

      // 3. Relativistic Accretion Disk Glow
      const accretionGlow = ctx.createRadialGradient(cx, cy, eventHorizonRadius, cx, cy, photonSphereRadius * 1.8);
      accretionGlow.addColorStop(0, "rgba(20, 241, 149, 0.85)");
      accretionGlow.addColorStop(0.3, "rgba(6, 182, 212, 0.4)");
      accretionGlow.addColorStop(0.7, "rgba(153, 69, 255, 0.15)");
      accretionGlow.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = accretionGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, photonSphereRadius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // 4. Central Black Hole / Event Horizon Core (Schwarzschild Singularity)
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(cx, cy, eventHorizonRadius, 0, Math.PI * 2);
      ctx.fill();

      // Event Horizon Edge Lensing Glow
      ctx.strokeStyle = `rgba(20, 241, 149, ${0.7 + Math.sin(frame * 0.05) * 0.25})`;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Relativistic Photon Sphere Orbit Ring
      ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
      ctx.setLineDash([4, 6]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, photonSphereRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Center Nomster Core Symbol
      ctx.fillStyle = "#14F195";
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(progressRatio >= 1.0 ? "RAYDIUM" : "$NOM", cx, cy);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [gravitationalMass, eventHorizonRadius, photonSphereRadius, warpSpeedActive]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setLocalSol(val);
    if (onSimulateSol) onSimulateSol(val);
  };

  const handlePulseWarp = () => {
    setWarpSpeedActive(true);
    sounds.playFling();
    setTimeout(() => setWarpSpeedActive(false), 2500);
  };

  return (
    <div className="w-full rounded-3xl bg-slate-950/90 border border-emerald-500/30 p-4 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Header Deck */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Orbit className="w-5 h-5 animate-spin" style={{ animationDuration: "12s" }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white">Relativistic AMM Singularity</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                Einstein-Rosen Geodesics
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Simulating spacetime curvature and photon orbits as SOL accumulates toward Raydium graduation.
            </p>
          </div>
        </div>

        {/* Warp Drive Boost Button */}
        <button
          onClick={handlePulseWarp}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 self-start sm:self-auto cursor-pointer ${
            warpSpeedActive
              ? "bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.6)]"
              : "bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40"
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{warpSpeedActive ? "WARP OVERDRIVE!" : "Pulse Warp Drive"}</span>
        </button>
      </div>

      {/* Main Relativistic Canvas Simulator */}
      <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-slate-800/90 my-4 bg-[#040710] shadow-inner flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={640}
          height={288}
          className="w-full h-full block select-none"
        />

        {/* Top-Left Telemetry Pill */}
        <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-0.5 shadow-lg pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-bold">EVENT HORIZON: Rs = {eventHorizonRadius.toFixed(1)} px</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Metric Tensor g₀₀ = {metricG00} • Escape Velocity v_e = {escapeVelocityRatio}c
          </div>
        </div>

        {/* Top-Right Singularity Milestone */}
        <div className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 font-mono text-[11px] text-right shadow-lg pointer-events-none">
          <div className="text-candy-gold font-bold">
            {(progressRatio * 100).toFixed(1)}% TO SINGULARITY
          </div>
          <div className="text-[10px] text-slate-400">
            {localSol.toFixed(1)} / {TARGET_SOL} SOL
          </div>
        </div>
      </div>

      {/* Interactive Relativistic Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-2">
        {/* Slider */}
        <div className="sm:col-span-8 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Gravitational Mass Input (Bonding SOL):</span>
            <strong className="text-emerald-400">{localSol.toFixed(1)} SOL ({Math.round(progressRatio * 100)}%)</strong>
          </div>
          <input
            type="range"
            min="0.1"
            max={TARGET_SOL}
            step="0.5"
            value={localSol}
            onChange={handleSliderChange}
            className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>0 SOL (Flat Spacetime)</span>
            <span>42.5 SOL (Severe Lensing)</span>
            <span>85 SOL (Raydium Horizon)</span>
          </div>
        </div>

        {/* Telemetry Metric Cards */}
        <div className="sm:col-span-4 grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[9px] uppercase tracking-wider text-slate-400">Photon Sphere</div>
            <div className="text-sm font-bold text-cyan-300">{photonSphereRadius.toFixed(0)} px</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[9px] uppercase tracking-wider text-slate-400">LP In Singularity</div>
            <div className="text-sm font-bold text-amber-300">$12,000 USD</div>
          </div>
        </div>
      </div>
    </div>
  );
};
