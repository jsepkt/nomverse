"use client";

import React, { useState } from "react";
import { Flame, Rocket, Copy, CheckCircle2, ShieldAlert, Sparkles, Coins, ArrowUpRight } from "lucide-react";
import { BondingCurveSimulator } from "../tokenomics/BondingCurveSimulator";
import { TOKEN_CONFIG } from "@/config/token";
import { copyToClipboard } from "@/lib/clipboard";

export const Tokenomics: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);
  const contractAddress = TOKEN_CONFIG.mintAddress;

  const handleCopy = async () => {
    await copyToClipboard(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="tokenomics" className="w-full py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30 mb-4">
            <Flame className="w-3.5 h-3.5" />
            <span>PUMP.FUN FAIR LAUNCH</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
            The Economic Engine of NomVerse
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            While GitHub is the builder hub, our coin launched on <strong className="text-emerald-400">pump.fun</strong> serves as the speculative engine and attention driver. A fair launch with zero presale, zero insider unlocks, and 100% community ownership.
          </p>
        </div>

        {/* Contract Address Card */}
        <div className="mb-12 p-6 rounded-2xl bg-gradient-to-r from-surface via-slate-900 to-surface border border-emerald-500/30 shadow-[0_0_30px_rgba(20,241,149,0.1)] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl bg-solana-green/10 border border-solana-green/30 flex items-center justify-center text-solana-green shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                Solana Mint Address
              </div>
              <div className="font-mono text-xs sm:text-sm text-slate-200 truncate">
                {contractAddress}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleCopy}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-mono bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Address Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Copy Address</span>
                </>
              )}
            </button>

            <a
              href={TOKEN_CONFIG.pumpFunUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 shadow-lg shadow-emerald-900/30 transition-all hover:scale-105"
            >
              <Rocket className="w-4 h-4 text-slate-950" />
              <span>Trade on pump.fun</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Interactive pump.fun Bonding Curve & Candy Calculator */}
        <div className="mb-12">
          <BondingCurveSimulator />
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="rounded-xl bg-surface border border-slate-800/80 p-5">
            <div className="text-2xl font-black font-mono text-emerald-400 mb-1">0% TAX</div>
            <div className="text-sm font-bold text-white mb-2">Zero Friction</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              No buy taxes, no sell taxes, no hidden owner fees. Complete sovereign trading freedom for community holders.
            </p>
          </div>

          <div className="rounded-xl bg-surface border border-slate-800/80 p-5">
            <div className="text-2xl font-black font-mono text-solana-green mb-1">100% FAIR</div>
            <div className="text-sm font-bold text-white mb-2">Bonding Curve Launch</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              No private allocations, no seed VC rounds. Every token is purchased on equal footing on the pump.fun bonding curve.
            </p>
          </div>

          <div className="rounded-xl bg-surface border border-slate-800/80 p-5">
            <div className="text-2xl font-black font-mono text-solana-purple mb-1">LOCKED</div>
            <div className="text-sm font-bold text-white mb-2">Raydium Graduation</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upon bonding curve completion, liquidity is automatically migrated to Raydium and the LP tokens are burned permanently.
            </p>
          </div>

          <div className="rounded-xl bg-surface border border-slate-800/80 p-5">
            <div className="text-2xl font-black font-mono text-candy-gold mb-1">CC0 IP</div>
            <div className="text-sm font-bold text-white mb-2">Universal Remix Rights</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Token value is backed by organic open-source culture. Anyone can create commercial merchandise, games, or derivative content.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
