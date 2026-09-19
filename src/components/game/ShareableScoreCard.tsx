"use client";

import React, { useRef, useEffect, useState } from "react";
import { Download, Copy, CheckCircle2, Share2, Sparkles, Trophy } from "lucide-react";
import { SkinId } from "@/lib/skins";
import { TOKEN_CONFIG } from "@/config/token";
import { copyToClipboard } from "@/lib/clipboard";

interface ShareableScoreCardProps {
  score: number;
  streak: number;
  equippedSkin: SkinId;
  userName?: string;
}

export const ShareableScoreCard: React.FC<ShareableScoreCardProps> = ({
  score,
  streak,
  equippedSkin,
  userName = "Anonymous Nomster",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 640;
    const height = 360;
    canvas.width = width;
    canvas.height = height;

    // Background Cyber Grid
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#080F21");
    grad.addColorStop(0.5, "#04070D");
    grad.addColorStop(1, "#0A1628");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Neon Accent Border
    ctx.strokeStyle = "#14F195";
    ctx.lineWidth = 3;
    ctx.strokeRect(6, 6, width - 12, height - 12);

    // Subtle Grid lines
    ctx.strokeStyle = "#1E293B";
    ctx.lineWidth = 1;
    for (let x = 20; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 20; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Header Badge
    ctx.fillStyle = "#10B98120";
    ctx.strokeStyle = "#10B98180";
    ctx.lineWidth = 1.5;
    ctx.roundRect(24, 20, 260, 28, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#14F195";
    ctx.font = "bold 11px monospace";
    ctx.fillText("★ OFFICIAL NOMVERSE ARCADE RUN ★", 34, 38);

    // Title
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 26px monospace";
    ctx.fillText("NOMSTER ARCADE FLEX", 24, 80);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "12px monospace";
    ctx.fillText(`PLAYER: ${userName.slice(0, 20)}`, 24, 102);

    // Giant Score Card Box
    ctx.fillStyle = "#0F172A";
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 2;
    ctx.roundRect(24, 120, 360, 130, 12);
    ctx.fill();
    ctx.stroke();

    // Score Value
    ctx.fillStyle = "#14F195";
    ctx.font = "bold 48px monospace";
    ctx.fillText(`${score}`, 40, 175);

    ctx.fillStyle = "#F59E0B";
    ctx.font = "bold 13px monospace";
    ctx.fillText("CANDIES DEVOURED 🍬", 40, 200);

    // Streak & Boss Damage Stats
    ctx.fillStyle = "#94A3B8";
    ctx.font = "11px monospace";
    ctx.fillText(`• MAX COMBO STREAK: x${Math.max(1, streak)}`, 40, 222);
    ctx.fillText(`• RAID DAMAGE: -${score} HP to Lord Mega-FUD 💥`, 40, 238);

    // Draw Nomster Avatar on the right
    const mascotX = 490;
    const mascotY = 175;

    // Outer Glow Ring
    ctx.fillStyle = "#14F19515";
    ctx.beginPath();
    ctx.arc(mascotX, mascotY, 70, 0, Math.PI * 2);
    ctx.fill();

    // Nomster body (green circle)
    ctx.fillStyle = "#10B981";
    ctx.beginPath();
    ctx.arc(mascotX, mascotY + 10, 52, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(mascotX - 16, mascotY - 6, 15, 0, Math.PI * 2);
    ctx.arc(mascotX + 16, mascotY - 6, 15, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = "#0F172A";
    ctx.beginPath();
    ctx.arc(mascotX - 14, mascotY - 5, 7, 0, Math.PI * 2);
    ctx.arc(mascotX + 18, mascotY - 5, 7, 0, Math.PI * 2);
    ctx.fill();

    // Smile / mouth
    ctx.fillStyle = "#064E3B";
    ctx.beginPath();
    ctx.arc(mascotX, mascotY + 22, 22, 0, Math.PI);
    ctx.fill();

    // Teeth
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(mascotX - 10, mascotY + 22, 6, 8);
    ctx.fillRect(mascotX + 4, mascotY + 22, 6, 8);

    // Accessory Drawing
    if (equippedSkin === "shades") {
      ctx.fillStyle = "#0F172A";
      ctx.strokeStyle = "#9945FF";
      ctx.lineWidth = 3;
      ctx.fillRect(mascotX - 35, mascotY - 14, 32, 16);
      ctx.strokeRect(mascotX - 35, mascotY - 14, 32, 16);
      ctx.fillRect(mascotX + 3, mascotY - 14, 32, 16);
      ctx.strokeRect(mascotX + 3, mascotY - 14, 32, 16);
      ctx.fillRect(mascotX - 3, mascotY - 10, 6, 4);
    } else if (equippedSkin === "crown") {
      ctx.fillStyle = "#F59E0B";
      ctx.strokeStyle = "#FDE047";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(mascotX - 30, mascotY - 42);
      ctx.lineTo(mascotX - 30, mascotY - 62);
      ctx.lineTo(mascotX - 15, mascotY - 50);
      ctx.lineTo(mascotX, mascotY - 68);
      ctx.lineTo(mascotX + 15, mascotY - 50);
      ctx.lineTo(mascotX + 30, mascotY - 62);
      ctx.lineTo(mascotX + 30, mascotY - 42);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (equippedSkin === "cap") {
      ctx.fillStyle = "#9945FF";
      ctx.beginPath();
      ctx.arc(mascotX, mascotY - 42, 28, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(mascotX - 10, mascotY - 46, 42, 6);
    } else if (equippedSkin === "horns") {
      ctx.fillStyle = "#EF4444";
      ctx.beginPath();
      ctx.moveTo(mascotX - 25, mascotY - 40);
      ctx.lineTo(mascotX - 42, mascotY - 65);
      ctx.lineTo(mascotX - 18, mascotY - 50);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(mascotX + 25, mascotY - 40);
      ctx.lineTo(mascotX + 42, mascotY - 65);
      ctx.lineTo(mascotX + 18, mascotY - 50);
      ctx.closePath();
      ctx.fill();
    }

    // Footer Watermark & Token Info
    ctx.fillStyle = "#64748B";
    ctx.font = "10px monospace";
    ctx.fillText("TOKEN: $NOM • PUMP.FUN FAIR LAUNCH • CC0 PUBLIC DOMAIN", 24, 305);
    ctx.fillStyle = "#10B981";
    ctx.fillText(`MINT: ${TOKEN_CONFIG.mintAddress.slice(0, 16)}...pump`, 24, 324);
    ctx.fillStyle = "#F59E0B";
    ctx.fillText("PLAY LIVE AT NOMVERSE", 24, 340);

    try {
      setDataUrl(canvas.toDataURL("image/png"));
    } catch {
      // ignore
    }
  }, [score, streak, equippedSkin, userName]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `nomverse-score-${score}.png`;
    a.click();
  };

  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch {
          // Fallback to link copy
          await copyToClipboard(
            `I fed Nomster ${score} candies on NomVerse! Can you beat my score? Trade $NOM on pump.fun: ${TOKEN_CONFIG.pumpFunUrl}`
          );
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        }
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="w-full mt-3 p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/40 text-center select-none shadow-xl">
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
          <Sparkles className="w-3.5 h-3.5 text-solana-green" />
          <span>ARCADE FLEX CARD</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
          1-CLICK SHARE
        </span>
      </div>

      {/* Live Canvas Preview */}
      <div className="w-full overflow-hidden rounded-xl border border-slate-800 mb-3 bg-[#080F21]">
        <canvas
          ref={canvasRef}
          className="w-full h-auto aspect-[640/360] object-contain block"
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleDownload}
          className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Download</span>
        </button>

        <button
          onClick={handleCopyImage}
          className="py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-mono text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-lg shadow-emerald-500/20"
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Copied Card!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Meme Card</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
