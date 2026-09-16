# 🌌 NomVerse — The Hungry Open-Source Mascot of Web3

[![License: CC0-1.0](https://img.shields.io/badge/License-CC0_1.0-blue.svg)](https://creativecommons.org/publicdomain/zero/1.0/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![Phaser 3](https://img.shields.io/badge/Phaser-3.88-orange.svg)](https://phaser.io/)
[![Token: $NOM](https://img.shields.io/badge/pump.fun-%24NOM-14f195.svg)](https://pump.fun/8a1iQy5wSP77TPnvPqFou3ubjsAgRMAEPqKjU2jrpump)

> **100% CC0 Public Domain • Phaser 3 Physics Arcade • Community Raid Boss • Zero Social Media Dependency**

---

## 💎 Official Token Details (Permanently Locked)

| Parameter | Value |
| :--- | :--- |
| **Token Name** | **NomVerse** |
| **Symbol** | **$NOM** |
| **Contract Mint Address** | `8a1iQy5wSP77TPnvPqFou3ubjsAgRMAEPqKjU2jrpump` |
| **Pump.fun Live URL** | [https://pump.fun/8a1iQy5wSP77TPnvPqFou3ubjsAgRMAEPqKjU2jrpump](https://pump.fun/8a1iQy5wSP77TPnvPqFou3ubjsAgRMAEPqKjU2jrpump) |
| **Total Supply** | 1,000,000,000 NOM |
| **Immutability Status** | 🔒 **Permanently Locked** (Protected by CI anti-tamper workflow) |

---

## 🌟 The Core Vision

- **Zero Copyright / 100% CC0 Public Domain:** Every character asset, line of code, storyline, and sound effect is dedicated to the public domain under **Creative Commons Zero 1.0 Universal (CC0)**. Anyone in the community is legally free to remix, build spin-off games, print physical merchandise, or fork the project without asking permission.
- **pump.fun Meme Coin Alignment:** The site serves as the interactive utility and lore engine backing a community coin launched on [pump.fun](https://pump.fun/8a1iQy5wSP77TPnvPqFou3ubjsAgRMAEPqKjU2jrpump). The token functions as the speculative engine and attention driver, while the GitHub repository serves as the builder hub.
- **Collaborative Story & Content Hub:** The website acts as an open living franchise. Stories and lore are stored as modular Markdown content files in `src/content/stories/` so that any developer or writer can submit new episodes, side quests, or levels via GitHub Pull Requests. When merged, the site automatically reflects the new community lore.
- **Interactive Mini-Game:** A browser-based physics mini-game built with **Phaser 3 Arcade Physics** where players feed crypto/Solana candies to the hungry open-source mascot (**"Nomster"**).
- **The NomWall:** In-app community board with real-time comments, sound reactions, and micro-bounty quests, completely eliminating third-party social media reliance.

---

## 🚀 Quick Start (Cloning & Development)

### Prerequisites
- [Node.js](https://nodejs.org) (v18, v20, or v22 LTS)
- Git

### 1. Clone & Install
```bash
git clone https://github.com/jsepkt/nomverse.git
cd nomverse
npm install
```

### 2. Run Local Development Server
The development server is pre-configured to bind explicitly to `127.0.0.1:3000`:
```bash
npm run dev
```
Open [http://127.0.0.1:3000](http://127.0.0.1:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm run start
```

---

## 🎮 Game Engine Architecture (`src/components/game/`)

- **`MainScene.ts`:**
  - Phaser 3 Arcade physics with gravity, bounds restitution, and drag.
  - Preloads `public/mascot.svg` and `public/candy.svg`.
  - Spawns Nomster at bottom center with an idle breathing tween animation (`scaleY: 1.05`, `scaleX: 0.97`, yoyo, loop).
  - Spawns bouncing candy from top with world boundary collisions.
  - Interactive pointer controls: clicking or tapping near/under the candy flings it toward Nomster's mouth with directional impulse. Slingshot drag-and-release is also supported with real-time trajectory visualization.
  - Collision overlap detection: triggers an eating squash/stretch bounce tween on Nomster, plays procedural Web Audio chomp and golden chimes, spawns sparkle particles, increments the "Candies Eaten" score counter, and spawns the next candy drop.
- **`PhaserCanvas.tsx`:**
  - Client component (`'use client'`).
  - Asynchronously loads Phaser and `MainScene` on the client side only (`ssr: false`).
  - Strict React 18/19 lifecycle protection (`isMounted` ref checks) to prevent double canvas instances or server crashes.
  - Full cleanup (`game.destroy(true)`) on unmount.
- **`soundEffects.ts`:**
  - 100% self-contained Web Audio API synthesizer for retro chomp crunch and Solana golden chimes. No external audio files or network requests required.

---

## 📖 Contributing Living Lore via GitHub PR

To submit **Chapter 3** (or beyond):

1. Fork the repository and create a branch:
   ```bash
   git checkout -b lore/chapter-03-title
   ```
2. Create `src/content/stories/chapter-03.md` using the frontmatter template:
   ```markdown
   ---
   title: "The Great Candy Halving"
   chapter: 3
   date: "2026-09-17"
   author: "YourNameOrWallet"
   tags: ["arcade", "lore", "candy"]
   summary: "Nomster discovers the legendary cryptographic halving and hyper-candies."
   ---

   # Chapter 3: The Great Candy Halving

   Your story goes here...
   ```
3. Submit a Pull Request. Once approved and merged, Vercel automatically deploys the updated lore live to the website!

---

## 🎨 CC0 Public Domain Assets (`public/`)

- `public/mascot.svg`: "Nomster", hand-crafted vector SVG with expressive cartoon eyes, tiny feet, cheerful open mouth ready for candy, and soft radial shading.
- `public/candy.svg`: Glowing golden candy drop styled with Solana-inspired transaction stripes.
- `LICENSE`: Official Creative Commons Zero 1.0 Universal legal deed.

---

## 🕹️ Developing New Features & Stages

Community developers can contribute new game stages and cosmetics in minutes:

### 1. Adding a New Game Stage
Add your stage configuration to `src/lib/stages.ts`:
```typescript
{
  id: "neon-cyberstorm",
  name: "Neon Cyberstorm",
  description: "High velocity data winds and inverted gravity surges.",
  gravityY: 280,
  candyBounce: 0.9,
  bgColor: "#080014",
  unlockedAtScore: 35,
  icon: "⚡",
}
```

### 2. Adding a New Mascot Skin
1. Register your accessory in `src/lib/skins.ts`.
2. Add the vector drawing routine in `src/components/game/MainScene.ts` inside `drawAccessory()`.

---

## 🔒 Immutability Guarantee

The token mint configuration (`src/config/token.ts`) is **permanently locked**:
- Any Pull Request attempting to modify the canonical mint address will be **automatically failed and blocked** by `.github/workflows/token-lock.yml`.
- Neither external contributors nor maintainers can alter the token address in automated builds.

---

## 🌐 Free Production Deployment (Vercel)

NomVerse is 100% optimized for zero-cost hosting on Vercel:
1. Fork or import `https://github.com/jsepkt/nomverse` on [vercel.com](https://vercel.com).
2. Framework Preset: **Next.js**
3. Click **Deploy**.
4. Live in under 60 seconds with free global CDN and SSL.

