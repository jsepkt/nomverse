"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Rocket,
  Sparkles,
  Gamepad2,
  Palette,
  BookOpen,
  Code2,
  ShieldCheck,
  Flame,
  MessageSquare,
  LogOut,
  Wallet,
  Zap,
  Menu,
  X,
  Coins,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { GithubIcon } from "./icons";
import { useAuth } from "@/context/AuthContext";
import { UserBadge } from "../auth/UserBadge";
import { GlobalCandiesTicker } from "./GlobalCandiesTicker";
import { TokenTickerBar } from "./TokenTickerBar";
import { TOKEN_CONFIG } from "@/config/token";
import { QuickBuyModal } from "../wallet/QuickBuyModal";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  glowColor: string;
  description: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Play",
    href: "/play",
    icon: Gamepad2,
    color: "text-emerald-400",
    glowColor: "group-hover:text-emerald-300",
    description: "Game Room: 5 stages, more games & dev XP",
    badge: "Game Room",
  },
  {
    label: "Create",
    href: "/#create",
    icon: Palette,
    color: "text-amber-400",
    glowColor: "group-hover:text-amber-300",
    description: "In-browser meme studio, vector PFPs & 8-bit beats",
  },
  {
    label: "Lore",
    href: "/#lore",
    icon: BookOpen,
    color: "text-purple-400",
    glowColor: "group-hover:text-purple-300",
    description: "Read community stories & submit canonical PRs",
  },
  {
    label: "Wall",
    href: "/#wall",
    icon: MessageSquare,
    color: "text-teal-400",
    glowColor: "group-hover:text-teal-300",
    description: "NomWall quests, high score flex & discussions",
    badge: "Quests",
  },
  {
    label: "Build",
    href: "/#toolkit",
    icon: Code2,
    color: "text-yellow-400",
    glowColor: "group-hover:text-yellow-300",
    description: "Open source repository, Phaser scenes & modding",
  },
  {
    label: "$NOM",
    href: "/#tokenomics",
    icon: Flame,
    color: "text-rose-400",
    glowColor: "group-hover:text-rose-300",
    description: "Fair launch on pump.fun & Raydium migration",
    badge: "Fair Launch",
  },
];

export const Navbar: React.FC = () => {
  const router = useRouter();
  const { user, openAuthModal, logout } = useAuth();
  const [isQuickBuyOpen, setIsQuickBuyOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

  // Add subtle shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const isMobile = window.innerWidth < 1024;
    router.push(isMobile ? "/play?mode=full" : "/play");
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-200 ${
          scrolled
            ? "border-b border-emerald-500/20 bg-background/95 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
            : "border-b border-slate-800/80 bg-background/80 backdrop-blur-xl"
        }`}
      >
        <TokenTickerBar />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand & Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-2.5 group focus:outline-none"
            >
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-500/15 border border-emerald-400/50 p-1 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:border-emerald-400 group-hover:shadow-[0_0_20px_rgba(20,241,149,0.3)]">
                <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping opacity-25 pointer-events-none" />
                <Image
                  src="/mascot.svg"
                  alt="Nomster Icon"
                  width={34}
                  height={34}
                  className="object-contain"
                />
              </div>

              <div className="flex flex-col">
                <span className="font-black text-base sm:text-lg tracking-tight text-white flex items-center gap-1 leading-tight">
                  NOM<span className="text-solana-green">VERSE</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono tracking-widest uppercase text-emerald-400/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  Fair Launch
                </span>
              </div>
            </Link>
          </div>

          {/* Right Action Buttons & Web3 Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Primary PLAY NOW CTA Button */}
            <button
              onClick={handlePlayClick}
              className="relative group inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-solana-green text-slate-950 shadow-[0_0_20px_rgba(20,241,149,0.35)] hover:shadow-[0_0_30px_rgba(20,241,149,0.65)] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
              title="Play NomVerse Game"
            >
              <Gamepad2 className="w-3.5 h-3.5 fill-slate-950 text-slate-950 group-hover:animate-bounce shrink-0" />
              <span>PLAY NOW</span>
            </button>

            {/* Quick Buy SOL Button */}
            <button
              onClick={() => setIsQuickBuyOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-mono font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:border-amber-500/50 transition-all hover:scale-105 shrink-0"
              title="Instant Buy $NOM on pump.fun"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Buy $NOM</span>
            </button>

            {/* User Auth Pill / Sign In (Desktop / Tablet) */}
            {user ? (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-sm shrink-0">
                <div className="flex items-center gap-1 text-xs font-bold text-white max-w-[85px] sm:max-w-[120px]">
                  <span className="truncate">{user.name}</span>
                  <UserBadge provider={user.provider} showText={false} />
                </div>
                <button
                  onClick={logout}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 transition-all cursor-pointer shrink-0"
              >
                <Wallet className="w-3.5 h-3.5 shrink-0" />
                <span>Sign In</span>
              </button>
            )}

            {/* pump.fun Launch Button (Desktop) */}
            <a
              href={TOKEN_CONFIG.pumpFunUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-slate-900/90 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/60 transition-all hover:scale-105 active:scale-95 shrink-0"
              title="Trade on pump.fun"
            >
              <Rocket className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>pump.fun</span>
              <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
            </a>

            {/* GitHub Repo Button (Desktop) */}
            <a
              href="https://github.com/jsepkt/nomverse"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 hover:border-slate-500 transition-all hover:scale-105 active:scale-95 shrink-0"
              title="Fork on GitHub"
            >
              <GithubIcon className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <span className="hidden lg:inline">GitHub</span>
            </a>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              className="relative lg:hidden p-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-200 hover:text-white hover:bg-slate-800 transition-all active:scale-95 shrink-0"
            >
              {user && !isMobileMenuOpen && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
              )}
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-rose-400 animate-in spin-in-90 duration-150" />
              ) : (
                <Menu className="w-5 h-5 text-emerald-400 animate-in fade-in duration-150" />
              )}
            </button>
          </div>
        </div>

        {/* Secondary Sub-Navbar Ribbon (Feature Sections Navigation Strip) */}
        <div className="hidden lg:block w-full border-t border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-11 flex items-center justify-between gap-4 text-xs font-mono">
            {/* Feature Sections Navigation Items */}
            <nav className="flex items-center gap-1 xl:gap-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700/60 transition-all"
                  >
                    <Icon
                      className={`w-3.5 h-3.5 ${item.color} ${item.glowColor} transition-transform group-hover:scale-110`}
                    />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Candies Ticker & CC0 Assurance */}
            <div className="flex items-center gap-4 shrink-0">
              <GlobalCandiesTicker />
              <div className="h-4 w-px bg-slate-800" />
              <Link
                href="#license"
                className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold text-emerald-400/90 hover:text-emerald-300 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% CC0 Public Domain</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Slide-Down Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-emerald-500/20 bg-slate-950/98 backdrop-blur-2xl shadow-2xl animate-in slide-in-from-top-4 duration-200 overflow-hidden">
            <div className="px-4 py-4 space-y-3 max-h-[calc(100vh-5rem)] overflow-y-auto">
              {/* Mobile Quick Header Actions */}
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
                {!user ? (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openAuthModal();
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-2"
                  >
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    <span>Connect Wallet / Sign In</span>
                  </button>
                ) : (
                  <div className="flex-1 flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center gap-2">
                      <UserBadge provider={user.provider} showText={false} />
                      <span className="text-xs font-bold text-white truncate max-w-[150px]">
                        {user.name}
                      </span>
                    </div>
                    <button
                      onClick={logout}
                      className="px-2 py-1 text-xs font-mono text-rose-400 bg-rose-500/10 rounded-lg border border-rose-500/20"
                    >
                      Sign Out
                    </button>
                  </div>
                )}

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsQuickBuyOpen(true);
                  }}
                  className="py-2.5 px-3 rounded-xl font-mono text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Quick Buy</span>
                </button>
              </div>

              {/* Navigation Items List - 1 col on phone, 2 col on tablet */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isPlay = item.href === "/play";
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={(e) => {
                        if (isPlay) {
                          handlePlayClick(e);
                        } else {
                          handleNavClick();
                        }
                      }}
                      className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-surface/60 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 transition-all active:scale-[0.98] group touch-manipulation"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-slate-700">
                          <Icon className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                              {item.label}
                            </span>
                            {item.badge && (
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors shrink-0 ml-1" />
                    </a>
                  );
                })}
              </div>

              {/* External Protocol Links in Mobile Drawer */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <a
                  href={TOKEN_CONFIG.pumpFunUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-center gap-2 text-xs font-bold text-slate-200"
                >
                  <Rocket className="w-3.5 h-3.5 text-emerald-400" />
                  <span>pump.fun</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>

                <a
                  href="https://github.com/jsepkt/nomverse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-center gap-2 text-xs font-bold text-slate-200"
                >
                  <GithubIcon className="w-3.5 h-3.5 text-slate-200" />
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </div>

              {/* Mobile CC0 Assurance Badge */}
              <div className="pt-2 text-center">
                <Link
                  href="#license"
                  onClick={handleNavClick}
                  className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400/90 hover:underline"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% CC0 Public Domain • Zero IP Restrictions</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Floating App-Like Bottom Dock on Mobile & Tablet (Thumb-Friendly Native Experience) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-3 inset-x-3 z-40 max-w-sm sm:max-w-md mx-auto rounded-3xl bg-slate-950/95 backdrop-blur-2xl border border-emerald-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.85)] px-3 py-1.5 flex items-center justify-around transition-all select-none touch-manipulation"
      >
        <button
          onClick={handlePlayClick}
          className="flex flex-col items-center justify-center min-w-[48px] min-h-[48px] py-1 px-2.5 rounded-2xl text-[10px] font-mono font-bold text-slate-300 hover:text-emerald-400 active:scale-90 transition-all cursor-pointer touch-manipulation"
        >
          <Gamepad2 className="w-5 h-5 mb-0.5 text-emerald-400" />
          <span>Play</span>
        </button>

        <a
          href="/#wall"
          className="flex flex-col items-center justify-center min-w-[48px] min-h-[48px] py-1 px-2.5 rounded-2xl text-[10px] font-mono font-bold text-slate-300 hover:text-teal-300 active:scale-90 transition-all touch-manipulation"
        >
          <MessageSquare className="w-5 h-5 mb-0.5 text-teal-400" />
          <span>Quests</span>
        </a>

        {/* Center Glow HERO Action Button: Instant 1-Tap Buy $NOM */}
        <button
          onClick={() => setIsQuickBuyOpen(true)}
          className="relative -top-3.5 flex flex-col items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-400 via-teal-300 to-solana-green text-slate-950 font-black shadow-[0_0_25px_rgba(20,241,149,0.7)] hover:scale-110 active:scale-90 transition-all border-2 border-slate-950 cursor-pointer touch-manipulation shrink-0"
          title="Instant Buy $NOM on pump.fun"
        >
          <Flame className="w-6 h-6 fill-slate-950 text-slate-950 animate-bounce" />
          <span className="text-[8px] tracking-tighter leading-none mt-0.5 font-mono">BUY</span>
        </button>

        <a
          href="/#tokenomics"
          className="flex flex-col items-center justify-center min-w-[48px] min-h-[48px] py-1 px-2.5 rounded-2xl text-[10px] font-mono font-bold text-slate-300 hover:text-amber-300 active:scale-90 transition-all touch-manipulation"
        >
          <Coins className="w-5 h-5 mb-0.5 text-amber-400" />
          <span>Stats</span>
        </a>

        <a
          href="/#lore"
          className="flex flex-col items-center justify-center min-w-[48px] min-h-[48px] py-1 px-2.5 rounded-2xl text-[10px] font-mono font-bold text-slate-300 hover:text-purple-300 active:scale-90 transition-all touch-manipulation"
        >
          <BookOpen className="w-5 h-5 mb-0.5 text-purple-400" />
          <span>Lore</span>
        </a>
      </nav>

      {/* Quick Buy SOL Modal */}
      <QuickBuyModal
        isOpen={isQuickBuyOpen}
        onClose={() => setIsQuickBuyOpen(false)}
      />
    </>
  );
};
