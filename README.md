# 🌌 NomVerse — The Hungry Open-Source Mascot of Web3

> **100% CC0 Public Domain • Phaser 3 Physics Arcade • Community Lore Engine • Fair Launch on pump.fun**

---

## 🌟 The Core Vision

- **Zero Copyright / 100% CC0 Public Domain:** Every character asset, line of code, storyline, and sound effect is dedicated to the public domain under **Creative Commons Zero 1.0 Universal (CC0)**. Anyone in the community is legally free to remix, build spin-off games, print physical merchandise, or fork the project without asking permission.
- **pump.fun Meme Coin Alignment:** The site serves as the interactive utility and lore engine backing a community coin launched on [pump.fun](https://pump.fun). The token functions as the speculative engine and attention driver, while the GitHub repository serves as the builder hub.
- **Collaborative Story & Content Hub:** The website acts as an open living franchise. Stories and lore are stored as modular Markdown content files in `src/content/stories/` so that any developer or writer can submit new episodes, side quests, or levels via GitHub Pull Requests. When merged, the site automatically reflects the new community lore.
- **Interactive Mini-Game:** A browser-based physics mini-game (inspired by the Cut the Rope / Om Nom vibe) built with **Phaser 3 Arcade Physics** where players feed crypto/Solana candies to the hungry open-source mascot (**"Nomster"**).

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org) (v18, v20, or v22+)
- Windows, macOS, or Linux

### 1. Clone & Install
```bash
git clone https://github.com/nomverse/nomverse.git
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
