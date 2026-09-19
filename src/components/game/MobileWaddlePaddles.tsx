"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";

interface MobileWaddlePaddlesProps {
  onWaddle: (direction: "left" | "right") => void;
  onDash?: () => void;
  dashReady?: boolean;
  disabled?: boolean;
}

export const MobileWaddlePaddles: React.FC<MobileWaddlePaddlesProps> = ({
  onWaddle,
  onDash,
  dashReady = true,
  disabled = false,
}) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startHold = (dir: "left" | "right") => {
    if (disabled) return;
    try {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(15);
      }
    } catch {
      // ignore
    }
    onWaddle(dir);
    intervalRef.current = setInterval(() => {
      onWaddle(dir);
    }, 90);
  };

  const endHold = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleDash = () => {
    if (disabled || !dashReady || !onDash) return;
    try {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([25, 40]);
      }
    } catch {
      // ignore
    }
    onDash();
  };

  return (
    <div className="w-full max-w-[440px] flex items-center justify-between gap-2.5 px-2 pt-2 sm:hidden select-none touch-none">
      {/* Waddle Left Paddle */}
      <button
        type="button"
        onPointerDown={() => startHold("left")}
        onPointerUp={endHold}
        onPointerLeave={endHold}
        disabled={disabled}
        className="flex-1 py-3.5 px-3 rounded-2xl bg-slate-900 active:bg-solana-green/25 border border-slate-700/80 active:border-solana-green text-slate-200 active:text-solana-green font-mono font-black text-xs flex items-center justify-center gap-1 shadow-lg transition-all active:scale-95 disabled:opacity-40"
      >
        <ChevronLeft className="w-5 h-5 text-solana-green" />
        <span>LEFT</span>
      </button>

      {/* Super Dash Center Button */}
      {onDash && (
        <button
          type="button"
          onClick={handleDash}
          disabled={disabled || !dashReady}
          className={`py-3.5 px-4 rounded-2xl font-mono font-black text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all active:scale-90 ${
            dashReady && !disabled
              ? "bg-gradient-to-r from-cyan-500 to-solana-green text-slate-950 shadow-[0_0_20px_rgba(20,241,149,0.5)] active:brightness-125"
              : "bg-slate-800 text-slate-500 border border-slate-700/60 opacity-60"
          }`}
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>{dashReady ? "DASH" : "RECHARGING"}</span>
        </button>
      )}

      {/* Waddle Right Paddle */}
      <button
        type="button"
        onPointerDown={() => startHold("right")}
        onPointerUp={endHold}
        onPointerLeave={endHold}
        disabled={disabled}
        className="flex-1 py-3.5 px-3 rounded-2xl bg-slate-900 active:bg-solana-green/25 border border-slate-700/80 active:border-solana-green text-slate-200 active:text-solana-green font-mono font-black text-xs flex items-center justify-center gap-1 shadow-lg transition-all active:scale-95 disabled:opacity-40"
      >
        <span>RIGHT</span>
        <ChevronRight className="w-5 h-5 text-solana-green" />
      </button>
    </div>
  );
};
