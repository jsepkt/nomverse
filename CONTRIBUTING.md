# Contributing to NomVerse (100% CC0 Public Domain)

Welcome to **NomVerse**! This project is dedicated to the public domain under **CC0 1.0 Universal**. Anyone in the world is legally free to remix, build spin-off games, write new storylines, compose retro chiptunes, print merchandise, or fork the repository.

---

## 🌟 How You Can Contribute

We welcome community pull requests in any of the following areas:

1. **🕹️ New Game Stages & Modes**:
   - Add new stages in `src/lib/stages.ts` (e.g. Moon Gravity, Cyber Glitch, Asteroid Run).
   - Build new Phaser 3 mini-games in `src/components/game/`.
2. **📖 Living Lore Chapters**:
   - Write new story episodes in `src/content/stories/chapter-XX.md`.
   - Submit via GitHub PR or directly from the in-browser **Lore Studio**.
3. **🎨 CC0 Cosmetics & Art**:
   - Add new unlockable accessories in `src/lib/skins.ts` and draw their vector textures in `MainScene.ts`.
   - Add sticker presets and backgrounds in `src/components/tools/MemeStudio.tsx`.
4. **🎵 Chiptune Audio & Beats**:
   - Add synthesizer presets in `src/components/audio/ChiptuneStudio.tsx`.
5. **⚡ Solana Blinks & Web3 Tools**:
   - Build Solana Actions, Blinks, or wallet utilities.

---

## 🛠️ Local Development Setup

### 1. Clone Your Fork
```bash
git clone https://github.com/<your-username>/nomverse.git
cd nomverse
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Verify Production Build Before Submitting
```bash
npm run build
```
Make sure the build passes with **exit code 0** and zero TypeScript errors.

---

## 🔒 Security & Token Mint Protection

> [!IMPORTANT]
> The canonical pump.fun token mint in `src/config/token.ts` is **immutably frozen**.
> Automated CI checks (`.github/workflows/token-lock.yml`) will automatically reject any pull request attempting to modify the canonical token address.

---

## 📜 Public Domain Dedication

By submitting a Pull Request to NomVerse, you agree that your contribution is dedicated to the public domain under the **Creative Commons CC0 1.0 Universal** dedication. No copyright, no royalties, no permission required.
