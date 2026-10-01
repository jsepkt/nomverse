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

  return (
    <>
      <div className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-[96vw] sm:max-w-max pointer-events-auto pb-[env(safe-area-inset-bottom,0px)]">
        <nav
          aria-label="Quick Action HUD"
          className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-full glass-pill border border-emerald-500/30 shadow-[0_10px_35px_rgba(0,0,0,0.85),0_0_20px_rgba(20,241,149,0.15)]"
        >
          {/* Quick Play */}
          <Link
            href="/play"
            onClick={() => sounds.playJumpSound()}
            className="tactile-button flex items-center gap-1 sm:gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-mono transition-all group shrink-0 min-h-[34px]"
          >
            <Gamepad2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>PLAY</span>
          </Link>

          {/* Quick Buy $NOM */}
          <button
            onClick={() => {
              sounds.playGoldenChime();
              setIsQuickBuyOpen(true);
            }}
            className="tactile-button flex items-center gap-1 sm:gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-solana-green text-slate-950 text-xs font-black font-mono shadow-[0_0_15px_rgba(20,241,149,0.3)] cursor-pointer shrink-0 min-h-[34px]"
          >
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-slate-950 text-slate-950" />
            <span>BUY<span className="hidden xs:inline"> $NOM</span></span>
          </button>

          {/* Arcade Vault */}
          <button
            onClick={() => {
              sounds.playButtonClick();
              setIsVaultOpen(true);
            }}
            className="tactile-button flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-mono transition-all cursor-pointer shrink-0 min-h-[34px]"
            title="Arcade Vault & Gasless Bank"
          >
            <Wallet className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">VAULT</span>
          </button>

          {/* Verify Mint */}
          <Link
            href="/guide"
            onClick={() => sounds.playButtonClick()}
            className="tactile-button hidden xs:flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-mono transition-all shrink-0 min-h-[34px]"
            title="Verify Mint & Guide"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">VERIFY</span>
          </Link>

          {/* Web Audio Synthesizer Sound Mute Toggle */}
          <button
            onClick={handleToggleSound}
            className={`tactile-button p-2 rounded-full border text-xs transition-all cursor-pointer shrink-0 min-h-[34px] min-w-[34px] flex items-center justify-center ${
              isMuted
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            }`}
            title={isMuted ? "Unmute 8-Bit Web Audio" : "Mute 8-Bit Web Audio"}
            aria-label={isMuted ? "Unmute sound" : "Mute sound"}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
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
