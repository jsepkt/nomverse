"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Gamepad2,
  Flame,
  ShieldCheck,
  Volume2,
  VolumeX,
  Wallet,
  Sparkles,
  Zap,
  Home,
  Palette,
  MessageSquare,
  Rocket,
} from "lucide-react";
import { TOKEN_CONFIG } from "@/config/token";
import { soundEngine } from "@/lib/soundEffects";
import { sounds } from "../audio/soundEffects";
import { ArcadeVaultModal } from "../game/ArcadeVaultModal";
import { QuickBuyModal } from "../wallet/QuickBuyModal";

export const QuickActionHUD: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMuted, setIsMuted] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isQuickBuyOpen, setIsQuickBuyOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsMuted(soundEngine.getMuted());

    const handleSoundToggle = (e: any) => {
      setIsMuted(e.detail.isMuted);
    };

    window.addEventListener("nomverse_sound_toggle", handleSoundToggle);
    return () => window.removeEventListener("nomverse_sound_toggle", handleSoundToggle);
  }, []);

  if (!mounted || pathname === "/play") return null;

  const handleToggleSound = () => {
    const nextMuted = soundEngine.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      soundEngine.playNomSound();
    }
  };

  const handleNavClick = (anchorId?: string) => {
    sounds.playButtonClick();
    if (anchorId) {
      if (pathname === "/") {
        const el = document.getElementById(anchorId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      } else {
        router.push(`/#${anchorId}`);
      }
    }
  };

  return (
    <>
      {/* ============================================================== */}
      {/* 1. MOBILE NATIVE BOTTOM APP DOCK (< md:)                      */}
      {/* Standard Telegram / iOS App Navigation with Elevated Buy Pill  */}
      {/* ============================================================== */}
      <nav
        aria-label="Mobile Bottom App Dock"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#050914]/95 backdrop-blur-2xl border-t border-slate-800/90 shadow-[0_-10px_35px_rgba(0,0,0,0.85)] pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] pt-1.5 px-2 select-none"
      >
        <div className="flex items-center justify-around w-full max-w-md mx-auto">
          {/* Tab 1: Home */}
          <Link
            href="/"
            onClick={() => handleNavClick()}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
              pathname === "/"
                ? "text-emerald-400 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Home className="w-5 h-5 shrink-0" />
            <span className="text-[10px] font-mono tracking-tight mt-0.5">Home</span>
          </Link>

          {/* Tab 2: Play Arcade */}
          <Link
            href="/play"
            onClick={() => sounds.playJumpSound()}
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer"
          >
            <div className="relative">
              <Gamepad2 className="w-5 h-5 shrink-0" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            </div>
            <span className="text-[10px] font-mono font-bold tracking-tight mt-0.5 text-emerald-400">Play</span>
          </Link>

          {/* Tab 3: Center Elevated BUY $NOM Action Button */}
          <button
            onClick={() => {
              sounds.playGoldenChime();
              setIsQuickBuyOpen(true);
            }}
            className="relative -top-2 flex flex-col items-center justify-center p-2 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-300 to-solana-green text-slate-950 shadow-[0_0_25px_rgba(20,241,149,0.55)] active:scale-90 transition-all cursor-pointer"
            title="Instant Buy $NOM on pump.fun"
          >
            <Zap className="w-5 h-5 fill-slate-950 text-slate-950 shrink-0" />
            <span className="text-[9px] font-mono font-black uppercase tracking-wider mt-0.5">BUY $NOM</span>
          </button>

          {/* Tab 4: Studio (Create) */}
          <button
            onClick={() => handleNavClick("create")}
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-400 hover:text-amber-400 transition-all cursor-pointer"
          >
            <Palette className="w-5 h-5 shrink-0" />
            <span className="text-[10px] font-mono tracking-tight mt-0.5">Studio</span>
          </button>

          {/* Tab 5: Community Wall */}
          <button
            onClick={() => handleNavClick("community")}
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-400 hover:text-teal-400 transition-all cursor-pointer"
          >
            <MessageSquare className="w-5 h-5 shrink-0" />
            <span className="text-[10px] font-mono tracking-tight mt-0.5">Wall</span>
          </button>
        </div>
      </nav>

      {/* ============================================================== */}
      {/* 2. DESKTOP FLOATING CAPSULE HUD (>= md:)                       */}
      {/* ============================================================== */}
      <div className="hidden md:block fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-max pointer-events-auto">
        <nav
          aria-label="Desktop Quick Action HUD"
          className="flex items-center gap-2 p-2 rounded-full glass-pill border border-emerald-500/30 shadow-[0_10px_35px_rgba(0,0,0,0.85),0_0_20px_rgba(20,241,149,0.15)]"
        >
          {/* Quick Play */}
          <Link
            href="/play"
            onClick={() => sounds.playJumpSound()}
            className="tactile-button flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-mono transition-all group shrink-0 min-h-[36px]"
          >
            <Gamepad2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
            <span>PLAY</span>
          </Link>

          {/* Quick Buy $NOM */}
          <button
            onClick={() => {
              sounds.playGoldenChime();
              setIsQuickBuyOpen(true);
            }}
            className="tactile-button flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-solana-green text-slate-950 text-xs font-black font-mono shadow-[0_0_15px_rgba(20,241,149,0.3)] cursor-pointer shrink-0 min-h-[36px]"
          >
            <Zap className="w-4 h-4 fill-slate-950 text-slate-950 shrink-0" />
            <span>BUY $NOM</span>
          </button>

          {/* Arcade Vault */}
          <button
            onClick={() => {
              sounds.playButtonClick();
              setIsVaultOpen(true);
            }}
            className="tactile-button flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-mono transition-all cursor-pointer shrink-0 min-h-[36px]"
            title="Arcade Vault & Gasless Bank"
          >
            <Wallet className="w-4 h-4 text-amber-400 shrink-0" />
            <span>VAULT</span>
          </button>

          {/* Verify Mint */}
          <Link
            href="/guide"
            onClick={() => sounds.playButtonClick()}
            className="tactile-button flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-mono transition-all shrink-0 min-h-[36px]"
            title="Verify Mint & Guide"
          >
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
            <span>VERIFY</span>
          </Link>

          {/* Web Audio Synthesizer Sound Mute Toggle */}
          <button
            onClick={handleToggleSound}
            className={`tactile-button p-2 rounded-full border text-xs transition-all cursor-pointer shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center ${
              isMuted
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            }`}
            title={isMuted ? "Unmute 8-Bit Web Audio" : "Mute 8-Bit Web Audio"}
            aria-label={isMuted ? "Unmute sound" : "Mute sound"}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 shrink-0" />
            ) : (
              <Volume2 className="w-4 h-4 animate-pulse shrink-0" />
            )}
          </button>
        </nav>
      </div>

      {/* Arcade Vault Modal */}
      <ArcadeVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
      />

      {/* Quick Buy SOL Modal */}
      <QuickBuyModal
        isOpen={isQuickBuyOpen}
        onClose={() => setIsQuickBuyOpen(false)}
      />
    </>
  );
};
