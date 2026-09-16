"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Rocket, Sparkles, BookOpen, Wrench, ShieldCheck, Flame, MessageSquare, LogIn, LogOut, Wallet } from "lucide-react";
import { GithubIcon } from "./icons";
import { useAuth } from "@/context/AuthContext";
import { UserBadge } from "../auth/UserBadge";
import { GlobalCandiesTicker } from "./GlobalCandiesTicker";
import { TokenTickerBar } from "./TokenTickerBar";
import { TOKEN_CONFIG } from "@/config/token";

export const Navbar: React.FC = () => {
  const { user, openAuthModal, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-background/80 backdrop-blur-xl">
      <TokenTickerBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/40 p-1 flex items-center justify-center transition-transform group-hover:scale-110">
              <Image
                src="/mascot.svg"
                alt="Nomster Icon"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tight text-white flex items-center gap-1.5">
                NOM<span className="text-solana-green">VERSE</span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400/80 -mt-1">
                Fair Launch Edition
              </span>
            </div>
          </Link>

          {/* CC0 Public Domain Badge */}
          <Link
            href="#license"
            className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% CC0 Public Domain</span>
          </Link>

          {/* Live Universe Devoured Ticker */}
          <div className="hidden sm:block">
            <GlobalCandiesTicker />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 text-xs sm:text-sm font-medium text-slate-300">
          <a
            href="#arcade"
            className="flex items-center gap-1.5 hover:text-solana-green transition-colors"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Arcade
          </a>
          <a
            href="#wall"
            className="flex items-center gap-1.5 hover:text-solana-green transition-colors font-semibold text-emerald-300"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            NomWall
          </a>
          <a
            href="#lore"
            className="flex items-center gap-1.5 hover:text-solana-green transition-colors"
          >
            <BookOpen className="w-4 h-4 text-solana-purple" />
            Lore Hub
          </a>
          <a
            href="#toolkit"
            className="flex items-center gap-1.5 hover:text-solana-green transition-colors"
          >
            <Wrench className="w-4 h-4 text-candy-gold" />
            Toolkit
          </a>
          <a
            href="#tokenomics"
            className="flex items-center gap-1.5 hover:text-solana-green transition-colors"
          >
            <Flame className="w-4 h-4 text-rose-400" />
            pump.fun
          </a>
        </nav>

        {/* Action Buttons & Auth */}
        <div className="flex items-center gap-2.5">
          {/* User Auth Pill / Button */}
          {user ? (
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <span className="truncate max-w-[90px] sm:max-w-[120px]">{user.name}</span>
                <UserBadge provider={user.provider} showText={false} />
              </div>
              <button
                onClick={logout}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 transition-all"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* GitHub Repo */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all hover:border-slate-500"
          >
            <GithubIcon className="w-4 h-4" />
            <span>GitHub</span>
          </a>

          {/* Buy on pump.fun CTA */}
          <a
            href={TOKEN_CONFIG.pumpFunUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-500 via-teal-400 to-solana-green text-slate-950 shadow-[0_0_20px_rgba(20,241,149,0.35)] hover:shadow-[0_0_30px_rgba(20,241,149,0.6)] hover:scale-105 transition-all"
          >
            <Rocket className="w-3.5 h-3.5 text-slate-950" />
            <span>pump.fun</span>
          </a>
        </div>
      </div>
    </header>
  );
};
