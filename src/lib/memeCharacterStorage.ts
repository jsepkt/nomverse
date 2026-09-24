// NomVerse Meme Character Bazaar & UGC Skin Economy

import { getUserVault, saveUserVault, recordGlobalBurn, BURN_FEE_PERCENT, CREATOR_ROYALTY_PERCENT } from "./arcadeVault";
import { recordFeedItem } from "./burnFeedStorage";

export interface MemeCharacter {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  creatorName: string;
  priceNom: number; // 0 for free, or price to unlock
  pixels: string[][];
  previewDataUrl: string;
  unlocksCount: number;
  royaltiesEarned: number;
  totalBurned: number;
  createdAt: number;
  featured?: boolean;
}

const MEME_STORAGE_KEY = "nomverse_meme_characters_v1";
const UNLOCKED_STORAGE_PREFIX = "nomverse_unlocked_characters_";
export const MINT_LISTING_FEE = 250; // 250 $NOM listing fee, 1% auto-burned

// Helper to convert 16x16 pixel matrix to base64 DataURL (works on client)
export function pixelsToDataUrl(pixels: string[][]): string {
  if (typeof window === "undefined") return "";
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    ctx.clearRect(0, 0, 64, 64);
    const scale = 64 / 16;
    for (let r = 0; r < 16; r++) {
      for (let c = 0; c < 16; c++) {
        const color = pixels[r]?.[c];
        if (color && color !== "transparent") {
          ctx.fillStyle = color;
          ctx.fillRect(c * scale, r * scale, scale, scale);
        }
      }
    }
    return canvas.toDataURL("image/png");
  } catch {
    return "";
  }
}

// Iconic Seed Characters
const SEED_CHARACTERS: MemeCharacter[] = [
  {
    id: "char_classic_nom",
    name: "Classic Nomster",
    description: "The original CC0 green fair-launch mascot of NomVerse. Friendly, voracious, and loves Solana candies.",
    creatorId: "genesis_team",
    creatorName: "NomVerse OG",
    priceNom: 0,
    pixels: [
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
    previewDataUrl: "",
    unlocksCount: 412,
    royaltiesEarned: 0,
    totalBurned: 0,
    createdAt: 1710000000000,
    featured: true,
  },
  {
    id: "char_diamond_chad",
    name: "Diamond Chad Nom",
    description: "Forged in the fiery trenches of pump.fun. Never sells, only munches green candles and candy drops.",
    creatorId: "creator_diamond",
    creatorName: "DiamondHands",
    priceNom: 500,
    pixels: [
      ["transparent", "transparent", "transparent", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "transparent", "transparent", "transparent"],
      ["transparent", "transparent", "#06B6D4", "#FFFFFF", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#FFFFFF", "#06B6D4", "transparent", "transparent"],
      ["transparent", "#06B6D4", "#06B6D4", "#06B6D4", "#0F172A", "#0F172A", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#0F172A", "#0F172A", "#06B6D4", "#06B6D4", "#06B6D4", "transparent"],
      ["transparent", "#06B6D4", "#06B6D4", "#06B6D4", "#0F172A", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#0F172A", "#06B6D4", "#06B6D4", "#06B6D4", "transparent"],
      ["#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4"],
      ["#06B6D4", "#06B6D4", "#FFFFFF", "#06B6D4", "#06B6D4", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#06B6D4", "#06B6D4", "#FFFFFF", "#06B6D4", "#06B6D4"],
      ["#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#F59E0B", "#0F172A", "#0F172A", "#0F172A", "#0F172A", "#0F172A", "#0F172A", "#F59E0B", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4"],
      ["#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#F59E0B", "#0F172A", "#0F172A", "#0F172A", "#0F172A", "#0F172A", "#0F172A", "#F59E0B", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4"],
      ["#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4"],
      ["transparent", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "transparent"],
      ["transparent", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "transparent"],
      ["transparent", "transparent", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "transparent", "transparent"],
      ["transparent", "transparent", "transparent", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "transparent", "transparent", "transparent"],
      ["transparent", "transparent", "transparent", "#FFFFFF", "#FFFFFF", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "#FFFFFF", "#FFFFFF", "transparent", "transparent", "transparent"],
      ["transparent", "transparent", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "transparent", "transparent", "transparent", "transparent", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "transparent", "transparent"],
      ["transparent", "transparent", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "transparent", "transparent", "transparent", "transparent", "#06B6D4", "#06B6D4", "#06B6D4", "#06B6D4", "transparent", "transparent"],
    ],
    previewDataUrl: "",
    unlocksCount: 184,
    royaltiesEarned: 82800,
    totalBurned: 920,
    createdAt: 1710100000000,
    featured: true,
  },
  {
    id: "char_neon_pepe",
    name: "Pepe the Nommer",
    description: "The rare frog variant of Nomster. High hop physics and feels exceptionally good to win bounties with.",
    creatorId: "creator_pepe",
    creatorName: "MemeLord_CC0",
    priceNom: 1000,
    pixels: [
      ["transparent", "transparent", "#14F195", "#14F195", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "#14F195", "#14F195", "transparent", "transparent"],
      ["transparent", "#14F195", "#FFFFFF", "#0F172A", "#14F195", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "#14F195", "#FFFFFF", "#0F172A", "#14F195", "transparent"],
      ["transparent", "#14F195", "#FFFFFF", "#0F172A", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#FFFFFF", "#0F172A", "#14F195", "transparent"],
      ["#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195"],
      ["#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195"],
      ["#14F195", "#14F195", "#14F195", "#EC4899", "#EC4899", "#EC4899", "#EC4899", "#EC4899", "#EC4899", "#EC4899", "#EC4899", "#EC4899", "#EC4899", "#14F195", "#14F195", "#14F195"],
      ["#14F195", "#14F195", "#EC4899", "#0F172A", "#0F172A", "#0F172A", "#0F172A", "#0F172A", "#0F172A", "#0F172A", "#0F172A", "#0F172A", "#0F172A", "#EC4899", "#14F195", "#14F195"],
      ["#14F195", "#14F195", "#EC4899", "#0F172A", "#0F172A", "#0F172A", "#0F172A", "#0F172A", "#0F172A", "#0F172A", "#0F172A", "#0F172A", "#0F172A", "#EC4899", "#14F195", "#14F195"],
      ["#14F195", "#14F195", "#14F195", "#EC4899", "#EC4899", "#EC4899", "#EC4899", "#EC4899", "#EC4899", "#EC4899", "#EC4899", "#EC4899", "#EC4899", "#14F195", "#14F195", "#14F195"],
      ["transparent", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "transparent"],
      ["transparent", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "transparent"],
      ["transparent", "transparent", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "transparent", "transparent"],
      ["transparent", "transparent", "transparent", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "#14F195", "transparent", "transparent", "transparent"],
      ["transparent", "transparent", "transparent", "#F59E0B", "#F59E0B", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "#F59E0B", "#F59E0B", "transparent", "transparent", "transparent"],
      ["transparent", "transparent", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "transparent", "transparent", "transparent", "transparent", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "transparent", "transparent"],
      ["transparent", "transparent", "#14F195", "#14F195", "#14F195", "#14F195", "transparent", "transparent", "transparent", "transparent", "#14F195", "#14F195", "#14F195", "#14F195", "transparent", "transparent"],
    ],
    previewDataUrl: "",
    unlocksCount: 96,
    royaltiesEarned: 86400,
    totalBurned: 960,
    createdAt: 1710200000000,
    featured: true,
  },
  {
    id: "char_solana_doge",
    name: "Cyber Doge Nom",
    description: "Much speed, very burn, so pump. Equipped with cyber-goggles for high velocity candy interception.",
    creatorId: "creator_doge",
    creatorName: "CandyCrusher",
    priceNom: 1500,
    pixels: [
      ["transparent", "#F59E0B", "#F59E0B", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "#F59E0B", "#F59E0B", "transparent"],
      ["#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B"],
      ["#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B"],
      ["#F59E0B", "#F59E0B", "#06B6D4", "#06B6D4", "#06B6D4", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#06B6D4", "#06B6D4", "#06B6D4", "#F59E0B", "#F59E0B", "#F59E0B"],
      ["#F59E0B", "#F59E0B", "#06B6D4", "#0F172A", "#06B6D4", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#06B6D4", "#0F172A", "#06B6D4", "#F59E0B", "#F59E0B", "#F59E0B"],
      ["#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#0F172A", "#0F172A", "#0F172A", "#0F172A", "#0F172A", "#0F172A", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B"],
      ["#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#0F172A", "#EC4899", "#EC4899", "#EC4899", "#EC4899", "#EC4899", "#EC4899", "#0F172A", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B"],
      ["#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#0F172A", "#EC4899", "#EC4899", "#EC4899", "#EC4899", "#EC4899", "#EC4899", "#0F172A", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B"],
      ["#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#0F172A", "#0F172A", "#0F172A", "#0F172A", "#0F172A", "#0F172A", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B"],
      ["transparent", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "transparent"],
      ["transparent", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "transparent"],
      ["transparent", "transparent", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "transparent", "transparent"],
      ["transparent", "transparent", "transparent", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "transparent", "transparent", "transparent"],
      ["transparent", "transparent", "transparent", "#FFFFFF", "#FFFFFF", "transparent", "transparent", "transparent", "transparent", "transparent", "transparent", "#FFFFFF", "#FFFFFF", "transparent", "transparent", "transparent"],
      ["transparent", "transparent", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "transparent", "transparent", "transparent", "transparent", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "transparent", "transparent"],
      ["transparent", "transparent", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "transparent", "transparent", "transparent", "transparent", "#F59E0B", "#F59E0B", "#F59E0B", "#F59E0B", "transparent", "transparent"],
    ],
    previewDataUrl: "",
    unlocksCount: 65,
    royaltiesEarned: 87750,
    totalBurned: 975,
    createdAt: 1710300000000,
    featured: true,
  },
];

export function getMemeCharacters(): MemeCharacter[] {
  if (typeof window === "undefined") return SEED_CHARACTERS;
  try {
    const raw = localStorage.getItem(MEME_STORAGE_KEY);
    if (raw) {
      const parsed: MemeCharacter[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }

  // Pre-generate data URLs for seed characters
  const initialized = SEED_CHARACTERS.map((char) => ({
    ...char,
    previewDataUrl: char.previewDataUrl || pixelsToDataUrl(char.pixels),
  }));

  saveMemeCharacters(initialized);
  return initialized;
}

export function saveMemeCharacters(chars: MemeCharacter[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MEME_STORAGE_KEY, JSON.stringify(chars));
    window.dispatchEvent(new CustomEvent("NOM_MEME_CHARACTERS_UPDATE"));
  } catch {
    // ignore
  }
}

export function getUnlockedCharacterIds(userId: string): string[] {
  if (typeof window === "undefined") return ["char_classic_nom"];
  const key = `${UNLOCKED_STORAGE_PREFIX}${userId || "guest"}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return Array.from(new Set(["char_classic_nom", ...parsed]));
      }
    }
  } catch {
    // ignore
  }
  return ["char_classic_nom"];
}

export function saveUnlockedCharacterId(userId: string, characterId: string) {
  if (typeof window === "undefined") return;
  const current = getUnlockedCharacterIds(userId);
  if (!current.includes(characterId)) {
    const updated = [...current, characterId];
    localStorage.setItem(`${UNLOCKED_STORAGE_PREFIX}${userId || "guest"}`, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("NOM_UNLOCKED_CHARACTERS_UPDATE", { detail: { characterId } }));
  }
}

// Publish Meme Character to Community Bazaar
export function publishMemeCharacter(
  userId: string,
  userName: string,
  charData: {
    name: string;
    description: string;
    priceNom: number;
    pixels: string[][];
  }
): { success: boolean; character?: MemeCharacter; error?: string; burnedAmount?: number } {
  const vault = getUserVault(userId);

  if (vault.balance < MINT_LISTING_FEE) {
    return {
      success: false,
      error: `Insufficient $NOM balance. Minting and listing a community meme character requires ${MINT_LISTING_FEE} $NOM.`,
    };
  }

  // Deduct 250 $NOM mint fee and burn 1%
  const burnAmount = Math.max(1, Math.round(MINT_LISTING_FEE * (BURN_FEE_PERCENT / 100)));
  vault.balance -= MINT_LISTING_FEE;
  vault.totalSpent += MINT_LISTING_FEE;
  vault.transactions.unshift({
    id: `mint_${Date.now()}`,
    type: "burn",
    amount: MINT_LISTING_FEE,
    timestamp: Date.now(),
    description: `Minted community character "${charData.name}" (${burnAmount} burned 🔥)`,
  });
  saveUserVault(userId, vault);
  recordGlobalBurn(burnAmount);

  const preview = pixelsToDataUrl(charData.pixels);
  const newCharacter: MemeCharacter = {
    id: `meme_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: charData.name.trim() || "Custom Nomster",
    description: charData.description.trim() || "Community pixel meme creation.",
    creatorId: userId,
    creatorName: userName || "Anon Creator",
    priceNom: Math.max(0, charData.priceNom),
    pixels: charData.pixels,
    previewDataUrl: preview,
    unlocksCount: 1, // Creator owns it automatically
    royaltiesEarned: 0,
    totalBurned: burnAmount,
    createdAt: Date.now(),
    featured: false,
  };

  const current = getMemeCharacters();
  const updated = [newCharacter, ...current];
  saveMemeCharacters(updated);

  // Automatically unlock for creator
  saveUnlockedCharacterId(userId, newCharacter.id);

  // Record community feed event
  recordFeedItem({
    type: "burn",
    playerName: userName || "Anon Creator",
    amountNom: MINT_LISTING_FEE,
    burnedNom: burnAmount,
    roomTitle: `Minted "${newCharacter.name}"`,
  });

  return { success: true, character: newCharacter, burnedAmount: burnAmount };
}

// Unlock / Buy Community Meme Character
export function unlockMemeCharacter(
  userId: string,
  userName: string,
  characterId: string
): { success: boolean; error?: string; burnedAmount?: number; creatorShare?: number } {
  const characters = getMemeCharacters();
  const char = characters.find((c) => c.id === characterId);

  if (!char) {
    return { success: false, error: "Character not found." };
  }

  // If free, unlock instantly
  if (char.priceNom <= 0) {
    saveUnlockedCharacterId(userId, characterId);
    return { success: true, burnedAmount: 0, creatorShare: 0 };
  }

  const playerVault = getUserVault(userId);
  if (playerVault.balance < char.priceNom) {
    return {
      success: false,
      error: `Insufficient balance. You need ${char.priceNom.toLocaleString()} $NOM to unlock "${char.name}".`,
    };
  }

  // 90% Creator Royalty, 1% Burn, 9% Community Pot
  const burnAmount = Math.max(1, Math.round(char.priceNom * (BURN_FEE_PERCENT / 100)));
  const creatorShare = Math.round(char.priceNom * (CREATOR_ROYALTY_PERCENT / 100));

  playerVault.balance -= char.priceNom;
  playerVault.totalSpent += char.priceNom;
  playerVault.transactions.unshift({
    id: `unlock_${Date.now()}`,
    type: "entry_fee",
    amount: char.priceNom,
    timestamp: Date.now(),
    description: `Unlocked meme character "${char.name}" (${burnAmount} burned 🔥)`,
  });
  saveUserVault(userId, playerVault);

  // Credit creator
  if (char.creatorId && char.creatorId !== userId) {
    const creatorVault = getUserVault(char.creatorId);
    creatorVault.balance += creatorShare;
    creatorVault.totalCreatorEarnings += creatorShare;
    creatorVault.transactions.unshift({
      id: `royalty_skin_${Date.now()}`,
      type: "creator_royalty",
      amount: creatorShare,
      timestamp: Date.now(),
      description: `Royalty from "${char.name}" unlock: +${creatorShare.toLocaleString()} $NOM`,
    });
    saveUserVault(char.creatorId, creatorVault);
  }

  // Record permanent global burn
  recordGlobalBurn(burnAmount);

  // Update character stats
  char.unlocksCount += 1;
  char.royaltiesEarned += creatorShare;
  char.totalBurned += burnAmount;
  saveMemeCharacters(characters);

  // Unlock for player
  saveUnlockedCharacterId(userId, characterId);

  // Log in community feed
  recordFeedItem({
    type: "creator_royalty",
    playerName: userName || "Anon Nommer",
    amountNom: creatorShare,
    roomTitle: `Unlocked "${char.name}"`,
  });

  return { success: true, burnedAmount: burnAmount, creatorShare };
}

// Equip Meme Character into Phaser Game Engine
export function equipMemeCharacter(character: MemeCharacter) {
  if (typeof window === "undefined") return;
  const dataUrl = character.previewDataUrl || pixelsToDataUrl(character.pixels);
  try {
    localStorage.setItem("nomverse_custom_skin_data", dataUrl);
    window.dispatchEvent(new CustomEvent("nomverse_custom_skin_equipped", { detail: { dataUrl } }));
    window.dispatchEvent(new CustomEvent("NOM_CHARACTER_EQUIPPED", { detail: { character } }));
  } catch {
    // ignore
  }
}
