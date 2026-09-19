"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Paintbrush,
  Eraser,
  Download,
  CheckCircle2,
  Sparkles,
  Shirt,
  RotateCcw,
  Palette,
  Eye,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";
import { sounds } from "../audio/soundEffects";

const GRID_SIZE = 16;
const PALETTE = [
  { name: "Solana Green", hex: "#14F195" },
  { name: "Candy Gold", hex: "#F59E0B" },
  { name: "Cyber Cyan", hex: "#06B6D4" },
  { name: "Neon Pink", hex: "#EC4899" },
  { name: "Deep Purple", hex: "#9945FF" },
  { name: "Pure White", hex: "#FFFFFF" },
  { name: "Deep Void", hex: "#0F172A" },
  { name: "Transparent", hex: "transparent" },
];

const PRESETS: Record<string, string[][]> = {
  Classic: [
    ["transparent", "transparent", "transparent", "transparent", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "transparent", "transparent", "transparent", "transparent"],
    ["transparent", "transparent", "transparent", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "transparent", "transparent", "transparent"],
    ["transparent", "transparent", "#14F195", "#14F195", "#FFFFFF", "#0F172A", "#14F195", "#14F195", "#14F195", "#14F195", "#FFFFFF", "#0F172A", "#14F195", "#14F195", "transparent", "transparent"],
    ["transparent", "#14F195", "#14F195", "#14F195", "#FFFFFF", "#0F172A", "#14F195", "#14F195", "#14F195", "#14F195", "#FFFFFF", "#0F172A", "#14F195", "#14F195", "#14F195", "transparent"],
    ["transparent", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "transparent"],
    ["#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#EC4899", "#EC4899", "#EC4899", "#EC4899", "#EC4899", "#EC4899", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195"],
    ["#14F195", "#14F195", "#14F195", "#14F195", "#EC4899", "#0F172A", "#0F172A", "#0F172A", "#0F172A", "#0F172A", "#0F172A", "#EC4899", "#14F195", "#14F195", "#14F195", "#14F195"],
    ["#14F195", "#14F195", "#14F195", "#14F195", "#EC4899", "#0F172A", "#0F172A", "#0F172A", "#0F172A", "#0F172A", "#0F172A", "#EC4899", "#14F195", "#14F195", "#14F195", "#14F195"],
    ["#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#EC4899", "#EC4899", "#EC4899", "#EC4899", "#EC4899", "#EC4899", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195"],
    ["#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195"],
    ["transparent", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "transparent"],
    ["transparent", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "transparent"],
    ["transparent", "transparent", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "transparent", "transparent"],
    ["transparent", "transparent", "transparent", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "transparent", "transparent", "transparent"],
    ["transparent", "transparent", "transparent", "#F59E0B", "#F59E0B", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "#F59E0B", "#F59E0B", "transparent", "transparent", "transparent"],
    ["transparent", "transparent", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "transparent", "transparent", "transparent", "transparent", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "transparent", "transparent"],
  ],
};

function createEmptyGrid(): string[][] {
  return Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill("transparent"));
}

export const PixelSkinWorkshop: React.FC = () => {
  const [pixels, setPixels] = useState<string[][]>(PRESETS["Classic"]);
  const [currentColor, setCurrentColor] = useState<string>("#14F195");
  const [activeTool, setActiveTool] = useState<"pencil" | "eraser">("pencil");
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
  const [equippedSuccess, setEquippedSuccess] = useState<boolean>(false);

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Paint pixel
  const handlePixelPaint = (r: number, c: number) => {
    const color = activeTool === "eraser" ? "transparent" : currentColor;
    setPixels((prev) => {
      const updated = prev.map((row) => [...row]);
      updated[r][c] = color;
      return updated;
    });
  };

  // Render high-res preview canvas
  const renderPreview = useCallback(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scale = canvas.width / GRID_SIZE;

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const color = pixels[r][c];
        if (color !== "transparent") {
          ctx.fillStyle = color;
          ctx.fillRect(c * scale, r * scale, scale, scale);
        }
      }
    }
  }, [pixels]);

  useEffect(() => {
    renderPreview();
  }, [renderPreview]);

  // Equip custom skin directly to Phaser
  const handleEquipToGame = () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");

    try {
      localStorage.setItem("nomverse_custom_skin_data", dataUrl);
      window.dispatchEvent(
        new CustomEvent("nomverse_custom_skin_equipped", { detail: { dataUrl } })
      );
    } catch {
      // ignore
    }

    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    sounds.playGoldenChime();
    setEquippedSuccess(true);
    setTimeout(() => setEquippedSuccess(false), 3500);
  };

  // Download high-resolution PNG
  const handleDownloadPng = () => {
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = 512;
    exportCanvas.height = 512;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false; // keep pixelated
    const scale = 512 / GRID_SIZE;

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const color = pixels[r][c];
        if (color !== "transparent") {
          ctx.fillStyle = color;
          ctx.fillRect(c * scale, r * scale, scale, scale);
        }
      }
    }

    const link = document.createElement("a");
    link.download = "my_custom_nomster_pfp.png";
    link.href = exportCanvas.toDataURL("image/png");
    link.click();
    sounds.playNom();
  };

  return (
    <div className="w-full rounded-3xl bg-slate-950/80 border border-slate-800 p-5 sm:p-6 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-solana-green/15 border border-solana-green/40 flex items-center justify-center text-solana-green shrink-0">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white">CC0 Pixel Skin Workshop</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                Live In-Game Injection
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Paint your custom Nomster skin and immediately equip it to the Phaser arcade cabinet.
            </p>
          </div>
        </div>

        {equippedSuccess && (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Equipped to Live Game!</span>
          </div>
        )}
      </div>

      {/* Workshop Workspace: Grid & Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Pixel Grid Canvas */}
        <div className="md:col-span-7 flex flex-col items-center">
          <div
            onMouseDown={() => setIsMouseDown(true)}
            onMouseUp={() => setIsMouseDown(false)}
            onMouseLeave={() => setIsMouseDown(false)}
            className="gap-[1px] p-2 rounded-2xl bg-slate-900 border-2 border-slate-800 shadow-inner select-none cursor-crosshair touch-none"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(16, minmax(0, 1fr))",
              width: "min(100%, 320px)",
              aspectRatio: "1/1",
            }}
          >
            {pixels.map((row, r) =>
              row.map((color, c) => (
                <div
                  key={`${r}-${c}`}
                  onMouseDown={() => handlePixelPaint(r, c)}
                  onMouseEnter={() => {
                    if (isMouseDown) handlePixelPaint(r, c);
                  }}
                  className="rounded-[1px] transition-colors"
                  style={{
                    backgroundColor: color === "transparent" ? "#0a0f1d" : color,
                    backgroundImage:
                      color === "transparent"
                        ? "linear-gradient(45deg, #111827 25%, transparent 25%), linear-gradient(-45deg, #111827 25%, transparent 25%)"
                        : "none",
                    backgroundSize: "6px 6px",
                  }}
                />
              ))
            )}
          </div>

          <div className="flex items-center gap-2 mt-3 text-[11px] font-mono text-slate-400">
            <span>Grid: 16x16</span>
            <span>•</span>
            <span>Click &amp; drag to paint</span>
          </div>
        </div>

        {/* Right: Tools, Palette, & Actions */}
        <div className="md:col-span-5 space-y-4 font-mono">
          {/* Tool Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Tools:</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTool("pencil")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeTool === "pencil"
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25"
                    : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700"
                }`}
              >
                <Paintbrush className="w-3.5 h-3.5" />
                <span>Pencil</span>
              </button>

              <button
                onClick={() => setActiveTool("eraser")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeTool === "eraser"
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/25"
                    : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700"
                }`}
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Eraser</span>
              </button>
            </div>
          </div>

          {/* Color Palette */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Retro Palette:</label>
            <div className="grid grid-cols-4 gap-2">
              {PALETTE.map((p) => (
                <button
                  key={p.name}
                  onClick={() => {
                    setCurrentColor(p.hex);
                    setActiveTool("pencil");
                  }}
                  className={`h-9 rounded-xl border flex items-center justify-center text-xs transition-all relative ${
                    currentColor === p.hex && activeTool === "pencil"
                      ? "border-white scale-110 shadow-md shadow-white/20"
                      : "border-slate-700 hover:scale-105"
                  }`}
                  style={{
                    backgroundColor: p.hex === "transparent" ? "#0f172a" : p.hex,
                  }}
                  title={p.name}
                >
                  {p.hex === "transparent" && <span className="text-[10px] text-slate-400">Clear</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">Preview (Actual Mascot):</span>
              <span className="text-[10px] text-slate-400">Ready for Phaser injection</span>
            </div>
            <div className="w-14 h-14 rounded-xl bg-[#050914] border border-slate-700 flex items-center justify-center overflow-hidden">
              <canvas
                ref={previewCanvasRef}
                width={56}
                height={56}
                className="w-full h-full block image-rendering-pixelated"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleEquipToGame}
              className="w-full py-2.5 px-4 rounded-xl font-black text-xs bg-gradient-to-r from-emerald-400 via-teal-300 to-solana-green text-slate-950 shadow-[0_0_20px_rgba(20,241,149,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Shirt className="w-4 h-4 text-slate-950" />
              <span>Equip Custom Skin to Game</span>
            </button>

            <button
              onClick={handleDownloadPng}
              className="w-full py-2 px-3 rounded-xl text-xs font-mono font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 flex items-center justify-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download 512px PFP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
