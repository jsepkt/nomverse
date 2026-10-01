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
import { TokenTickerBar } from "./TokenTickerBar";
import { TOKEN_CONFIG } from "@/config/token";
import { QuickBuyModal } from "../wallet/QuickBuyModal";

// Section 3 UX Audit: Desktop navigation: Play | Universe | Create | Community | $NOM
const DESKTOP_NAV_ITEMS = [
  { label: "Play", href: "/play", icon: Gamepad2, color: "text-emerald-400" },
  { label: "Universe", href: "/#universe", icon: BookOpen, color: "text-purple-400" },
  { label: "Create", href: "/#create", icon: Palette, color: "text-amber-400" },
  { label: "Community", href: "/#community", icon: MessageSquare, color: "text-teal-400" },
  { label: "$NOM", href: "/tokenomics", icon: Flame, color: "text-rose-400" },
];

// Mobile drawer primary items
const MOBILE_PRIMARY_NAV = [
  {
    label: "Play",
    href: "/play",
    icon: Gamepad2,
    color: "text-emerald-400",
    description: "Retro physics arcade, game rooms & guest play",
    badge: "Playable",
  },
  {
    label: "Universe",
    href: "/#universe",
    icon: BookOpen,
    color: "text-purple-400",
    description: "Living lore, characters & community story chapters",
    badge: "Lore",
  },
  {
    label: "Create",
    href: "/#create",
    icon: Palette,
    color: "text-amber-400",
    description: "Meme Studio, Pixel Skins, NomBeats & CC0 assets",
    badge: "Studio",
  },
  {
    label: "Community",
    href: "/#community",
    icon: MessageSquare,
    color: "text-teal-400",
    description: "NomWall discussions, quests & high score flex",
    badge: "Wall",
  },
  {
    label: "$NOM",
    href: "/tokenomics",
    icon: Flame,
    color: "text-rose-400",
    description: "Supply, 0% tax, deflation simulator & live burns",
    badge: "1% Burn",
  },
];

// Mobile drawer trust & utility destinations
const MOBILE_TRUST_NAV = [
  {
    label: "How to Buy Guide",
    href: "/guide",
    icon: Sparkles,
    color: "text-teal-400",
    description: "Step-by-step wallet setup & contract verification",
  },
  {
    label: "CC0 Manifesto",
    href: "/manifesto",
    icon: ShieldCheck,
    color: "text-purple-400",
    description: "Public domain whitepaper & mathematical anti-rug proof",
  },
  {
    label: "Security Audit",
    href: "/security",
    icon: ShieldCheck,
    color: "text-cyan-400",
    description: "Revoked authorities & live on-chain verification",
  },
  {
    label: "Hall of Fame",
    href: "/hall-of-fame",
    icon: Coins,
    color: "text-amber-400",
    description: "Top token incinerators & arcade champions",
  },
];

export const Navbar: React.FC = () => {
  const router = useRouter();
  const { user, openAuthModal, logout, realNomBalance } = useAuth();
  const [isQuickBuyOpen, setIsQuickBuyOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

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
            ? "border-b border-emerald-500/20 bg-background/95 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
            : "border-b border-slate-800/80 bg-background/85 backdrop-blur-xl"
        }`}
      >
        <TokenTickerBar />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
          {/* Brand & Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-2.5 group focus:outline-none"
            >
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-500/15 border border-emerald-400/50 p-1 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:border-emerald-400 group-hover:shadow-[0_0_20px_rgba(20,241,149,0.35)]">
                <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping opacity-25 pointer-events-none" />
                <Image
                  src="/mascot.svg"
                  alt="Nomster Mascot"
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
                  Fair Launch • CC0
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation: Play | Universe | Create | Community | $NOM (Section 3 UX Audit) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 font-mono text-xs lg:text-sm font-bold">
            {DESKTOP_NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-3 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all border border-transparent hover:border-slate-700/60"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Action Buttons & Web3 Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Primary PLAY NOW CTA Button (Section 14: Primary) */}
            <button
              onClick={handlePlayClick}
              className="relative group inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-solana-green text-slate-950 shadow-[0_0_20px_rgba(20,241,149,0.35)] hover:shadow-[0_0_30px_rgba(20,241,149,0.65)] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
              title="Play NomVerse Game"
            >
              <Gamepad2 className="w-3.5 h-3.5 fill-slate-950 text-slate-950 group-hover:animate-bounce shrink-0" />
              <span>PLAY NOW</span>
            </button>

            {/* Clear Buy $NOM CTA (Section 3 & 14: Crypto-specific action) */}
            <button
              onClick={() => setIsQuickBuyOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-mono font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 hover:border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:scale-105 transition-all shrink-0 cursor-pointer"
              title="Instant Buy $NOM"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Buy $NOM</span>
            </button>

            {/* User Auth Pill / Sign In (Desktop / Tablet) */}
            {user ? (
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-sm shrink-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white max-w-[140px] lg:max-w-[200px]">
                  <span className="truncate">{user.name}</span>
                  <UserBadge provider={user.provider} showText={false} />
                  {["phantom", "solflare", "backpack"].includes(user.provider) && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 truncate">
                      {realNomBalance.toLocaleString()} $NOM
                    </span>
                  )}
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
                className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 transition-all cursor-pointer shrink-0"
              >
                <Wallet className="w-3.5 h-3.5 shrink-0" />
                <span>Connect Wallet</span>
              </button>
            )}

            {/* GitHub Repo Button (Desktop) */}
            <a
              href="https://github.com/jsepkt/nomverse"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 hover:border-slate-500 transition-all hover:scale-105 active:scale-95 shrink-0"
              title="Fork on GitHub"
            >
              <GithubIcon className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <span>GitHub</span>
            </a>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              className="relative md:hidden p-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-200 hover:text-white hover:bg-slate-800 transition-all active:scale-95 shrink-0"
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

        {/* Mobile Slide-Down Navigation Drawer (Section 3 & 5 UX Audit) */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-emerald-500/20 bg-slate-950/98 backdrop-blur-2xl shadow-2xl animate-in slide-in-from-top-4 duration-200 overflow-hidden">
            <div className="px-4 py-4 space-y-4 max-h-[calc(100vh-5rem)] overflow-y-auto">
              {/* Mobile Quick Header Actions */}
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
                {!user ? (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openAuthModal();
                    }}
                    className="flex-1 min-h-[44px] py-2.5 px-3 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-2 touch-manipulation"
                  >
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    <span>Connect Wallet</span>
                  </button>
                ) : (
                  <div className="flex-1 flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center gap-2">
                      <UserBadge provider={user.provider} showText={false} />
                      <span className="text-xs font-bold text-white truncate max-w-[140px]">
                        {user.name}
                      </span>
                    </div>
                    <button
                      onClick={logout}
                      className="px-2.5 py-1 text-xs font-mono text-rose-400 bg-rose-500/10 rounded-lg border border-rose-500/20 min-h-[36px]"
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
                  className="min-h-[44px] py-2.5 px-3.5 rounded-xl font-mono text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 touch-manipulation shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Buy $NOM</span>
                </button>
              </div>

              {/* Primary 5 Categories (Section 3 UX Audit) */}
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 font-bold">
                  Core Universe
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {MOBILE_PRIMARY_NAV.map((item) => {
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
                        className="flex items-center justify-between min-h-[48px] p-3 rounded-2xl bg-surface/80 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 transition-all active:scale-[0.98] group touch-manipulation"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                            <Icon className={`w-4 h-4 ${item.color}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                                {item.label}
                              </span>
                              {item.badge && (
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors shrink-0 ml-1" />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Trust & Guide Section (Section 3 UX Audit secondary destinations) */}
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 font-bold">
                  Trust &amp; Documentation
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {MOBILE_TRUST_NAV.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={handleNavClick}
                        className="flex flex-col justify-between min-h-[64px] p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 text-left touch-manipulation active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                          <span className="text-xs font-bold text-slate-200">
                            {item.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1">
                          {item.description}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* External Protocol Links in Mobile Drawer */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                <a
                  href={TOKEN_CONFIG.pumpFunUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-center gap-2 text-xs font-bold text-slate-200"
                >
                  <Rocket className="w-3.5 h-3.5 text-emerald-400" />
                  <span>pump.fun</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>

                <a
                  href="https://github.com/jsepkt/nomverse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-center gap-2 text-xs font-bold text-slate-200"
                >
                  <GithubIcon className="w-3.5 h-3.5 text-slate-200" />
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </div>

              {/* Mobile CC0 Assurance Badge */}
              <div className="pt-1 text-center">
                <Link
                  href="/manifesto"
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

      {/* Quick Buy SOL Modal */}
      <QuickBuyModal
        isOpen={isQuickBuyOpen}
        onClose={() => setIsQuickBuyOpen(false)}
      />
    </>
  );
};
