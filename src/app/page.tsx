import React from "react";
import { Navbar } from "@/components/ui/Navbar";
import { HeroSection } from "@/components/ui/HeroSection";
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
