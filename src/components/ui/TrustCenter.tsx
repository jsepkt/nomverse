"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Flame,
  Lock,
  CheckCircle2,
  ExternalLink,
  Coins,
  Cpu,
  HelpCircle,
  TrendingUp,
  Sparkles,
  Gamepad2,
  Share2,
  Send,
  Zap,
  Award,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { TOKEN_CONFIG } from "@/config/token";
import { getTotalNomBurned } from "@/lib/arcadeVault";
import { sounds } from "../audio/soundEffects";

interface FaqItem {
  q: string;
  badge: string;
  badgeColor: string;
  a: string;
  bullets?: string[];
  proofLink?: { text: string; href: string };
}

const FAQS: FaqItem[] = [
  {
    q: "Is NomVerse real or just another fake crypto hype site?",
    badge: "100% VERIFIED",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    a: "NomVerse is 100% real and 100% open-source under the Creative Commons Zero (CC0 1.0) Public Domain dedication. Every line of our Phaser 3 arcade engine, Web Audio chiptune synthesizer, smart wallet hooks, and deflationary burn algorithms is open to the public on GitHub.",
    bullets: [
      "Playable immediately in your browser right now — zero wallet or deposit required to test.",
      "Full public GitHub repository with verified commit history.",
      "No venture capital, no presales, no team tokens.",
    ],
    proofLink: { text: "Audit Source Code on GitHub", href: TOKEN_CONFIG.githubUrl },
  },
  {
    q: "Are $NOM tokens really burned, and does the circulating supply decrease?",
    badge: "ON-CHAIN BURN",
    badgeColor: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    a: "YES. Burning is hardcoded into the arcade mechanics. Every time a community challenge room is created, played, or settled, 1% of the tokens are permanently incinerated. Players can also voluntarily burn tokens in the Arcade Vault to cement their rank in the Burn Hall of Fame.",
    bullets: [
      "Tokens are sent to Solana's permanent null/incinerator sink address.",
      "Burns directly reduce the circulating supply from the 1 Billion initial pool.",
      "Every burn is provable and auditable on Solscan.",
    ],
    proofLink: { text: "View Solscan Token Explorer", href: TOKEN_CONFIG.solscanUrl },
  },
  {
    q: "Will the token price increase?",
    badge: "TOKENOMICS MATH",
    badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    a: "While no legitimate project can legally guarantee financial returns, the mathematical mechanics of NomVerse are designed for hyper-deflation. Pump.fun uses the constant-product formula (x · y = k). As the 1% burn fee permanently destroys tokens, the circulating supply shrinks. When active player wagers and community trading demand meet a continuously shrinking supply, the price per token mathematically moves upward.",
    bullets: [
      "Formula: Price = Market Cap / Circulating Supply.",
      "1% burn creates a perpetual supply sink that traditional memecoins lack.",
      "Raydium Migration locks $12,000 of liquidity and burns LP tokens permanently.",
    ],
    proofLink: { text: "Simulate Deflation on Bonding Curve", href: "/tokenomics" },
  },
  {
    q: "Why is it worth holding $NOM? What are the 'Proof of Bag' perks?",
    badge: "UTILITY & REWARDS",
    badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    a: "Unlike speculative hype tokens that have zero utility, holding $NOM unlocks tangible arcade superpowers:",
    bullets: [
      "Extra Arcade Lives & 5-minute fast life regeneration.",
      "2X Daily Mystery Crate Airdrops (double candies, lives, and perks).",
      "2X Damage Multiplier against the Global World Raid Boss.",
      "9% Creator Royalties on custom challenge rooms you publish.",
      "Exclusive Diamond & Whale CC0 mascot skins.",
    ],
    proofLink: { text: "View All Holder Perks", href: "/play" },
  },
  {
    q: "Are we building more games and a mobile game app?",
    badge: "ROADMAP",
    badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
    a: "YES. NomVerse is an evolving decentralized gaming universe. We already feature 5 playable experiences, and we are expanding to mobile-native formats:",
    bullets: [
      "Telegram Mini App (TMA): Launching 1-tap play directly inside Telegram chats for 950M users.",
      "Mobile PWA: Install NomVerse to your iPhone or Android home screen with 0 app store fees.",
      "Current live games: Retro Candy Feast, Flappy Waddle, Mega-FUD Tap Clicker, and NomBeats Synth.",
      "Upcoming: Peer-to-Peer Wager Rooms and Community Pixel Modding.",
    ],
    proofLink: { text: "Try All Mini-Games Now", href: "/play" },
  },
];

export const TrustCenter: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [totalBurned, setTotalBurned] = useState<number>(1250000);

  React.useEffect(() => {
    try {
      const b = getTotalNomBurned();
      if (b > 0) setTotalBurned(b);
    } catch {}
  }, []);

  const toggleFaq = (idx: number) => {
    sounds.playButtonClick();
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <section id="trust-center" className="w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-[#03060E] via-[#050b18] to-[#03060E]">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1360px] mx-auto space-y-12 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_20px_rgba(20,241,149,0.2)]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>PROOF OF LEGITIMACY &amp; REAL ON-CHAIN VALUE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Is NomVerse Real? <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-solana-cyan bg-clip-text text-transparent">Every Fact Verified</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            No false promises. No hidden sniper wallets. Transparent math, playable code, and provable Solana tokenomics.
          </p>
        </div>

        {/* 4 Pillars of Irrefutable Proof Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: 100% Fair Launch */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-emerald-500/30 shadow-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Coins className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white">0% Team Pre-Mine</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                100% fair launch on the pump.fun bonding curve. Zero insider allocations, zero venture capitalist dumps, and zero pre-minted team supply.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Equal Access for All</span>
            </div>
          </div>

          {/* Card 2: Immutability */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-teal-500/30 shadow-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white">Unruggable Mint &amp; Freeze</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Mint authority is permanently revoked (no new tokens can ever be created). Freeze authority is permanently disabled (wallets cannot be blacklisted).
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-teal-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Token-2022 Verified</span>
            </div>
          </div>

          {/* Card 3: Real Burn Sink */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-rose-500/30 shadow-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white">Continuous 1% Burn Sink</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Every game room wager, entry fee, and withdrawal permanently burns 1% of the tokens. Over <strong>{totalBurned.toLocaleString()} $NOM</strong> destroyed forever.
              </p>
            </div>
            <Link
              href="/hall-of-fame"
              className="pt-3 border-t border-slate-800 text-[11px] font-mono text-rose-400 font-bold flex items-center gap-1 hover:underline"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Inspect Burn Hall of Fame →</span>
            </Link>
          </div>

          {/* Card 4: Open Source CC0 */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-purple-500/30 shadow-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white">100% CC0 Public Domain</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                The mascot character (&quot;Nomster&quot;), arcade code, and audio synthesizer are dedicated to the public domain. Anyone can build, remix, and monetize freely.
              </p>
            </div>
            <a
              href={TOKEN_CONFIG.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pt-3 border-t border-slate-800 text-[11px] font-mono text-purple-300 font-bold flex items-center gap-1 hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Inspect Code on GitHub →</span>
            </a>
          </div>
        </div>

        {/* Interactive FAQ Accordion Addressing Every Question Directly */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Frequently Asked Questions &amp; Direct Answers
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Clear, transparent answers to every question prospective holders and gamers ask.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={TOKEN_CONFIG.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask on Telegram</span>
              </a>
            </div>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isOpen
                      ? "bg-slate-900/90 border-emerald-500/40 shadow-lg"
                      : "bg-slate-900/40 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border shrink-0 ${faq.badgeColor}`}>
                        {faq.badge}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-white truncate">
                        {faq.q}
                      </h4>
                    </div>
                    <div className="p-1 rounded-lg bg-slate-800 text-slate-400 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 sm:pb-5 space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3 animate-in fade-in duration-200">
                      <p>{faq.a}</p>
                      {faq.bullets && (
                        <ul className="space-y-1.5 pl-4 list-disc text-slate-300 text-xs font-mono">
                          {faq.bullets.map((b, bIdx) => (
                            <li key={bIdx}>{b}</li>
                          ))}
                        </ul>
                      )}
                      {faq.proofLink && (
                        <div className="pt-2">
                          <a
                            href={faq.proofLink.href}
                            target={faq.proofLink.href.startsWith("http") ? "_blank" : undefined}
                            rel={faq.proofLink.href.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 hover:underline"
                          >
                            <span>{faq.proofLink.text}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 1-Click Verification Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-purple-950/40 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base font-black text-white flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Ready to Verify and Test Yourself?</span>
            </h4>
            <p className="text-xs text-slate-300 font-mono">
              Launch the retro arcade immediately or trade on pump.fun bonding curve.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Link
              href="/play"
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-emerald-400 to-solana-green text-slate-950 shadow-md hover:scale-105 active:scale-95 transition-all text-center"
            >
              Play Free Arcade
            </Link>
            <a
              href={TOKEN_CONFIG.pumpFunUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-mono font-bold text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all flex items-center justify-center gap-1.5"
            >
              <span>pump.fun</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
