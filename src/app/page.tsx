import React from "react";
import { Navbar } from "@/components/ui/Navbar";
import { HeroSection } from "@/components/ui/HeroSection";
import { MissionControl } from "@/components/telemetry/MissionControl";
import { SolanaRpcTelemetry } from "@/components/telemetry/SolanaRpcTelemetry";
import { NomWall } from "@/components/wall/NomWall";
import { StoryReader } from "@/components/lore/StoryReader";
import { ToolkitSection } from "@/components/ui/ToolkitSection";
import { Tokenomics } from "@/components/ui/Tokenomics";
import { Footer } from "@/components/ui/Footer";
import { getAllStories } from "@/lib/stories";

export default function HomePage() {
  const stories = getAllStories();

  return (
    <main className="relative min-h-screen flex flex-col bg-background text-foreground selection:bg-solana-green/30 selection:text-white">
      {/* Navigation Header */}
      <Navbar />

      {/* Hero & Interactive Phaser Arcade */}
      <HeroSection />

      {/* SpaceX-Grade Raydium Mission Control & Real Solana Mainnet-Beta RPC Telemetry */}
      <section className="w-full py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <MissionControl />
        <SolanaRpcTelemetry />
      </section>

      {/* On-Platform Community Wall (No External Social Media) */}
      <NomWall />

      {/* Living Community Lore Hub */}
      <StoryReader stories={stories} />

      {/* Developer & Creator Modding Toolkit */}
      <ToolkitSection />

      {/* pump.fun Alignment & Tokenomics */}
      <Tokenomics />

      {/* Official CC0 1.0 Universal Public Domain Dedication Footer */}
      <Footer />
    </main>
  );
}
