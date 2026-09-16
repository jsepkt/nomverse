# 📖 NomVerse Living Lore Hub: Contributing Guidelines

NomVerse lore is completely decentralized and community-authored under **CC0 1.0 Universal**. Anyone can submit new chapters, spin-offs, side quests, or character introductions via GitHub Pull Request.

---

## How to Submit `chapter-03.md` (or Beyond!)

### Step 1: Fork & Create Branch
```bash
git checkout -b lore/chapter-03-your-story-title
```

### Step 2: Create Your Chapter File
Create a new file at `src/content/stories/chapter-03.md` with the following frontmatter template:

```markdown
---
title: "The Great Candy Halving" # Your chapter title
chapter: 3                       # Sequential integer chapter number
date: "2026-09-17"               # Release date (YYYY-MM-DD)
author: "YourGitHubOrWallet"     # Credit name, ENS, or Solana address
tags: ["arcade", "lore", "candy"]# Relevant thematic tags
summary: "A one-sentence teaser of what Nomster encounters next."
---

# Chapter 3: The Great Candy Halving

Your story goes here! You can write about:
- Nomster exploring new DeFi realms or Solana protocols.
- Meeting strange new companions (like the mysterious Pixel Gnome or Sol-Snail).
- Facing the dreaded Bug Glitch and overcoming it with community teamwork.
- Discovering a mythical Rainbow Candy drop that triggers hyper-speed nomming!
```

### Step 3: Guidelines & Style
- **Tone:** Fun, lighthearted, energetic, and celebratory of open-source and Web3 builder culture.
- **License:** By submitting, you explicitly agree that your contribution is dedicated to the public domain under **CC0 1.0 Universal**.
- **Formatting:** Standard Markdown (headings, blockquotes, code blocks, bold/italics).

### Step 4: Submit Pull Request
Push your branch to your fork and submit a Pull Request to `main`. Once reviewed by community maintainers and merged, Vercel automatically deploys the updated lore live to the website!
