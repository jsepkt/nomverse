import React, { Suspense } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { PlayContent } from "./PlayContent";

export const metadata = {
  title: "Game Room & Arcade | NomVerse",
  description:
    "Enter the NomVerse Game Room! Play the 5-stage candy catcher arcade, explore community mini-games, track your contributor level and XP, and unlock CC0 skins.",
};

export default function PlayPage() {
  return (
    <main className="relative min-h-screen flex flex-col bg-[#050914] text-foreground selection:bg-solana-green/30 selection:text-white">
      {/* Top Main Navigation Header */}
      <Navbar />

      {/* Main Game Room Workspace wrapped in Suspense */}
      <Suspense
        fallback={
          <div className="flex-1 min-h-[70vh] flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono text-emerald-400">INITIALIZING GAME ROOM...</p>
          </div>
        }
      >
        <PlayContent />
      </Suspense>

      {/* CC0 Public Domain Footer */}
      <Footer />
    </main>
  );
}
