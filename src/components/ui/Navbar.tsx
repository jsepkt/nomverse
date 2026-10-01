"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
import { TOKEN_CONFIG } from "@/config/token";
import { QuickBuyModal } from "../wallet/QuickBuyModal";
import { sounds } from "../audio/soundEffects";

// 5 Core Desktop Categories
const NAV_ITEMS = [
  { label: "Play", href: "/play", icon: Gamepad2, color: "text-emerald-400" },
  { label: "Universe", href: "/#universe", icon: BookOpen, color: "text-purple-400" },
  { label: "Create", href: "/#create", icon: Palette, color: "text-amber-400" },
  { label: "Community", href: "/#community", icon: MessageSquare, color: "text-teal-400" },
  { label: "$NOM", href: "/tokenomics", icon: Flame, color: "text-rose-400" },
];

const SECONDARY_PAGES = [
  { label: "How to Buy", href: "/guide", icon: Sparkles, color: "text-teal-400", desc: "3-step wallet onboarding & scam detector" },
  { label: "CC0 Manifesto", href: "/manifesto", icon: ShieldCheck, color: "text-purple-400", desc: "Public domain whitepaper & anti-rug proof" },
  { label: "Security Audit", href: "/security", icon: ShieldCheck, color: "text-cyan-400", desc: "Revoked authorities & live on-chain audit" },
  { label: "Hall of Fame", href: "/hall-of-fame", icon: Coins, color: "text-amber-400", desc: "Top token incinerators & arcade champions" },
];

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, openAuthModal, logout, realNomBalance } = useAuth();
  const [isQuickBuyOpen, setIsQuickBuyOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 25);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = () => {
    sounds.playButtonClick();
    setIsMobileMenuOpen(false);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    sounds.playJumpSound();
    setIsMobileMenuOpen(false);
    const isMobile = window.innerWidth < 1024;
    router.push(isMobile ? "/play?mode=full" : "/play");
  };

  return (
    <>
      <header className="sticky top-2 sm:top-3 z-50 px-3 sm:px-6 w-full max-w-7xl mx-auto transition-all duration-300">
        {/* Floating Capsule Island Navbar */}
        <div
          className={`rounded-2xl sm:rounded-full transition-all duration-300 px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 ${
            scrolled
              ? "bg-slate-950/90 backdrop-blur-2xl border border-emerald-500/30 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(20,241,149,0.15)]"
              : "bg-slate-950/75 backdrop-blur-xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          }`}
        >
          {/* Brand & Mascot */}
          <Link
            href="/"
            onClick={() => sounds.playButtonClick()}
            className="flex items-center gap-2.5 group focus:outline-none shrink-0"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-500/15 border border-emerald-400/50 p-1 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:border-emerald-400 group-hover:shadow-[0_0_20px_rgba(20,241,149,0.4)]">
              <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping opacity-25 pointer-events-none" />
              <Image
                src="/mascot.svg"
                alt="Nomster Mascot"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>

            <div className="flex flex-col">
              <span className="font-black text-base sm:text-lg tracking-tight text-white flex items-center gap-1 leading-tight">
                NOM<span className="text-solana-green">VERSE</span>
              </span>
              <span className="text-[9px] font-mono tracking-widest uppercase text-emerald-400/90 flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                CC0 Mascot
              </span>
            </div>
          </Link>

          {/* Desktop Center Pill Links */}
          <nav className="hidden md:flex items-center gap-1 font-mono text-xs lg:text-sm font-bold">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === pathname ||
                (item.href.startsWith("/#") && pathname === "/" && false);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => sounds.playButtonClick()}
                  className={`px-3 py-1.5 rounded-full transition-all duration-200 ${
                    isActive
                      ? "bg-white/10 text-emerald-300 font-black shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-white/[0.07]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Island */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Primary PLAY NOW 3D Tactile Button */}
            <button
              onClick={handlePlayClick}
              className="tactile-button relative group inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-solana-green text-slate-950 shadow-[0_0_20px_rgba(20,241,149,0.35)] hover:shadow-[0_0_30px_rgba(20,241,149,0.65)] shrink-0 cursor-pointer"
              title="Launch Retro Arcade"
            >
              <Gamepad2 className="w-3.5 h-3.5 fill-slate-950 text-slate-950 group-hover:scale-110 transition-transform" />
              <span>PLAY NOW</span>
            </button>

            {/* Quick Buy Gold Pill */}
            <button
              onClick={() => {
                sounds.playGoldenChime();
                setIsQuickBuyOpen(true);
              }}
              className="tactile-button inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-full text-xs font-mono font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 hover:border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)] shrink-0 cursor-pointer"
              title="Instant Buy $NOM"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Buy $NOM</span>
            </button>

            {/* User Auth Pill / Connect Wallet */}
            {user ? (
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 shrink-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white max-w-[130px] lg:max-w-[180px]">
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
                  className="p-1 rounded-full text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  sounds.playButtonClick();
                  openAuthModal();
                }}
                className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-bold bg-slate-900/80 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/60 transition-all cursor-pointer shrink-0"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Connect</span>
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => {
                sounds.playButtonClick();
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              className="relative md:hidden p-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-200 hover:text-white transition-all active:scale-95 shrink-0"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-rose-400 animate-in spin-in-90 duration-150" />
              ) : (
                <Menu className="w-5 h-5 text-emerald-400 animate-in fade-in duration-150" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Frosted Glass Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-2 rounded-3xl border border-white/10 bg-slate-950/95 backdrop-blur-2xl shadow-2xl p-4 space-y-4 animate-in slide-in-from-top-3 duration-200 max-h-[calc(100vh-6rem)] overflow-y-auto">
            {/* Quick Header Actions */}
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              {!user ? (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuthModal();
                  }}
                  className="flex-1 min-h-[46px] py-2.5 px-3 rounded-2xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-2 touch-manipulation"
                >
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span>Connect Wallet</span>
                </button>
              ) : (
                <div className="flex-1 flex items-center justify-between p-2 rounded-2xl bg-slate-900 border border-slate-800">
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
                className="min-h-[46px] py-2.5 px-4 rounded-2xl font-mono text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 touch-manipulation"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Buy $NOM</span>
              </button>
            </div>

            {/* Core Destinations */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold px-1">
                Ecosystem
              </div>
              <div className="grid grid-cols-1 gap-1.5">
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
                      className="flex items-center justify-between min-h-[48px] p-3 rounded-2xl bg-surface/70 hover:bg-slate-800 border border-slate-800/80 transition-all group touch-manipulation"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                          <Icon className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <span className="font-bold text-sm text-white group-hover:text-emerald-300">
                          {item.label}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white shrink-0" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Secondary Destinations */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold px-1">
                Documentation &amp; Trust
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SECONDARY_PAGES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={handleNavClick}
                      className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex flex-col justify-between min-h-[70px] touch-manipulation"
                    >
                      <div className="flex items-center gap-1.5">
                        <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                        <span className="text-xs font-bold text-slate-200">{item.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{item.desc}</p>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* External Links */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
              <a
                href={TOKEN_CONFIG.pumpFunUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] p-2.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center gap-2 text-xs font-bold text-slate-200"
              >
                <Rocket className="w-3.5 h-3.5 text-emerald-400" />
                <span>pump.fun</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>

              <a
                href="https://github.com/jsepkt/nomverse"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] p-2.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center gap-2 text-xs font-bold text-slate-200"
              >
                <GithubIcon className="w-3.5 h-3.5 text-slate-200" />
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </div>

            {/* CC0 Assurance Footer */}
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
