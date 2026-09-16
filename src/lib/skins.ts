// NomVerse CC0 Unlockable Cosmetics & Accessories Catalog

export type SkinId = "default" | "cap" | "shades" | "crown" | "horns" | "diamond";

export interface SkinItem {
  id: SkinId;
  name: string;
  emoji: string;
  description: string;
  requirement: string;
  isUnlocked: (stats: { highScore: number; maxStreak: number; karma: number; isHolder?: boolean }) => boolean;
}

export const SKINS_CATALOG: SkinItem[] = [
  {
    id: "default",
    name: "Classic Nomster",
    emoji: "🟢",
    description: "The pure, unadorned green open-source mascot.",
    requirement: "Unlocked by default",
    isUnlocked: () => true,
  },
  {
    id: "shades",
    name: "Cyber Pixel Shades",
    emoji: "🕶️",
    description: "Cool cryptographic shades for high-velocity munchers.",
    requirement: "Reach a x5 Combo Streak in Arcade",
    isUnlocked: ({ maxStreak }) => maxStreak >= 5,
  },
  {
    id: "cap",
    name: "Solana Dev Cap",
    emoji: "🧢",
    description: "Backward teal & purple cap worn by speed-of-light builders.",
    requirement: "Reach a High Score of 15+ Candies",
    isUnlocked: ({ highScore }) => highScore >= 15,
  },
  {
    id: "crown",
    name: "Golden CC0 Crown",
    emoji: "👑",
    description: "Royal public domain crown awarded to community lifesavers.",
    requirement: "Earn 30+ Karma by Gifting Lives on The NomWall",
    isUnlocked: ({ karma }) => karma >= 30,
  },
  {
    id: "horns",
    name: "FUD Slayer Horns",
    emoji: "😈",
    description: "Glowing neon red horns earned in the Lord Mega-FUD World Raid.",
    requirement: "Score 5+ Candies during the Community Raid",
    isUnlocked: ({ highScore }) => highScore >= 5,
  },
  {
    id: "diamond",
    name: "Diamondbag Nomster",
    emoji: "💎",
    description: "Gleaming crystalline diamond crown and crystal aura for verified $NOM Dolphin/Whale holders.",
    requirement: "Hold 1,000,000+ $NOM or reach High Score 30+",
    isUnlocked: ({ highScore, isHolder }) => Boolean(isHolder || highScore >= 30),
  },
];

const EQUIPPED_SKIN_KEY = "nomverse_equipped_skin_";

export function getEquippedSkin(userId: string): SkinId {
  if (typeof window === "undefined" || !userId) return "default";
  try {
    const saved = localStorage.getItem(`${EQUIPPED_SKIN_KEY}${userId}`) as SkinId;
    if (saved && SKINS_CATALOG.some((s) => s.id === saved)) {
      return saved;
    }
  } catch {
    // ignore
  }
  return "default";
}

export function setEquippedSkin(userId: string, skin: SkinId): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    localStorage.setItem(`${EQUIPPED_SKIN_KEY}${userId}`, skin);
  } catch {
    // ignore
  }
}
