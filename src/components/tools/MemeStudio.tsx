"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Download,
  Share2,
  Sparkles,
  Palette,
  Type,
  Smile,
  CheckCircle2,
  RefreshCw,
  Eye,
  Rocket,
  Flame,
} from "lucide-react";

interface MemeStudioProps {
  onPostToWall?: (title: string, content: string) => Promise<boolean>;
}

type BackgroundTheme = "solana" | "pump" | "midnight" | "cybergrid" | "sunset";
type AccessoryType = "none" | "laser_eyes" | "shades" | "cap" | "crown" | "diamond_hands" | "rocket";
type NomsterMood = "happy" | "focused" | "smug" | "starving";

export const MemeStudio: React.FC<MemeStudioProps> = ({ onPostToWall }) => {
  const { user, openAuthModal } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Studio Settings
  const [theme, setTheme] = useState<BackgroundTheme>("solana");
  const [accessory, setAccessory] = useState<AccessoryType>("laser_eyes");
  const [mood, setMood] = useState<NomsterMood>("happy");
  const [topText, setTopText] = useState<string>("WHEN THE CANDY HITS");
  const [bottomText, setBottomText] = useState<string>("BONDING CURVE COMPLETED");
  const [fontSize, setFontSize] = useState<number>(36);
  const [isPosting, setIsPosting] = useState<boolean>(false);
  const [postSuccess, setPostSuccess] = useState<boolean>(false);

  // Render canvas
  const renderMeme = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // 1. Draw Background
    if (theme === "solana") {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#9945FF");
      grad.addColorStop(1, "#14F195");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    } else if (theme === "pump") {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#052e16");
      grad.addColorStop(0.6, "#14F195");
      grad.addColorStop(1, "#022c22");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    } else if (theme === "midnight") {
      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, w, h);
    } else if (theme === "cybergrid") {
      ctx.fillStyle = "#080d1a";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(20, 241, 149, 0.25)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    } else if (theme === "sunset") {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#f97316");
      grad.addColorStop(0.5, "#ec4899");
      grad.addColorStop(1, "#8b5cf6");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    // Vignette Shadow
    const radGrad = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.7);
    radGrad.addColorStop(0, "rgba(0,0,0,0)");
    radGrad.addColorStop(1, "rgba(0,0,0,0.5)");
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Draw Nomster Body
    const cx = w / 2;
    const cy = h / 2 + 20;

    // Body shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 130, 110, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nomster Green Body (Chubby Cute Pear Shape)
    ctx.fillStyle = mood === "starving" ? "#84cc16" : "#22c55e";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 20, 105, 115, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body Outline
    ctx.strokeStyle = "#14532d";
    ctx.lineWidth = 6;
    ctx.stroke();

    // Belly lighter patch
    ctx.fillStyle = "#4ade80";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 45, 65, 70, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    const eyeLeftX = cx - 38;
    const eyeRightX = cx + 38;
    const eyeY = cy - 25;

    // Sclera
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(eyeLeftX, eyeY, 20, 24, 0, 0, Math.PI * 2);
    ctx.ellipse(eyeRightX, eyeY, 20, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Pupils
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    if (mood === "smug") {
      ctx.arc(eyeLeftX + 5, eyeY, 9, 0, Math.PI * 2);
      ctx.arc(eyeRightX + 5, eyeY, 9, 0, Math.PI * 2);
    } else if (mood === "focused") {
      ctx.arc(eyeLeftX, eyeY - 4, 7, 0, Math.PI * 2);
      ctx.arc(eyeRightX, eyeY - 4, 7, 0, Math.PI * 2);
    } else {
      ctx.arc(eyeLeftX + 3, eyeY + 2, 10, 0, Math.PI * 2);
      ctx.arc(eyeRightX - 3, eyeY + 2, 10, 0, Math.PI * 2);
    }
    ctx.fill();

    // Eye highlights
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(eyeLeftX + 1, eyeY - 4, 4, 0, Math.PI * 2);
    ctx.arc(eyeRightX - 5, eyeY - 4, 4, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    if (mood === "happy") {
      // Big open munching mouth
      ctx.arc(cx, cy + 30, 42, 0, Math.PI, false);
      ctx.closePath();
      ctx.fill();
      // Tongue
      ctx.fillStyle = "#f43f5e";
      ctx.beginPath();
      ctx.arc(cx, cy + 56, 22, Math.PI, 0, false);
      ctx.fill();
      // Two cute top teeth
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(cx - 16, cy + 30, 12, 12);
      ctx.fillRect(cx + 4, cy + 30, 12, 12);
    } else if (mood === "smug") {
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(cx + 10, cy + 32, 28, 0.2, Math.PI * 0.85);
      ctx.stroke();
    } else {
      ctx.arc(cx, cy + 28, 30, 0, Math.PI, false);
      ctx.closePath();
      ctx.fill();
    }

    // Cute Cheeks
    ctx.fillStyle = "rgba(244, 63, 94, 0.4)";
    ctx.beginPath();
    ctx.ellipse(cx - 65, cy + 18, 14, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 65, cy + 18, 14, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Draw Accessories
    if (accessory === "laser_eyes") {
      // Glowing Red Laser Eye Beams shooting forward
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 8;
      ctx.shadowColor = "#ef4444";
      ctx.shadowBlur = 25;

      ctx.beginPath();
      ctx.moveTo(eyeLeftX, eyeY);
      ctx.lineTo(eyeLeftX - 180, eyeY + 120);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(eyeRightX, eyeY);
      ctx.lineTo(eyeRightX + 180, eyeY + 120);
      ctx.stroke();

      // Reset shadow
      ctx.shadowBlur = 0;
    } else if (accessory === "shades") {
      // 8-bit black pixel sunglasses
      ctx.fillStyle = "#090d16";
      ctx.fillRect(cx - 62, eyeY - 14, 124, 30);
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(cx - 56, eyeY - 10, 48, 22);
      ctx.fillRect(cx + 8, eyeY - 10, 48, 22);
      // Neon green glint
      ctx.fillStyle = "#14f195";
      ctx.fillRect(cx - 50, eyeY - 6, 16, 6);
      ctx.fillRect(cx + 14, eyeY - 6, 16, 6);
    } else if (accessory === "cap") {
      // Solana backward Dev Cap
      ctx.fillStyle = "#9945ff";
      ctx.beginPath();
      ctx.arc(cx, cy - 85, 48, Math.PI, 0, false);
      ctx.fill();
      ctx.fillStyle = "#14f195";
      ctx.beginPath();
      ctx.ellipse(cx, cy - 85, 60, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(cx, cy - 132, 7, 0, Math.PI * 2);
      ctx.fill();
    } else if (accessory === "crown") {
      // Royal Golden Crown
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.moveTo(cx - 55, cy - 75);
      ctx.lineTo(cx - 55, cy - 120);
      ctx.lineTo(cx - 25, cy - 100);
      ctx.lineTo(cx, cy - 140);
      ctx.lineTo(cx + 25, cy - 100);
      ctx.lineTo(cx + 55, cy - 120);
      ctx.lineTo(cx + 55, cy - 75);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#fcd34d";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Jewels
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(cx - 55, cy - 120, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#14f195";
      ctx.beginPath();
      ctx.arc(cx, cy - 140, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#9945ff";
      ctx.beginPath();
      ctx.arc(cx + 55, cy - 120, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (accessory === "diamond_hands") {
      // Floating cyan crystal diamonds on left & right
      const drawDiamond = (dx: number, dy: number) => {
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.moveTo(dx, dy - 20);
        ctx.lineTo(dx + 20, dy);
        ctx.lineTo(dx, dy + 25);
        ctx.lineTo(dx - 20, dy);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
      };
      drawDiamond(cx - 105, cy + 40);
      drawDiamond(cx + 105, cy + 40);
    } else if (accessory === "rocket") {
      // pump.fun Rocket blasting upward
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.moveTo(cx + 70, cy - 70);
      ctx.lineTo(cx + 95, cy - 30);
      ctx.lineTo(cx + 45, cy - 30);
      ctx.closePath();
      ctx.fill();
      // Exhaust fire
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.moveTo(cx + 60, cy - 30);
      ctx.lineTo(cx + 70, cy - 10);
      ctx.lineTo(cx + 80, cy - 30);
      ctx.closePath();
      ctx.fill();
    }

    // 4. Draw Impact Meme Text (Top & Bottom)
    ctx.textAlign = "center";
    ctx.font = `900 ${fontSize}px Impact, -apple-system, sans-serif`;
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = fontSize / 6;
    ctx.lineJoin = "round";

    if (topText.trim()) {
      const topUpper = topText.toUpperCase();
      ctx.strokeText(topUpper, cx, 55);
      ctx.fillText(topUpper, cx, 55);
    }

    if (bottomText.trim()) {
      const bottomUpper = bottomText.toUpperCase();
      ctx.strokeText(bottomUpper, cx, h - 30);
      ctx.fillText(bottomUpper, cx, h - 30);
    }

    // 5. Watermark CC0 badge at corner
    ctx.font = "bold 11px monospace";
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.textAlign = "right";
    ctx.fillText("NOMVERSE • 100% CC0", w - 16, h - 10);
  }, [theme, accessory, mood, topText, bottomText, fontSize]);

  useEffect(() => {
    renderMeme();
  }, [renderMeme]);

  // Download High-Res PNG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `nomster-meme-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Direct 1-Click Post to The NomWall
  const handlePostToWall = async () => {
    if (!user) {
      openAuthModal();
      return;
    }

    setIsPosting(true);
    setPostSuccess(false);

    try {
      const postTitle = `🎨 [CC0 MEME CREATION] ${topText || "Nomster Meme"}`;
      const postContent = `Created in the in-browser CC0 Meme Studio!\n\n**Top Text:** "${topText}"\n**Bottom Text:** "${bottomText}"\n**Theme:** ${theme.toUpperCase()} | **Accessory:** ${accessory.toUpperCase()}\n\nRemix, download, and share! 100% public domain CC0. 🚀`;

      if (onPostToWall) {
        await onPostToWall(postTitle, postContent);
      } else {
        await fetch("/api/wall", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            authorId: user.id,
            authorName: user.name,
            authorProvider: user.provider,
            title: postTitle,
            content: postContent,
            category: "ideas",
          }),
        });
      }

      setPostSuccess(true);
      setTimeout(() => setPostSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to post meme to wall:", err);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="w-full bg-surface border border-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-2xl">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        {/* Left: Interactive Canvas Preview */}
        <div className="flex flex-col items-center w-full md:w-auto">
          <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700/80 shadow-[0_0_35px_rgba(20,241,149,0.15)] bg-slate-950 w-full max-w-[380px] aspect-square flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={480}
              height={480}
              className="w-full h-full object-contain block"
            />
          </div>

          {/* Action Buttons below preview */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 mt-4 w-full max-w-[380px] justify-center">
            <button
              onClick={handleDownload}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all shadow-md hover:scale-105 active:scale-95"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download PNG</span>
            </button>

            <button
              onClick={handlePostToWall}
              disabled={isPosting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-500 to-solana-green text-slate-950 hover:opacity-90 transition-all shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Share2 className="w-4 h-4" />
              <span>{isPosting ? "Posting..." : "Share NomWall"}</span>
            </button>
          </div>

          {postSuccess && (
            <div className="mt-2 text-xs font-mono text-emerald-400 flex items-center gap-1.5 animate-bounce">
              <CheckCircle2 className="w-4 h-4" />
              <span>Meme successfully published to The NomWall!</span>
            </div>
          )}
        </div>

        {/* Right: Studio Customization Controls */}
        <div className="flex-1 w-full space-y-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>100% CC0 CREATIVE STUDIO</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">Nomster PFP &amp; Meme Maker</h3>
            <p className="text-xs text-slate-400">
              Customize your public domain avatar or viral pump.fun meme. Export free or post directly to the community commons!
            </p>
          </div>

          {/* Text Inputs */}
          <div className="space-y-2">
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">Top Meme Text</label>
              <input
                type="text"
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                maxLength={45}
                placeholder="TOP TEXT..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:border-solana-green focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">Bottom Meme Text</label>
              <input
                type="text"
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
                maxLength={45}
                placeholder="BOTTOM TEXT..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:border-solana-green focus:outline-none"
              />
            </div>
          </div>

          {/* Background Presets */}
          <div>
            <label className="text-xs font-mono text-slate-300 block mb-1.5">Background Theme</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {(
                [
                  { id: "solana", label: "Solana", color: "from-purple-500 to-teal-400" },
                  { id: "pump", label: "pump.fun", color: "from-emerald-700 to-green-400" },
                  { id: "cybergrid", label: "Cyber Grid", color: "from-slate-900 to-cyan-900" },
                  { id: "midnight", label: "Midnight", color: "from-slate-950 to-slate-900" },
                  { id: "sunset", label: "Sunset", color: "from-orange-500 to-pink-500" },
                ] as const
              ).map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => setTheme(bg.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all truncate ${
                    theme === bg.id
                      ? "border-emerald-400 bg-emerald-500/20 text-white shadow-sm"
                      : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
                  }`}
                >
                  {bg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Accessories Selection */}
          <div>
            <label className="text-xs font-mono text-slate-300 block mb-1.5">Accessories &amp; Layers</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              {(
                [
                  { id: "laser_eyes", label: "Laser Eyes 🔴" },
                  { id: "shades", label: "Pixel Shades 🕶️" },
                  { id: "cap", label: "Dev Cap 🧢" },
                  { id: "crown", label: "CC0 Crown 👑" },
                  { id: "diamond_hands", label: "Diamond Hands 💎" },
                  { id: "rocket", label: "Rocket 🚀" },
                  { id: "none", label: "None (Pure)" },
                ] as const
              ).map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => setAccessory(acc.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-all truncate ${
                    accessory === acc.id
                      ? "border-solana-purple bg-solana-purple/20 text-purple-200 font-bold"
                      : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
                  }`}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mood Selector */}
          <div>
            <label className="text-xs font-mono text-slate-300 block mb-1.5">Nomster Expression</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: "happy", label: "Chomp Mouth 😋" },
                  { id: "smug", label: "Smug Wink 😏" },
                  { id: "focused", label: "Focused Munch 🧐" },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMood(m.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                    mood === m.id
                      ? "border-amber-400 bg-amber-500/20 text-amber-300 font-bold"
                      : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
