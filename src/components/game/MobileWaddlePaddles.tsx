"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MobileWaddlePaddlesProps {
  onWaddle: (direction: "left" | "right") => void;
  disabled?: boolean;
}

export const MobileWaddlePaddles: React.FC<MobileWaddlePaddlesProps> = ({
  onWaddle,
  disabled = false,
}) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startHold = (dir: "left" | "right") => {
    if (disabled) return;
    onWaddle(dir);
    intervalRef.current = setInterval(() => {
      onWaddle(dir);
    }, 100);
  };

  const endHold = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return (
    <div className="w-full max-w-[440px] flex items-center justify-between gap-3 px-2 pt-2 sm:hidden select-none touch-none">
      {/* Waddle Left Paddle */}
      <button
        type="button"
        onPointerDown={() => startHold("left")}
        onPointerUp={endHold}
        onPointerLeave={endHold}
        disabled={disabled}
        className="flex-1 py-3 px-4 rounded-xl bg-slate-900 active:bg-solana-green/20 border border-slate-700 active:border-solana-green/60 text-slate-200 active:text-solana-green font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-40"
      >
        <ChevronLeft className="w-5 h-5 text-solana-green" />
        <span>WADDLE LEFT</span>
      </button>

      {/* Waddle Right Paddle */}
      <button
        type="button"
        onPointerDown={() => startHold("right")}
        onPointerUp={endHold}
        onPointerLeave={endHold}
        disabled={disabled}
        className="flex-1 py-3 px-4 rounded-xl bg-slate-900 active:bg-solana-green/20 border border-slate-700 active:border-solana-green/60 text-slate-200 active:text-solana-green font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-40"
      >
        <span>WADDLE RIGHT</span>
        <ChevronRight className="w-5 h-5 text-solana-green" />
      </button>
    </div>
  );
};
