import React from "react";
import { Navbar } from "@/components/ui/Navbar";
import { HeroSection } from "@/components/ui/HeroSection";
import { WhatIsNomverse } from "@/components/ui/WhatIsNomverse";
import { CreateWithNomster } from "@/components/tools/CreateWithNomster";
import { NomverseUniverse } from "@/components/lore/NomverseUniverse";
import { NomWall } from "@/components/wall/NomWall";
import { Tokenomics } from "@/components/ui/Tokenomics";
import { OpenSourceSection } from "@/components/ui/OpenSourceSection";
import { FinalCta } from "@/components/ui/FinalCta";
import { Footer } from "@/components/ui/Footer";
import { getAllStories } from "@/lib/stories";

export default function HomePage() {
  const stories = getAllStories();

  return (
    <main className="relative min-h-screen flex flex-col bg-background text-foreground selection:bg-solana-green/30 selection:text-white">
      {/* 01 — HEADER: NomVerse | Play | Universe | Create | Community | $NOM */}
      <Navbar />

      {/* 02 — HERO: The open-source mascot of Web3 + Nomster + Play Now */}
      {/* 03 — QUICK PROOF: CC0 • Open Source • Solana • Arcade */}
      {/* 04 — PLAY: Nomster Arcade, no wallet required */}
      <HeroSection />

      {/* 05 — WHAT IS NOMVERSE?: Play • Create • Write • Build • Remix */}
      <WhatIsNomverse />

      {/* 06 — CREATE: Meme Studio • Skin Workshop • NomBeats • Trading Cards • CC0 Assets */}
      <CreateWithNomster />

      {/* 07 — THE NOMVERSE: Characters • Lore • Chapters • World */}
      <NomverseUniverse stories={stories} />

      {/* 08 — COMMUNITY: NomWall • Quests • Hall of Fame */}
      <NomWall />

      {/* 09 — $NOM: Supply • Tax • Contract • How to Buy • Token Details */}
      <Tokenomics />

      {/* 10 — OPEN SOURCE: GitHub • Developer Docs • CC0 • Contributions */}
      <OpenSourceSection />

      {/* 11 — FINAL CTA: ENTER THE NOMVERSE / PLAY NOW */}
      <FinalCta />

      {/* 12 — FOOTER: full sitemap and legal / CC0 information */}
      <Footer />
    </main>
  );
}
