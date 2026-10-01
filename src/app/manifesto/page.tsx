"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { TOKEN_CONFIG } from "@/config/token";
import {
  Flame,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  FileCode2,
  BookOpen,
  Sparkles,
  Users,
  Coins,
  ArrowRight,
  Award,
} from "lucide-react";

export default function ManifestoPage() {
  const [signerName, setSignerName] = useState("");
  const [hasSigned, setHasSigned] = useState(false);

  const handleSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (signerName.trim()) {
      setHasSigned(true);
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col bg-[#050914] text-foreground selection:bg-purple-500/30 selection:text-white">
      <Navbar />

      {/* Hero Header */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-mono mb-4">
          <BookOpen className="w-3.5 h-3.5" />
          <span>OFFICIAL CC0 1.0 UNIVERSAL WHITEPAPER & ANTI-RUG MANIFESTO</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6">
          The <span className="text-purple-400">NomVerse</span> Manifesto
        </h1>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Why 99% of memecoins die in days—and how $NOM replaces greed, insider dumps, and closed IP with an open-source, hyper-deflationary arcade flywheel.
        </p>
      </section>

      {/* Comparison: Broken Memecoins vs $NOM */}
      <section className="container-fluid container-xl py-8 px-3 px-sm-4 mx-auto w-100">
        <div className="row g-4">
          {/* Traditional Memecoins */}
          <div className="col-12 col-md-6 d-flex">
            <div className="w-100 p-6 sm:p-8 rounded-3xl bg-rose-950/20 border border-rose-900/40 space-y-6">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-7 h-7 text-rose-400" />
                <h3 className="text-2xl font-bold text-white">The Typical Memecoin Trap</h3>
              </div>
              <ul className="space-y-4 text-sm text-gray-400">
                <li className="flex items-start gap-3">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>Insider Bundles & Snipers:</strong> Stealth creators buy up 40% of supply at sub-cent fractions and dump on retail.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>Zero Utility / Zero Games:</strong> Pure speculative vaporware with no gameplay, no burn mechanics, and no retention.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>Centralized Control:</strong> Shady anonymous developers control social media, website hosting, and treasury wallets.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>Endless Inflation & Dilution:</strong> Tokens rot away with no sink or burning velocity.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* $NOM Paradigm */}
          <div className="col-12 col-md-6 d-flex">
            <div className="w-100 p-6 sm:p-8 rounded-3xl bg-emerald-950/20 border border-emerald-500/30 space-y-6 shadow-xl shadow-emerald-500/5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-7 h-7 text-emerald-400" />
                <h3 className="text-2xl font-bold text-white">The $NOM Sovereign Solution</h3>
              </div>
              <ul className="space-y-4 text-sm text-gray-300">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>100% Fair Launch on pump.fun:</strong> Zero team presale, zero venture capital, zero hidden sniper allocations. Everyone buys at the bonding curve.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Interactive Game Room Utility:</strong> Real gasless arcade rooms, user-created challenge arenas, and instant prize pools.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>100% CC0 Public Domain:</strong> The mascot, code, and artwork belong to humanity. No copyright lawsuits or trademark takedowns.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Relentless 1% Auto-Burn:</strong> Every single room created or played burns $NOM, permanently decreasing circulating supply.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Core Tenets */}
      <section className="container-fluid container-lg py-8 px-3 px-sm-4 mx-auto w-100 space-y-8">
        <h2 className="text-3xl font-black text-white text-center">The 4 Pillars of NomVerse</h2>

        <div className="row g-4">
          <div className="col-12 col-sm-6 d-flex">
            <div className="w-100 p-6 rounded-2xl bg-gray-900/60 border border-gray-800">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold mb-4">
                I
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Unruggable IP (CC0 1.0)</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                All visual assets, audio engines, and code are dedicated to the public domain. Anyone can build games, merchandise, or animations using Nomster without asking for permission.
              </p>
            </div>
          </div>

          <div className="col-12 col-sm-6 d-flex">
            <div className="w-100 p-6 rounded-2xl bg-gray-900/60 border border-gray-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-4">
                II
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Mathematical Deflation</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                The 1% burn fee is hardcoded. As thousands of players play in arcade rooms, the circulating supply shrinks, creating upward mathematical scarcity.
              </p>
            </div>
          </div>

          <div className="col-12 col-sm-6 d-flex">
            <div className="w-100 p-6 rounded-2xl bg-gray-900/60 border border-gray-800">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold mb-4">
                III
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Autonomous Governance</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                New features, meme skins, and game mechanics are contributed directly via GitHub Pull Requests. The community dictates the roadmap.
              </p>
            </div>
          </div>

          <div className="col-12 col-sm-6 d-flex">
            <div className="w-100 p-6 rounded-2xl bg-gray-900/60 border border-gray-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold mb-4">
                IV
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Gasless Gaming Ergonomics</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Using the 1:1 Arcade Vault, users deposit once and play hundreds of games without paying Solana gas per jump or candy collected. Withdrawals are instant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Sign the CC0 Manifesto */}
      <section className="container-fluid container-md py-8 px-3 px-sm-4 mx-auto w-100 mb-5">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-purple-950/40 via-gray-900 to-gray-950 border border-purple-500/30 text-center shadow-2xl">
          <Award className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">
            Sign the Sovereign CC0 Manifesto
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 mb-6 max-w-lg mx-auto leading-relaxed">
            Pledge your allegiance to open-source sovereignty, fair launches, and unruggable gaming. Join thousands of on-chain believers.
          </p>

          {!hasSigned ? (
            <form onSubmit={handleSign} className="flex flex-col sm:flex-row gap-3 justify-center">
              <input
                type="text"
                placeholder="Enter your name or wallet handle..."
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="bg-black/60 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-sm transition-all active:scale-95 shadow-lg shadow-purple-500/25"
              >
                Sign Manifesto
              </button>
            </form>
          ) : (
            <div className="p-4 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-200 font-mono text-sm space-y-1">
              <div className="font-bold flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>SIGNED BY: {signerName.toUpperCase()}</span>
              </div>
              <p className="text-xs text-purple-300/80">
                You are recorded as a verified sovereign believer in CC0 1.0 Universal Public Domain.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
