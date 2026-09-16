// Power-Ups Engine for NomVerse

export type PowerUpType = "magnet" | "shield" | "slowmo" | "rainbow";

export interface PowerUpConfig {
  id: PowerUpType;
  name: string;
  durationMs: number;
  color: string;
  hexColor: number;
  description: string;
  badge: string;
}

export const POWER_UPS: Record<PowerUpType, PowerUpConfig> = {
  magnet: {
    id: "magnet",
    name: "Solana Magnet",
    durationMs: 6500,
    color: "#9945FF",
    hexColor: 0x9945ff,
    description: "Pulls all falling candies toward Nomster's mouth!",
    badge: "🧲 MAGNET",
  },
  shield: {
    id: "shield",
    name: "Bubble Gum Shield",
    durationMs: 12000,
    color: "#00C2FF",
    hexColor: 0x00c2ff,
    description: "Nullifies 1 dropped candy or FUD spike collision!",
    badge: "🫧 SHIELD",
  },
  slowmo: {
    id: "slowmo",
    name: "Matrix Slow-Mo",
    durationMs: 6000,
    color: "#14F195",
    hexColor: 0x14f195,
    description: "Slows gravity and tumbling for precision catching!",
    badge: "❄️ SLOW-MO",
  },
  rainbow: {
    id: "rainbow",
    name: "Rainbow Super Candy",
    durationMs: 0, // instant
    color: "#F59E0B",
    hexColor: 0xf59e0b,
    description: "+3 Score and restores +1 Lost Heart!",
    badge: "🌈 RAINBOW",
  },
};

// Determines if next candy should be a power-up (20% chance if score >= 3)
export function rollForPowerUp(score: number): PowerUpType | null {
  if (score < 3) return null;
  const roll = Math.random();
  if (roll < 0.08) return "rainbow";
  if (roll < 0.16) return "magnet";
  if (roll < 0.24) return "shield";
  if (roll < 0.32) return "slowmo";
  return null;
}
