"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { BurnHallOfFame } from "@/components/game/BurnHallOfFame";
import { TOKEN_CONFIG } from "@/config/token";
import {
  Trophy,
  Flame,
  Crown,
  Gamepad2,
  Sparkles,
  Share2,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function HallOfFamePage() {
  return (
    <main className="relative min-h-screen flex flex-col bg-[#050914] text-foreground selection:bg-amber-500/30 selection:text-white">
      <Navbar />

      {/* Header */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-mono mb-4">
          <Trophy className="w-3.5 h-3.5" />
          <span>IMMORTALIZED SOLANA LEGENDS</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6">
          The <span className="text-amber-400">Burn</span> Hall of Fame
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Honoring the champions who fuel the $NOM hyper-deflationary engine by incinerating tokens, conquering community game rooms, and creating legendary memes.
        </p>
      </section>

      {/* Main Burn Hall of Fame Component */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <BurnHallOfFame />
      </section>

      {/* Arcade Champions & Lore Creators Trophies */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Arcade Champions */}
          <div className="p-8 rounded-3xl bg-gray-900/60 border border-gray-800 space-y-4">
            <div className="flex items-center gap-3">
              <Crown className="w-7 h-7 text-amber-400" />
              <h3 className="text-xl font-bold text-white">Top Room Champions</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Players who have dominated competitive game rooms and swept community prize pools.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-gray-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-400">#1</span>
                  <span className="font-mono text-gray-200">SolWhale_99</span>
                </div>
                <span className="font-mono text-emerald-400 font-bold">142 Wins</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-gray-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-300">#2</span>
                  <span className="font-mono text-gray-200">CandyNinja</span>
                </div>
                <span className="font-mono text-emerald-400 font-bold">98 Wins</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-gray-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-600">#3</span>
                  <span className="font-mono text-gray-200">NomMaster_Sol</span>
                </div>
                <span className="font-mono text-emerald-400 font-bold">76 Wins</span>
              </div>
            </div>
            <Link
              href="/play"
              className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 hover:text-amber-300 pt-2"
            >
              <span>Challenge the Arena in Game Room</span>
              <span>→</span>
            </Link>
          </div>

          {/* Top Meme Creators */}
          <div className="p-8 rounded-3xl bg-gray-900/60 border border-gray-800 space-y-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-7 h-7 text-purple-400" />
              <h3 className="text-xl font-bold text-white">Legendary Meme Creators</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Pixel artists and creators who designed community skins in the Meme Bazaar.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-gray-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-purple-400">#1</span>
                  <span className="font-mono text-gray-200">CyberNom_Artist</span>
                </div>
                <span className="font-mono text-purple-300 font-bold">1,820 Upvotes</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-gray-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-300">#2</span>
                  <span className="font-mono text-gray-200">PixelGigaChad</span>
                </div>
                <span className="font-mono text-purple-300 font-bold">1,410 Upvotes</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-gray-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-600">#3</span>
                  <span className="font-mono text-gray-200">SolanaGlitcher</span>
                </div>
                <span className="font-mono text-purple-300 font-bold">950 Upvotes</span>
              </div>
            </div>
            <Link
              href="/#create"
              className="inline-flex items-center gap-2 text-xs font-mono text-purple-400 hover:text-purple-300 pt-2"
            >
              <span>Design a Skin in Meme Studio</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
