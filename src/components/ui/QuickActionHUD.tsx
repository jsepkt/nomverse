"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Gamepad2,
  Flame,
  ShieldCheck,
  Volume2,
  VolumeX,
  Wallet,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { TOKEN_CONFIG } from "@/config/token";
import { soundEngine } from "@/lib/soundEffects";
import { ArcadeVaultModal } from "../game/ArcadeVaultModal";

export const QuickActionHUD: React.FC = () => {
  const router = useRouter();
  const [isMuted, setIsMuted] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
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

  if (!mounted) return null;

  const handleToggleSound = () => {
    const nextMuted = soundEngine.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      soundEngine.playNomSound();
    }
  };

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-[95vw] sm:max-w-max">
        <nav
          aria-label="Quick Action HUD"
          className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-2xl bg-gray-950/85 border border-emerald-500/30 backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] shadow-emerald-500/10"
        >
          {/* Quick Play */}
          <Link
            href="/play"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold font-mono transition-all active:scale-95 group"
          >
            <Gamepad2 className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden xs:inline">PLAY</span>
          </Link>

          {/* Trade on pump.fun */}
          <a
            href={TOKEN_CONFIG.pumpFunUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black text-xs font-black font-mono transition-all active:scale-95 shadow-md shadow-emerald-500/20"
          >
            <Flame className="w-4 h-4 fill-black" />
            <span>BUY $NOM</span>
          </a>

          {/* Arcade Vault */}
          <button
            onClick={() => setIsVaultOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-900/80 hover:bg-gray-800 border border-gray-700/80 text-gray-200 text-xs font-mono transition-all active:scale-95"
            title="Arcade Bank & Vault"
          >
            <Wallet className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">VAULT</span>
          </button>

          {/* Verify Mint */}
          <Link
            href="/guide"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-900/80 hover:bg-gray-800 border border-gray-700/80 text-gray-200 text-xs font-mono transition-all active:scale-95"
            title="Verify Mint & Guide"
          >
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span className="hidden sm:inline">VERIFY</span>
          </Link>

          {/* Web Audio Synthesizer Sound Mute Toggle */}
          <button
            onClick={handleToggleSound}
            className={`p-2 rounded-xl border text-xs transition-all active:scale-95 ${
              isMuted
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            }`}
            title={isMuted ? "Unmute 8-Bit Audio" : "Mute 8-Bit Audio"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </nav>
      </div>

      {/* Embedded Arcade Vault Modal */}
      <ArcadeVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
      />
    </>
  );
};
