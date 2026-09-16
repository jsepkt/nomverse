"use client";

import React, { useState, useEffect } from "react";
import { Flame, Sparkles } from "lucide-react";

export const GlobalCandiesTicker: React.FC = () => {
  const [totalCandies, setTotalCandies] = useState<number>(24810);

  useEffect(() => {
    // Initial load from storage or default
    try {
      const saved = localStorage.getItem("nomverse_global_candies");
      if (saved) {
        setTotalCandies(parseInt(saved, 10));
      } else {
        localStorage.setItem("nomverse_global_candies", "24810");
      }
    } catch {
      // ignore
    }

    // Gentle live background ticker simulation
    const interval = setInterval(() => {
      setTotalCandies((prev) => {
        const next = prev + Math.floor(Math.random() * 2) + 1;
        try {
          localStorage.setItem("nomverse_global_candies", next.toString());
        } catch {
          // ignore
        }
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-light/60 border border-slate-700/60 shadow-sm text-xs font-mono">
      <span className="w-2 h-2 rounded-full bg-candy-gold animate-ping inline-block" />
      <span className="text-slate-400 hidden sm:inline">Universe Feasted:</span>
      <span className="font-bold text-candy-gold font-mono tracking-tight">
        {totalCandies.toLocaleString()} 🍬
      </span>
    </div>
  );
};
