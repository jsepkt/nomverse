"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Download,
  Share2,
  Trophy,
  Sparkles,
  Flame,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getClientLifeState } from "@/lib/lifeSystem";
import { calculateUserXP } from "@/lib/contributions";
import { TOKEN_CONFIG } from "@/config/token";
import { sounds } from "../audio/soundEffects";
import { copyToClipboard } from "@/lib/clipboard";

export const ViralCardStudio: React.FC = () => {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [highScore, setHighScore] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [holoAngle, setHoloAngle] = useState<number>(45);
  const mascotImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    try {
      const hs = localStorage.getItem("nomverse_highscore");
      if (hs) setHighScore(parseInt(hs, 10) || 0);
      const ms = localStorage.getItem("nomverse_max_streak");
      if (ms) setMaxStreak(parseInt(ms, 10) || 0);
    } catch {
      // ignore
    }

    const img = new Image();
    img.src = "/mascot.svg";
    img.onload = () => {
      mascotImgRef.current = img;
      renderCard();
    };
  }, []);

  const userId = user?.id || "guest";
  const karma = user ? getClientLifeState(user.id).lifesaverKarma || 0 : 0;
  const userXP = calculateUserXP(userId, karma, highScore, maxStreak);

  // Render high-res holographic foil card
  const renderCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // 1. Deep Space Card Background
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, "#080F21");
    bgGrad.addColorStop(0.5, "#040711");
    bgGrad.addColorStop(1, "#0A1628");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Holographic Foil Border & Accent Sheen
    const rad = (holoAngle * Math.PI) / 180;
    const x1 = w / 2 - Math.cos(rad) * (w / 2);
    const y1 = h / 2 - Math.sin(rad) * (h / 2);
    const x2 = w / 2 + Math.cos(rad) * (w / 2);
    const y2 = h / 2 + Math.sin(rad) * (h / 2);

    const holoGrad = ctx.createLinearGradient(x1, y1, x2, y2);
    holoGrad.addColorStop(0, "#14F195");
    holoGrad.addColorStop(0.25, "#00F0FF");
    holoGrad.addColorStop(0.5, "#9945FF");
    holoGrad.addColorStop(0.75, "#FF007A");
    holoGrad.addColorStop(1, "#F59E0B");

    ctx.strokeStyle = holoGrad;
    ctx.lineWidth = 10;
    ctx.strokeRect(12, 12, w - 24, h - 24);

    // 3. Cyber Grid Lines
    ctx.strokeStyle = "rgba(30, 41, 59, 0.4)";
    ctx.lineWidth = 1;
    for (let x = 40; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, h - 20);
      ctx.stroke();
    }
    for (let y = 40; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(w - 20, y);
      ctx.stroke();
    }

    // 4. Header Badge Pill
    ctx.fillStyle = "rgba(20, 241, 149, 0.15)";
    ctx.strokeStyle = "#14F195";
    ctx.lineWidth = 2;
    ctx.roundRect(40, 36, 420, 40, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#14F195";
    ctx.font = "900 16px monospace";
    ctx.fillText("★ NOMVERSE VERIFIED ARCADE RECORD ★", 56, 62);

    // 5. Main Title & Contributor Rank
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 42px monospace";
    ctx.fillText("NOMSTER FEAST", 40, 130);

    ctx.fillStyle = "#F59E0B";
    ctx.font = "700 20px monospace";
    ctx.fillText(
      `RANK: LEVEL ${userXP.levelInfo.level} • ${userXP.levelInfo.title.toUpperCase()}`,
      40,
      165
    );

    // 6. Score & Streak Stats Blocks
    // High Score Box
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.strokeStyle = "rgba(20, 241, 149, 0.5)";
    ctx.lineWidth = 2;
    ctx.roundRect(40, 200, 260, 140, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#94A3B8";
    ctx.font = "700 14px monospace";
    ctx.fillText("HIGH SCORE", 60, 235);

    ctx.fillStyle = "#14F195";
    ctx.font = "900 52px monospace";
    ctx.fillText(`${highScore}`, 60, 300);

    // Max Streak Box
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.strokeStyle = "rgba(245, 158, 11, 0.5)";
    ctx.lineWidth = 2;
    ctx.roundRect(320, 200, 240, 140, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#94A3B8";
    ctx.font = "700 14px monospace";
    ctx.fillText("MAX COMBO STREAK", 340, 235);

    ctx.fillStyle = "#F59E0B";
    ctx.font = "900 52px monospace";
    ctx.fillText(`x${maxStreak}`, 340, 300);

    // 7. Right Mascot Illustration Aura
    const auraGrad = ctx.createRadialGradient(820, 230, 20, 820, 230, 160);
    auraGrad.addColorStop(0, "rgba(20, 241, 149, 0.25)");
    auraGrad.addColorStop(0.5, "rgba(153, 69, 255, 0.15)");
    auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(820, 230, 160, 0, Math.PI * 2);
    ctx.fill();

    // Nomster Mascot Illustration
    if (mascotImgRef.current && mascotImgRef.current.complete) {
      ctx.drawImage(mascotImgRef.current, 720, 130, 200, 200);
    } else {
      ctx.font = "140px serif";
      ctx.fillText("🦆", 750, 280);
    }

    // 8. Footer Telemetry & Legal CC0 Assurance
    ctx.strokeStyle = "#1E293B";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 380);
    ctx.lineTo(w - 40, 380);
    ctx.stroke();

    ctx.fillStyle = "#64748B";
    ctx.font = "13px monospace";
    ctx.fillText("FAIR LAUNCH ON PUMP.FUN • ZERO ROYALTIES • CC0 1.0 PUBLIC DOMAIN", 40, 415);

    ctx.fillStyle = "#14F195";
    ctx.font = "700 13px monospace";
    ctx.fillText("PLAY INSTANT AT: NOMVERSE.VERCEL.APP/PLAY", 40, 440);
  }, [highScore, maxStreak, userXP, holoAngle]);

  useEffect(() => {
    renderCard();
  }, [renderCard]);

  // Download card as high-res PNG
  const handleDownloadCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `nomverse_flex_card_${highScore}pts.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    sounds.playGoldenChime();
  };

  // 1-Click Tweet Intent
  const handleTweetScore = () => {
    const text = encodeURIComponent(
      `Just scored ${highScore} candies in @nomverse's browser arcade with a x${maxStreak} combo streak! 🦆🍬\n\n100% CC0 public domain & fair launch on @pumpdotfun.\nCan you beat my high score? Play instant with zero friction:`
    );
    const url = encodeURIComponent("https://nomverse.vercel.app/play");
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  return (
    <div className="w-full rounded-3xl bg-slate-950/80 border border-slate-800 p-5 sm:p-6 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white">Holographic Flex Trading Card Studio</h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30">
                1-Click Viral Flex
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Render your actual gameplay achievements into a high-definition holographic foil trading card.
            </p>
          </div>
        </div>

        {/* Holo Angle Shimmer Slider */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 self-start sm:self-auto">
          <span>Foil Angle:</span>
          <input
            type="range"
            min="0"
            max="360"
            value={holoAngle}
            onChange={(e) => setHoloAngle(parseInt(e.target.value, 10))}
            className="w-24 accent-emerald-400 cursor-pointer"
          />
        </div>
      </div>

      {/* High-Resolution Canvas Card Container */}
      <div className="w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-[#080f21]">
        <canvas
          ref={canvasRef}
          width={1000}
          height={480}
          className="w-full h-auto block select-none"
        />
      </div>

      {/* Action Buttons: 1-Click Export & Share */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 font-mono">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleDownloadCard}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-emerald-400 via-teal-300 to-solana-green text-slate-950 shadow-[0_0_20px_rgba(20,241,149,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>Download 4K Card (.PNG)</span>
          </button>

          <button
            onClick={handleTweetScore}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-white border border-cyan-500/40 hover:border-cyan-400 transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4 text-cyan-400" />
            <span>Share on X / Twitter</span>
          </button>
        </div>

        <div className="text-xs text-slate-300 flex items-center gap-1.5 self-center sm:self-auto font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>100% Authentic Real Player Data</span>
        </div>
      </div>
    </div>
  );
};
