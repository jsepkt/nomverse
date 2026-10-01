"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { TOKEN_CONFIG } from "@/config/token";
import { getTotalNomBurned } from "@/lib/arcadeVault";
import { MissionControl } from "@/components/telemetry/MissionControl";
import {
  Flame,
  PieChart,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  ExternalLink,
  Coins,
  Calculator,
  Lock,
} from "lucide-react";

export default function TokenomicsPage() {
  const [dailyVolume, setDailyVolume] = useState<number>(500_000);
  const [totalBurned, setTotalBurned] = useState<number>(1_250_000);

  useEffect(() => {
    try {
      const burned = getTotalNomBurned();
      if (burned > 0) setTotalBurned(burned);
    } catch {}
  }, []);

  // 1% daily burn from game room volume
  const dailyBurn = Math.floor(dailyVolume * 0.01);
  const burn30Days = dailyBurn * 30;
  const burn90Days = dailyBurn * 90;
  const burn365Days = dailyBurn * 365;

  const pctBurned365 = ((burn365Days / TOKEN_CONFIG.totalSupply) * 100).toFixed(2);

  return (
    <main className="relative min-h-screen flex flex-col bg-[#050914] text-foreground selection:bg-rose-500/30 selection:text-white">
      <Navbar />

      {/* Header */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-mono mb-4">
          <Flame className="w-3.5 h-3.5" />
          <span>DEFLATIONARY SOLANA TOKENOMICS & PROOF OF BURN</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6">
          The <span className="text-rose-400">Mathematical</span> Burn Flywheel
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Zero team allocations. Zero private sales. Zero trading taxes on DEX.
          Scarcity is driven entirely by game room wagering and voluntary token incineration.
        </p>
      </section>

      {/* Live Token Metrics Cards */}
      <section className="container-fluid container-xl py-6 px-3 px-sm-4 mx-auto w-100">
        <div className="row g-3 g-lg-4">
          <div className="col-12 col-sm-6 col-lg-3 d-flex">
            <div className="w-100 p-4 sm:p-6 rounded-2xl bg-gray-900/60 border border-gray-800 d-flex flex-column justify-between">
              <div className="text-xs font-mono text-gray-400 mb-1">TOTAL MAX SUPPLY</div>
              <div className="text-2xl font-black text-white font-mono">1,000,000,000</div>
              <div className="text-xs text-gray-500 mt-2">Fixed standard pump.fun supply</div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3 d-flex">
            <div className="w-100 p-4 sm:p-6 rounded-2xl bg-gray-900/60 border border-rose-500/30 d-flex flex-column justify-between">
              <div className="text-xs font-mono text-rose-400 mb-1 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                <span>COMMUNITY BURNED</span>
              </div>
              <div className="text-2xl font-black text-rose-300 font-mono">
                {totalBurned.toLocaleString()} $NOM
              </div>
              <div className="text-xs text-rose-400/80 mt-2">
                Permanently removed from circulation
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3 d-flex">
            <div className="w-100 p-4 sm:p-6 rounded-2xl bg-gray-900/60 border border-gray-800 d-flex flex-column justify-between">
              <div className="text-xs font-mono text-gray-400 mb-1">TEAM / DEV ALLOCATION</div>
              <div className="text-2xl font-black text-emerald-400 font-mono">0% (ZERO)</div>
              <div className="text-xs text-gray-500 mt-2">100% fair launch on bonding curve</div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3 d-flex">
            <div className="w-100 p-4 sm:p-6 rounded-2xl bg-gray-900/60 border border-gray-800 d-flex flex-column justify-between">
              <div className="text-xs font-mono text-gray-400 mb-1">DEX TRADING TAX</div>
              <div className="text-2xl font-black text-emerald-400 font-mono">0% BUY / 0% SELL</div>
              <div className="text-xs text-gray-500 mt-2">Pure decentralized trading</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Deflation Simulator */}
      <section className="container-fluid container-lg py-8 px-3 px-sm-4 mx-auto w-100">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-gray-900/90 to-black border border-rose-500/30 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">Interactive Deflation Simulator</h3>
              <p className="text-xs text-gray-400">
                Simulate how game room transaction volume permanently shrinks the $NOM circulating supply.
              </p>
            </div>
          </div>

          {/* Slider */}
          <div className="mb-8 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300 font-medium">Daily Game Room Wager Volume:</span>
              <span className="font-mono text-rose-400 font-bold text-base">
                {dailyVolume.toLocaleString()} $NOM / day
              </span>
            </div>
            <input
              type="range"
              min="50000"
              max="10000000"
              step="50000"
              value={dailyVolume}
              onChange={(e) => setDailyVolume(Number(e.target.value))}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <div className="flex justify-between text-xs font-mono text-gray-500">
              <span>50,000 $NOM</span>
              <span>5,000,000 $NOM</span>
              <span>10,000,000 $NOM</span>
            </div>
          </div>

          {/* Projection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-black/60 border border-gray-800 text-center">
              <div className="text-xs font-mono text-gray-400 mb-1">IN 30 DAYS</div>
              <div className="text-xl font-bold font-mono text-rose-400">
                {burn30Days.toLocaleString()} $NOM
              </div>
              <div className="text-xs text-gray-500 mt-1">incinerated forever</div>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-gray-800 text-center">
              <div className="text-xs font-mono text-gray-400 mb-1">IN 90 DAYS</div>
              <div className="text-xl font-bold font-mono text-rose-400">
                {burn90Days.toLocaleString()} $NOM
              </div>
              <div className="text-xs text-gray-500 mt-1">incinerated forever</div>
            </div>

            <div className="p-4 rounded-2xl bg-black/60 border border-rose-500/40 text-center bg-rose-500/5">
              <div className="text-xs font-mono text-rose-300 mb-1">IN 1 YEAR (365 DAYS)</div>
              <div className="text-xl font-bold font-mono text-rose-300">
                {burn365Days.toLocaleString()} $NOM
              </div>
              <div className="text-xs text-rose-400/80 font-mono mt-1">
                ~ {pctBurned365}% of Total Supply Burned
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 text-xs text-gray-400 leading-relaxed">
            💡 <strong>The Deflation Rule:</strong> All game room entry fees enforce a hardcoded 1% burn fee. Unlike traditional memecoins that rely on hype, $NOM supply naturally tightens the more people play.
          </div>
        </div>
      </section>

      {/* SpaceX-Grade Raydium Mission Control */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <MissionControl />
      </section>

      {/* On-Chain Verification Links */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full mb-12">
        <h4 className="text-lg font-bold text-white text-center mb-6">
          Verifiable On-Chain Data Sources
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href={TOKEN_CONFIG.pumpFunUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 hover:border-emerald-500/50 transition-colors flex items-center justify-between text-xs font-medium text-gray-200"
          >
            <span>pump.fun Bonding Curve</span>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </a>
          <a
            href={`https://solscan.io/token/${TOKEN_CONFIG.mintAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 hover:border-emerald-500/50 transition-colors flex items-center justify-between text-xs font-medium text-gray-200"
          >
            <span>Solscan Explorer</span>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </a>
          <a
            href={`https://dexscreener.com/solana/${TOKEN_CONFIG.mintAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 hover:border-emerald-500/50 transition-colors flex items-center justify-between text-xs font-medium text-gray-200"
          >
            <span>DexScreener Live Chart</span>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
