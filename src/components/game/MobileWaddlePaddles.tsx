"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { triggerTelegramHaptic } from "@/context/AuthContext";

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
    triggerTelegramHaptic("light");
    onWaddle(dir);
    intervalRef.current = setInterval(() => {
      onWaddle(dir);
    }, 60);
  };

  const endHold = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleDash = () => {
    if (disabled || !dashReady || !onDash) return;
    triggerTelegramHaptic("heavy");
    onDash();
  };

  return (
    <div className="w-full max-w-[440px] sm:max-w-[500px] flex flex-col items-center gap-1.5 px-2 pt-2 lg:hidden select-none touch-none">
      <div className="flex items-center justify-between w-full gap-2 sm:gap-3">
        {/* Waddle Left Paddle */}
        <button
          type="button"
          onPointerDown={() => startHold("left")}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          disabled={disabled}
          className="flex-1 min-h-[48px] sm:min-h-[54px] py-3 px-3 sm:px-4 rounded-2xl bg-slate-900 active:bg-solana-green/25 border border-slate-700/80 active:border-solana-green text-slate-200 active:text-solana-green font-mono font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg transition-all active:scale-95 disabled:opacity-40 touch-manipulation cursor-pointer select-none"
        >
          <ChevronLeft className="w-5 h-5 text-solana-green shrink-0" />
          <span>LEFT</span>
        </button>

        {/* Super Dash Center Button */}
        {onDash && (
          <button
            type="button"
            onClick={handleDash}
            disabled={disabled || !dashReady}
            className={`min-h-[48px] sm:min-h-[54px] py-3 px-4 sm:px-6 rounded-2xl font-mono font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg transition-all active:scale-90 touch-manipulation cursor-pointer select-none ${
              dashReady && !disabled
                ? "bg-gradient-to-r from-cyan-500 to-solana-green text-slate-950 shadow-[0_0_20px_rgba(20,241,149,0.5)] active:brightness-125"
                : "bg-slate-800 text-slate-500 border border-slate-700/60 opacity-60"
            }`}
          >
            <Zap className="w-4 h-4 fill-current shrink-0" />
            <span>{dashReady ? "DASH" : "WAIT"}</span>
          </button>
        )}

        {/* Waddle Right Paddle */}
        <button
          type="button"
          onPointerDown={() => startHold("right")}
          onPointerUp={endHold}
          onPointerLeave={endHold}
          disabled={disabled}
          className="flex-1 min-h-[48px] sm:min-h-[54px] py-3 px-3 sm:px-4 rounded-2xl bg-slate-900 active:bg-solana-green/25 border border-slate-700/80 active:border-solana-green text-slate-200 active:text-solana-green font-mono font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg transition-all active:scale-95 disabled:opacity-40 touch-manipulation cursor-pointer select-none"
        >
          <span>RIGHT</span>
          <ChevronRight className="w-5 h-5 text-solana-green shrink-0" />
        </button>
      </div>
      <span className="text-[10px] sm:text-xs font-mono text-slate-400">
        💡 Tip: Drag finger directly across arcade screen or tap paddles to steer Nomster
      </span>
    </div>
  );
};
