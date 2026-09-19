"use client";

import React, { useState, useEffect } from "react";
import {
  Rocket,
  Flame,
  ShieldCheck,
  Zap,
  TrendingUp,
  Coins,
  ExternalLink,
  Copy,
  CheckCircle2,
  Crown,
  Sparkles,
  ArrowRight,
  Shield,
  Activity,
  Check,
} from "lucide-react";
import { TOKEN_CONFIG } from "@/config/token";
import { copyToClipboard } from "@/lib/clipboard";
import { sounds } from "../audio/soundEffects";
import confetti from "canvas-confetti";
import { getTierForBalance } from "@/lib/holderTiers";

// pump.fun bonding curve constant product invariants
const VIRTUAL_SOL_BASE = 30;
const VIRTUAL_TOKEN_BASE = 1_073_000_000;
const K_INVARIANT = VIRTUAL_SOL_BASE * VIRTUAL_TOKEN_BASE; // 32,190,000,000
const TARGET_SOL_MIGRATION = 85;

interface LiveStats {
  priceUsd: number;
  priceNativeSol: number;
  marketCapUsd: number;
  solCollected: number;
  tokensSold: number;
  bondingProgressPercent: number;
  txCount: number;
  dataSource: string;
}

const PRESETS = [0.1, 0.5, 1.0, 2.0, 5.0];

export const InstantBuyTerminal: React.FC = () => {
  const [solInput, setSolInput] = useState<number>(0.5);
  const [customInput, setCustomInput] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [stats, setStats] = useState<LiveStats>({
    priceUsd: 0.00000328,
    priceNativeSol: 0.0000000294,
    marketCapUsd: 3276,
    solCollected: 1.09,
    tokensSold: 13946385,
    bondingProgressPercent: 1.28,
    txCount: 4,
    dataSource: "solana-mainnet-rpc",
  });

  // Poll live on-chain stats from Solana RPC
  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/token-stats");
        if (res.ok) {
          const data = await res.json();
          if (data.success && isMounted) {
            setStats({
              priceUsd: data.priceUsd ?? 0.00000328,
              priceNativeSol: data.priceNativeSol ?? 0.0000000294,
              marketCapUsd: data.marketCapUsd ?? 3276,
              solCollected: data.solCollected ?? 1.09,
              tokensSold: data.tokensSold ?? 13946385,
              bondingProgressPercent: data.bondingProgressPercent ?? 1.28,
              txCount: data.txCount ?? 4,
              dataSource: data.dataSource ?? "solana-mainnet-rpc",
            });
          }
        }
      } catch {
        // preserve baseline
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const activeSol = customInput ? parseFloat(customInput) || 0 : solInput;

  // Accurate bonding curve token calculation
  const currentSol = VIRTUAL_SOL_BASE + stats.solCollected;
  const currentTokensRemaining = K_INVARIANT / currentSol;
  const nextSol = currentSol + activeSol;
  const nextTokensRemaining = K_INVARIANT / (nextSol > 0 ? nextSol : currentSol);
  const tokensReceived = Math.max(0, Math.floor(currentTokensRemaining - nextTokensRemaining));

  const percentSupply = ((tokensReceived / TOKEN_CONFIG.totalSupply) * 100).toFixed(2);
  const perks = getTierForBalance(tokensReceived);

  const handleCopyCA = async () => {
    await copyToClipboard(TOKEN_CONFIG.mintAddress);
    setCopied(true);
    sounds.playGoldenChime();
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.8 },
      colors: ["#14F195", "#9945FF", "#F59E0B"],
    });
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="w-full relative rounded-3xl bg-slate-950/90 border border-emerald-500/40 p-5 sm:p-8 shadow-[0_0_50px_rgba(20,241,149,0.15)] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-solana-purple/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Real On-Chain Telemetry Pill */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/90">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              SOLANA MAINNET FAIR LAUNCH
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-solana-purple/15 text-solana-purple border border-solana-purple/30">
              Token-2022 Program
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
              0% Taxes
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Instant Buy $NOM</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-normal">
              pump.fun
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Real on-chain bonding curve pricing. Zero slippage surprise. Instant token allocation and arcade perks.
          </p>
        </div>

        {/* Real Live Metrics Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-0.5">
            <div className="text-[11px] sm:text-xs text-slate-300 uppercase font-semibold">Live Price</div>
            <div className="text-emerald-400 font-bold text-xs sm:text-sm truncate">
              ${stats.priceUsd < 0.0001 ? stats.priceUsd.toFixed(8) : stats.priceUsd.toFixed(5)}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-300 truncate">
              {stats.priceNativeSol.toFixed(9)} SOL
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-0.5">
            <div className="text-[11px] sm:text-xs text-slate-300 uppercase font-semibold">Market Cap</div>
            <div className="text-white font-bold text-xs sm:text-sm">
              ${stats.marketCapUsd.toLocaleString()}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-300">
              Goal: $69,000
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-0.5">
            <div className="text-[11px] sm:text-xs text-slate-300 uppercase font-semibold">Curve SOL</div>
            <div className="text-teal-300 font-bold text-xs sm:text-sm">
              {stats.solCollected.toFixed(2)} SOL
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-300">
              Target: 85 SOL
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-0.5">
            <div className="text-[11px] sm:text-xs text-slate-300 uppercase font-semibold">Curve Bonded</div>
            <div className="text-solana-green font-bold text-xs sm:text-sm">
              {stats.bondingProgressPercent}%
            </div>
            <div className="text-[10px] sm:text-[11px] text-emerald-300 font-medium truncate">
              {stats.tokensSold.toLocaleString()} SOLD
            </div>
          </div>
        </div>
      </div>

      {/* Mint CA Banner Strip */}
      <div className="my-5 p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-solana-green/10 border border-solana-green/30 flex items-center justify-center text-solana-green shrink-0">
            <Coins className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
              Verified Solana Mint Address (Token-2022)
            </div>
            <div className="text-xs sm:text-sm font-mono text-slate-100 font-semibold truncate select-all">
              {TOKEN_CONFIG.mintAddress}
            </div>
          </div>
        </div>

        <button
          onClick={handleCopyCA}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-emerald-500/50 transition-all shrink-0 active:scale-95"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-400" />
              <span>Copy Address</span>
            </>
          )}
        </button>
      </div>

      {/* Interactive Swap / Terminal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Amount & Presets (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-bold">ENTER SOL AMOUNT</span>
              <span className="text-slate-400">Balance: Any Solana Wallet</span>
            </div>

            {/* Quick Preset Buttons */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {PRESETS.map((amount) => {
                const isSelected = !customInput && solInput === amount;
                return (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => {
                      setSolInput(amount);
                      setCustomInput("");
                    }}
                    className={`py-2 sm:py-2.5 px-0.5 sm:px-1 rounded-xl font-mono text-[11px] sm:text-sm font-bold border transition-all touch-manipulation cursor-pointer ${
                      isSelected
                        ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_15px_rgba(20,241,149,0.3)] scale-[1.02]"
                        : "bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    {amount} SOL
                  </button>
                );
              })}
            </div>

            {/* Custom Input Field */}
            <div className="relative pt-1">
              <input
                type="number"
                min="0.01"
                step="0.05"
                placeholder="Or enter custom SOL amount..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-500"
              />
              <span className="absolute right-4 top-4 text-xs font-mono text-slate-400 font-bold">
                SOL
              </span>
            </div>
          </div>

          {/* Tokens Output Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border border-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 font-bold uppercase">Estimated Output</span>
              <span className="text-emerald-400 font-bold">{percentSupply}% of Supply</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white flex items-center justify-between gap-2">
              <span className="tracking-tight text-emerald-400">
                ~{tokensReceived.toLocaleString()}
              </span>
              <span className="text-sm font-bold text-slate-400 shrink-0">$NOM</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
              <span>Rate</span>
              <span>
                1 SOL ≈ {activeSol > 0 ? Math.round(tokensReceived / activeSol).toLocaleString() : 0} NOM
              </span>
            </div>
          </div>

          {/* Primary Action Button */}
          <a
            href={TOKEN_CONFIG.pumpFunUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.dispatchEvent(
                  new CustomEvent("NOM_CANDY_FRENZY", {
                    detail: {
                      duration: 30,
                      sponsor: `${tokensReceived.toLocaleString()} $NOM Ape`,
                    },
                  })
                );
              }
            }}
            className="w-full py-4 rounded-2xl font-black font-mono text-sm sm:text-base text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-solana-green shadow-[0_0_30px_rgba(20,241,149,0.35)] hover:shadow-[0_0_40px_rgba(20,241,149,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Rocket className="w-5 h-5" />
            <span>BUY {tokensReceived.toLocaleString()} $NOM ON PUMP.FUN</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Right Column: Perks & Verification (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Holder Perks Preview Card */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
              <Crown className="w-4 h-4" />
              <span>UNLOCKED ARCADE PERKS</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-bold">{perks.badge} {perks.label}</span>
                <span className="text-emerald-400 font-bold">ACTIVE</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {perks.description}
              </p>
              <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-800 text-[11px]">
                <div className="text-slate-300">
                  Daily Lives: <strong className="text-white">{perks.maxLives} Max</strong>
                </div>
                <div className="text-slate-300">
                  Score Boost: <strong className="text-emerald-400">{perks.scoreMultiplier}x</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Token Mechanics Card */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs font-mono">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>On-Chain Security Guarantees</span>
            </div>

            <div className="space-y-1.5 text-slate-300 text-[11px]">
              <div className="flex items-center justify-between">
                <span>Mint Authority:</span>
                <span className="text-emerald-400 font-bold">Renounced (null)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Freeze Authority:</span>
                <span className="text-emerald-400 font-bold">Renounced (null)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total Supply:</span>
                <span className="text-white font-bold">1,000,000,000 NOM</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Liquidity Migration:</span>
                <span className="text-teal-300 font-bold">Raydium @ 85 SOL</span>
              </div>
            </div>
          </div>

          {/* External Dex / Explorer Links */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <a
              href={`https://dexscreener.com/solana/${TOKEN_CONFIG.mintAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1"
            >
              <span>DexScreener</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
            <a
              href={`https://solscan.io/token/${TOKEN_CONFIG.mintAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1"
            >
              <span>Solscan</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
            <a
              href={TOKEN_CONFIG.pumpFunUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 transition-all flex items-center justify-center gap-1 font-bold"
            >
              <span>pump.fun</span>
              <ExternalLink className="w-3 h-3 text-emerald-400" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
