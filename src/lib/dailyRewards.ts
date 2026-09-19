// NomVerse Daily Mystery Lootbox & 7-Day Streak Engine
// Drives viral daily retention without paid ads

import { getStoredHolderState } from "./holderTiers";

export interface DayReward {
  day: number;
  label: string;
  lives: number;
  candies: number;
  powerUp?: "shield" | "rainbow" | "fever";
  perkDescription: string;
  isSpecial: boolean;
}

export const DAILY_REWARDS_SCHEDULE: DayReward[] = [
  {
    day: 1,
    label: "Welcome Crate",
    lives: 1,
    candies: 50,
    perkDescription: "+1 Life & 50 Candies",
    isSpecial: false,
  },
  {
    day: 2,
    label: "Sugar Rush",
    lives: 1,
    candies: 100,
    perkDescription: "+1 Life & 100 Candies",
    isSpecial: false,
  },
  {
    day: 3,
    label: "Shield Cache",
    lives: 2,
    candies: 150,
    powerUp: "shield",
    perkDescription: "+2 Lives & Invulnerability Bubble",
    isSpecial: true,
  },
  {
    day: 4,
    label: "Glitch Stash",
    lives: 2,
    candies: 250,
    perkDescription: "+2 Lives & 250 Candies",
    isSpecial: false,
  },
  {
    day: 5,
    label: "Fever Booster",
    lives: 2,
    candies: 400,
    powerUp: "rainbow",
    perkDescription: "+2 Lives & Rainbow Multiplier",
    isSpecial: true,
  },
  {
    day: 6,
    label: "Cyber Hoard",
    lives: 3,
    candies: 600,
    perkDescription: "+3 Lives & 600 Candies",
    isSpecial: false,
  },
  {
    day: 7,
    label: "👑 Mega Whale Vault",
    lives: 4,
    candies: 1000,
    powerUp: "rainbow",
    perkDescription: "+4 Lives, 1,000 Candies & Royal Crown Aura!",
    isSpecial: true,
  },
];

export interface DailyStreakState {
  currentStreak: number;
  lastClaimedTimestamp: number;
  totalClaimsCount: number;
  totalCandiesClaimed: number;
}

const STREAK_STORAGE_KEY = "nomverse_daily_streak_v1";
const CLAIM_INTERVAL_MS = 18 * 60 * 60 * 1000; // 18 hours (flexible day)
const STREAK_RESET_MS = 36 * 60 * 60 * 1000; // 36 hours before streak resets

export function getDailyStreakState(): DailyStreakState {
  if (typeof window === "undefined") {
    return {
      currentStreak: 1,
      lastClaimedTimestamp: 0,
      totalClaimsCount: 0,
      totalCandiesClaimed: 0,
    };
  }

  try {
    const raw = localStorage.getItem(STREAK_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed;
    }
  } catch {
    // ignore
  }

  return {
    currentStreak: 1,
    lastClaimedTimestamp: 0,
    totalClaimsCount: 0,
    totalCandiesClaimed: 0,
  };
}

export function saveDailyStreakState(state: DailyStreakState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function canClaimToday(): {
  canClaim: boolean;
  effectiveDay: number;
  nextAvailableInMs: number;
  isHolderDouble: boolean;
} {
  const state = getDailyStreakState();
  const now = Date.now();

  const timeSinceLastClaim = now - state.lastClaimedTimestamp;

  // Check if user is a token holder for 2x perk
  const holder = getStoredHolderState();
  const isHolderDouble = Boolean(holder && holder.balance >= 100_000);

  // First time ever
  if (state.lastClaimedTimestamp === 0) {
    return {
      canClaim: true,
      effectiveDay: 1,
      nextAvailableInMs: 0,
      isHolderDouble,
    };
  }

  // If claimed less than 18 hours ago
  if (timeSinceLastClaim < CLAIM_INTERVAL_MS) {
    return {
      canClaim: false,
      effectiveDay: Math.min(7, Math.max(1, state.currentStreak)),
      nextAvailableInMs: CLAIM_INTERVAL_MS - timeSinceLastClaim,
      isHolderDouble,
    };
  }

  // Check if streak broke (>36 hours)
  let effectiveStreak = state.currentStreak;
  if (timeSinceLastClaim > STREAK_RESET_MS) {
    // Token holders get streak immunity!
    if (!isHolderDouble) {
      effectiveStreak = 1;
    }
  } else {
    // Advanced to next day
    effectiveStreak = effectiveStreak >= 7 ? 1 : effectiveStreak + 1;
  }

  return {
    canClaim: true,
    effectiveDay: effectiveStreak,
    nextAvailableInMs: 0,
    isHolderDouble,
  };
}

export function claimDailyReward(): {
  success: boolean;
  reward: DayReward;
  actualCandies: number;
  actualLives: number;
  isHolderDouble: boolean;
  newStreak: number;
} {
  const check = canClaimToday();
  if (!check.canClaim) {
    const rewardIndex = Math.min(6, Math.max(0, check.effectiveDay - 1));
    return {
      success: false,
      reward: DAILY_REWARDS_SCHEDULE[rewardIndex],
      actualCandies: 0,
      actualLives: 0,
      isHolderDouble: check.isHolderDouble,
      newStreak: check.effectiveDay,
    };
  }

  const rewardIndex = Math.min(6, Math.max(0, check.effectiveDay - 1));
  const baseReward = DAILY_REWARDS_SCHEDULE[rewardIndex];

  // Token holders get 2x candies and extra life
  const actualCandies = check.isHolderDouble ? baseReward.candies * 2 : baseReward.candies;
  const actualLives = check.isHolderDouble ? baseReward.lives + 1 : baseReward.lives;

  const now = Date.now();
  const newState: DailyStreakState = {
    currentStreak: check.effectiveDay,
    lastClaimedTimestamp: now,
    totalClaimsCount: (getDailyStreakState().totalClaimsCount || 0) + 1,
    totalCandiesClaimed: (getDailyStreakState().totalCandiesClaimed || 0) + actualCandies,
  };

  saveDailyStreakState(newState);

  return {
    success: true,
    reward: baseReward,
    actualCandies,
    actualLives,
    isHolderDouble: check.isHolderDouble,
    newStreak: check.effectiveDay,
  };
}
