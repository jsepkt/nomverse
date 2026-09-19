// Solana $NOM Holder Tiers & Perks Engine
// Token Mint: 8a1iQy5wSP77TPnvPqFou3ubjsAgRMAEPqKjU2jrpump

export type HolderTier = "fish" | "shrimp" | "dolphin" | "whale";

export interface HolderPerks {
  tier: HolderTier;
  label: string;
  badge: string;
  minTokens: number;
  extraLives: number;
  maxLives: number;
  regenMinutes: number;
  scoreMultiplier: number;
  raidMultiplier: number;
  unlockedSkinId?: string;
  hasCrown: boolean;
  accentColor: string;
  description: string;
}

export const HOLDER_TIERS: Record<HolderTier, HolderPerks> = {
  fish: {
    tier: "fish",
    label: "Fish Holder",
    badge: "🐟 FISH",
    minTokens: 0,
    extraLives: 0,
    maxLives: 5,
    regenMinutes: 10,
    scoreMultiplier: 1.0,
    raidMultiplier: 1,
    hasCrown: false,
    accentColor: "#94A3B8",
    description: "Standard arcade experience. 5 Lives Base (Max 10), 10 min regen.",
  },
  shrimp: {
    tier: "shrimp",
    label: "Shrimp Bag",
    badge: "🦐 SHRIMP",
    minTokens: 100_000,
    extraLives: 2,
    maxLives: 7,
    regenMinutes: 5,
    scoreMultiplier: 1.0,
    raidMultiplier: 1,
    hasCrown: false,
    accentColor: "#38BDF8",
    description: "Hold 100k+ $NOM: +2 Extra Lives (7 base, up to 10 with drops) & 5-min fast life regen!",
  },
  dolphin: {
    tier: "dolphin",
    label: "Dolphin Bag",
    badge: "🐬 DOLPHIN",
    minTokens: 1_000_000,
    extraLives: 2,
    maxLives: 7,
    regenMinutes: 5,
    scoreMultiplier: 1.25,
    raidMultiplier: 1,
    unlockedSkinId: "diamond",
    hasCrown: false,
    accentColor: "#14F195",
    description: "Hold 1M+ $NOM: 1.25x Score Multiplier & Diamondhands Skin unlock!",
  },
  whale: {
    tier: "whale",
    label: "Whale Lord",
    badge: "🐋 WHALE",
    minTokens: 5_000_000,
    extraLives: 3,
    maxLives: 8,
    regenMinutes: 3,
    scoreMultiplier: 1.5,
    raidMultiplier: 2,
    unlockedSkinId: "diamond",
    hasCrown: true,
    accentColor: "#F59E0B",
    description: "Hold 5M+ $NOM: 1.5x Score, 2x Raid Boss Damage, +3 Extra Lives (8 base), & Golden Royal Crown!",
  },
};

export function getTierForBalance(balance: number): HolderPerks {
  if (balance >= HOLDER_TIERS.whale.minTokens) return HOLDER_TIERS.whale;
  if (balance >= HOLDER_TIERS.dolphin.minTokens) return HOLDER_TIERS.dolphin;
  if (balance >= HOLDER_TIERS.shrimp.minTokens) return HOLDER_TIERS.shrimp;
  return HOLDER_TIERS.fish;
}

const HOLDER_STORAGE_KEY = "nomverse_holder_tier_v1";

export interface StoredHolderState {
  walletAddress: string;
  balance: number;
  tier: HolderTier;
  verifiedAt: number;
}

export function getStoredHolderState(): StoredHolderState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(HOLDER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredHolderState(state: StoredHolderState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HOLDER_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function clearStoredHolderState(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(HOLDER_STORAGE_KEY);
  } catch {
    // ignore
  }
}
