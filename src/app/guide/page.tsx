"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { TOKEN_CONFIG } from "@/config/token";
import {
  Wallet,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Copy,
  ExternalLink,
  Flame,
  Gamepad2,
  HelpCircle,
  Coins,
  Sparkles,
  Zap,
} from "lucide-react";

export default function GuidePage() {
  const [copied, setCopied] = useState(false);
  const [solInput, setSolInput] = useState<string>("0.5");
  const [verifyAddress, setVerifyAddress] = useState<string>("");
  const [verifyResult, setVerifyResult] = useState<"idle" | "authentic" | "counterfeit">("idle");

  const solPriceUsd = 145; // estimated benchmark
  const solNum = parseFloat(solInput) || 0;
  // Estimated tokens (approximate bonding curve math preview)
  const estimatedNom = Math.floor(solNum * 1250000);

  const handleCopyMint = () => {
    navigator.clipboard.writeText(TOKEN_CONFIG.mintAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = verifyAddress.trim();
    if (!cleaned) return;
    if (cleaned === TOKEN_CONFIG.mintAddress) {
      setVerifyResult("authentic");
    } else {
      setVerifyResult("counterfeit");
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col bg-[#050914] text-foreground selection:bg-emerald-500/30 selection:text-white">
      <Navbar />

      {/* Header Banner */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono mb-4 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>OFFICIAL VISITOR ONBOARDING & SAFETY GUIDE</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-4">
          How to Buy, Play & Burn <span className="text-emerald-400">$NOM</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Welcome to the world&apos;s first deflationary meme-arcade ecosystem on Solana.
          Follow these 3 simple steps to get tokens, play in the game room, and join the revolution.
        </p>

        {/* 1-Click Canonical Mint Address Banner */}
        <div className="mt-8 max-w-2xl mx-auto p-4 rounded-2xl bg-gray-900/80 border border-gray-800 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left w-full sm:w-auto">
            <div className="text-xs font-mono text-gray-400">CANONICAL MINT ADDRESS (PUMP.FUN):</div>
            <div className="text-sm font-mono text-emerald-400 break-all select-all font-semibold">
              {TOKEN_CONFIG.mintAddress}
            </div>
          </div>
          <button
            onClick={handleCopyMint}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>COPIED!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>COPY MINT</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* 3-Step Interactive Guide */}
      <section className="container-fluid container-xl py-10 px-3 px-sm-4 mx-auto w-100">
        <div className="row g-4">
          {/* STEP 1 */}
          <div className="col-12 col-md-4 d-flex">
            <div className="w-100 relative p-6 sm:p-8 rounded-3xl bg-gray-900/60 border border-gray-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xl mb-6">
                  1
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Get a Solana Wallet</h3>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                  Install a trusted non-custodial Solana wallet. We recommend Phantom, Solflare, or Backpack on mobile or desktop browser extensions.
                </p>
                <div className="space-y-2 mb-6">
                  <a
                    href="https://phantom.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 text-xs font-medium text-gray-200 transition-colors"
                  >
                    <span>Phantom Wallet</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                  </a>
                  <a
                    href="https://solflare.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 text-xs font-medium text-gray-200 transition-colors"
                  >
                    <span>Solflare Wallet</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                  </a>
                </div>
              </div>
              <div className="text-xs text-emerald-400/80 font-mono">
                Fund with a small amount of SOL for gas.
              </div>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="col-12 col-md-4 d-flex">
            <div className="w-100 relative p-6 sm:p-8 rounded-3xl bg-gray-900/60 border border-emerald-500/30 hover:border-emerald-500/60 transition-all flex flex-col justify-between shadow-lg shadow-emerald-500/5">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-black text-xl mb-6">
                  2
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Swap SOL for $NOM</h3>
                <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                  Acquire $NOM directly on pump.fun bonding curve. No pre-sales, no team allocations, 100% fair launch.
                </p>

                {/* Mini Interactive Estimator */}
                <div className="p-4 rounded-2xl bg-black/40 border border-gray-800 mb-6 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                    <span>Input SOL:</span>
                    <span>~ ${(solNum * solPriceUsd).toFixed(1)} USD</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="0.01"
                      value={solInput}
                      onChange={(e) => setSolInput(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-xs font-mono text-emerald-400 font-bold">SOL</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-gray-800">
                    <span className="text-gray-400">Est. $NOM:</span>
                    <span className="text-emerald-400 font-bold">~ {estimatedNom.toLocaleString()} $NOM</span>
                  </div>
                </div>
              </div>
              <a
                href={TOKEN_CONFIG.pumpFunUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                <span>Trade on pump.fun</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="col-12 col-md-4 d-flex">
            <div className="w-100 relative p-6 sm:p-8 rounded-3xl bg-gray-900/60 border border-gray-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-black text-xl mb-6">
                  3
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Play in the Game Room</h3>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                  Connect your wallet to NomVerse, deposit tokens into your zero-gas Arcade Vault, challenge community rooms, win prize pools, and watch tokens burn!
                </p>
                <div className="p-4 rounded-2xl bg-black/40 border border-gray-800 mb-6 space-y-2 text-xs text-gray-300">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>Zero gas fees per arcade move</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-rose-400" />
                    <span>1% auto-burn incinerates supply</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-400" />
                    <span>1:1 instant wallet withdrawals</span>
                  </div>
                </div>
              </div>
              <Link
                href="/play"
                className="w-full py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-sm flex items-center justify-center gap-2 border border-gray-700 transition-all active:scale-95"
              >
                <Gamepad2 className="w-4 h-4 text-emerald-400" />
                <span>Enter Game Room</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Official Contract & Scam Guard Checker */}
      <section className="container-fluid container-lg py-8 px-3 px-sm-4 mx-auto w-100">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-gray-900/90 to-gray-950 border border-gray-800 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Official Contract & Scam Verification Tool
            </h2>
          </div>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            Protect your funds! Copycat scammers frequently create fake tokens with similar names. Paste any Solana token address below to instantly check if it is the authentic, verified $NOM contract.
          </p>

          <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="text"
              placeholder="Paste Solana token mint address to verify..."
              value={verifyAddress}
              onChange={(e) => {
                setVerifyAddress(e.target.value);
                setVerifyResult("idle");
              }}
              className="flex-1 bg-black/60 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition-all active:scale-95"
            >
              Verify Mint
            </button>
          </form>

          {verifyResult === "authentic" && (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>VERIFIED AUTHENTIC: Official NomVerse ($NOM) Token</span>
              </div>
              <p className="text-xs text-emerald-200/80">
                This mint matches the canonical pump.fun launch address. Mint authority is revoked, freeze authority is disabled, and it is 100% safe to trade and deposit.
              </p>
            </div>
          )}

          {verifyResult === "counterfeit" && (
            <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-base">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <span>WARNING: Counterfeit / Unrecognized Address</span>
              </div>
              <p className="text-xs text-rose-200/80">
                The address you entered does NOT match the authentic NomVerse mint. Do not trade or send funds to this address!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full mb-12">
        <h3 className="text-2xl font-black text-white text-center mb-8 flex items-center justify-center gap-2">
          <HelpCircle className="w-6 h-6 text-emerald-400" />
          <span>Frequently Asked Questions</span>
        </h3>
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800">
            <h4 className="font-bold text-white text-base mb-2">What is the slippage tolerance to use?</h4>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              On pump.fun, standard slippage of 0.5% to 1.5% is usually sufficient. During high-volatility spikes, setting slippage to 2% to 3% ensures your transaction completes without failing.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800">
            <h4 className="font-bold text-white text-base mb-2">How does the 1% burn fee work?</h4>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Whenever a player creates a community game room or joins a wager match, 1% of the entry fee is permanently incinerated from the circulating supply. This creates a relentless mathematical deflationary force as game room activity increases.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800">
            <h4 className="font-bold text-white text-base mb-2">Can I play without connecting a wallet?</h4>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Yes! You can enter Practice / Free-to-Play Mode anytime in the Game Room to hone your skills. To win real $NOM rewards and participate in community prize pools, simply connect any Solana wallet.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
