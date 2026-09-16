"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Coins,
  Calculator,
  Flame,
  Sparkles,
  Rocket,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from "lucide-react";

export const BondingCurveSimulator: React.FC = () => {
  const [solAmount, setSolAmount] = useState<number>(2.5);

  const TOTAL_SUPPLY = 1_000_000_000; // 1 Billion NOM tokens
  const BONDING_GOAL_SOL = 85; // Standard pump.fun threshold
  const SOL_PRICE_USD = 180; // Estimated SOL price

  // Bonding curve formula approximation (exponential curve on pump.fun)
  // At 0 SOL, price is very low; as SOL accumulates, tokens per SOL decrease slightly
  const bondingProgress = Math.min(100, (solAmount / BONDING_GOAL_SOL) * 100);
  const estimatedTokens = Math.round(
    ((solAmount * 11_500_000) / (1 + (solAmount / BONDING_GOAL_SOL) * 0.4))
  );
  const percentSupply = ((estimatedTokens / TOTAL_SUPPLY) * 100).toFixed(3);
  const estimatedCandies = Math.round(estimatedTokens / 1000);
  const marketCapUsd = Math.round(solAmount * SOL_PRICE_USD * 18);

  const presets = [0.5, 1, 2.5, 5, 10, 25];

  return (
    <div className="w-full bg-surface border border-slate-800/90 rounded-2xl p-5 sm:p-7 shadow-2xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-2">
            <Calculator className="w-3.5 h-3.5" />
            <span>PUMP.FUN FAIR LAUNCH ENGINE</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Bonding Curve &amp; Candy Calculator
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Simulate your NOM token allocation, bonding curve impact, and equivalent candies in the treasury.
          </p>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-right font-mono">
          <div className="text-[10px] text-slate-400 uppercase">Bonding Threshold</div>
          <div className="text-sm sm:text-base font-bold text-solana-green">
            85 SOL • $69k Raydium Migration
          </div>
        </div>
      </div>

      {/* Calculator Slider & Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-8">
        <div className="lg:col-span-7 space-y-5">
          {/* Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-slate-300 font-bold">YOUR SIMULATED SOL ALLOCATION</span>
              <span className="text-lg font-black text-solana-green font-mono">
                {solAmount.toFixed(1)} SOL{" "}
                <span className="text-xs text-slate-400 font-normal">
                  (~${(solAmount * SOL_PRICE_USD).toLocaleString()})
                </span>
              </span>
            </div>

            <input
              type="range"
              min={0.1}
              max={50}
              step={0.1}
              value={solAmount}
              onChange={(e) => setSolAmount(parseFloat(e.target.value))}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-solana-green"
            />

            {/* Quick Presets */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-[11px] font-mono text-slate-400">Presets:</span>
              {presets.map((val) => (
                <button
                  key={val}
                  onClick={() => setSolAmount(val)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
                    solAmount === val
                      ? "border-emerald-400 bg-emerald-500/20 text-white font-bold"
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  {val} SOL
                </button>
              ))}
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Estimated NOM</div>
              <div className="text-base sm:text-lg font-black text-white font-mono truncate">
                {estimatedTokens.toLocaleString()}
              </div>
              <div className="text-[10px] font-mono text-emerald-400">100% CC0 Liquid</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Supply Share</div>
              <div className="text-base sm:text-lg font-black text-candy-gold font-mono">
                {percentSupply}%
              </div>
              <div className="text-[10px] font-mono text-amber-400/80">Of 1,000,000,000 NOM</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 col-span-2 sm:col-span-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Candy Equivalent</div>
              <div className="text-base sm:text-lg font-black text-purple-300 font-mono">
                {estimatedCandies.toLocaleString()} 🍬
              </div>
              <div className="text-[10px] font-mono text-purple-400">Treasury Munch Power</div>
            </div>
          </div>
        </div>

        {/* Visual SVG Exponential Bonding Curve */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-solana-green" />
              <span>BONDING CURVE TRAJECTORY</span>
            </span>
            <span className="text-emerald-400 font-bold">{bondingProgress.toFixed(1)}% Bound</span>
          </div>

          <svg viewBox="0 0 300 160" className="w-full h-36 overflow-visible">
            {/* Grid lines */}
            <line x1="20" y1="140" x2="290" y2="140" stroke="#1e293b" strokeWidth="1.5" />
            <line x1="20" y1="20" x2="20" y2="140" stroke="#1e293b" strokeWidth="1.5" />

            {/* Target line at $69k */}
            <line x1="280" y1="20" x2="280" y2="140" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
            <text x="280" y="15" fill="#f59e0b" fontSize="8" fontFamily="monospace" textAnchor="end">
              $69k Raydium Migration
            </text>

            {/* Exponential Curve */}
            <path
              d="M 20 140 Q 180 135 280 30"
              fill="none"
              stroke="#9945ff"
              strokeWidth="3"
            />

            {/* Simulated Dot on Curve */}
            {(() => {
              const t = Math.min(1, solAmount / BONDING_GOAL_SOL);
              // Quadratic bezier point: B(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2
              const dotX = Math.round((1 - t) * (1 - t) * 20 + 2 * (1 - t) * t * 180 + t * t * 280);
              const dotY = Math.round((1 - t) * (1 - t) * 140 + 2 * (1 - t) * t * 135 + t * t * 30);
              return (
                <g>
                  <circle cx={dotX} cy={dotY} r="7" fill="#14f195" className="animate-pulse" />
                  <circle cx={dotX} cy={dotY} r="14" fill="#14f195" opacity="0.3" />
                  <text x={dotX} y={dotY - 10} fill="#ffffff" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    {solAmount} SOL
                  </text>
                </g>
              );
            })()}
          </svg>

          <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2">
            <span>0 SOL (Launch)</span>
            <span>42.5 SOL (Midway)</span>
            <span>85 SOL (Raydium)</span>
          </div>
        </div>
      </div>

      {/* 4 Market Cap Milestone Tiers */}
      <div>
        <h4 className="text-sm font-bold text-white mb-3 font-mono flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-candy-gold" />
          <span>NOMVERSE UNIVERSE EXPANSION TIERS</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Tier 1 */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-black text-emerald-400 font-mono">$69,000</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                TIER 01
              </span>
            </div>
            <h5 className="text-xs font-bold text-white mb-1">Raydium DEX Migration</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              $12k LP deposited into Raydium &amp; burned forever. Nomster unlocks Golden Fork.
            </p>
          </div>

          {/* Tier 2 */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-black text-solana-purple font-mono">$250,000</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                TIER 02
              </span>
            </div>
            <h5 className="text-xs font-bold text-white mb-1">Community CEX Push</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              First centralized exchange listing campaign &amp; Telegram animated sticker blitz.
            </p>
          </div>

          {/* Tier 3 */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-black text-candy-gold font-mono">$1,000,000</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                TIER 03
              </span>
            </div>
            <h5 className="text-xs font-bold text-white mb-1">Animated CC0 Pilot</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Community funds the first 3-minute open-source 4K anime episode starring Nomster.
            </p>
          </div>

          {/* Tier 4 */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-black text-rose-400 font-mono">$10,000,000</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                TIER 04
              </span>
            </div>
            <h5 className="text-xs font-bold text-white mb-1">Global CC0 Mascot Fund</h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Permanent micro-grant treasury funding open-source indie games and IRL mascot merch.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
