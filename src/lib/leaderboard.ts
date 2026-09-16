// Leaderboard & Hall of Fame Rankings Engine

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  provider: "phantom" | "metamask" | "google";
  highScore: number;
  maxStreak: number;
  karma: number;
  equippedSkin?: string;
}

export const SEED_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: "phantom_7XwF8q9XoX6x2N7YyQ5hV6k8B9v2Z1a3M4c5D6e7F8g9",
    name: "physics_wizard.sol",
    provider: "phantom",
    highScore: 48,
    maxStreak: 16,
    karma: 70,
    equippedSkin: "crown",
  },
  {
    rank: 2,
    userId: "metamask_0x71C...b29c",
    name: "0xLoreWeaver.eth",
    provider: "metamask",
    highScore: 35,
    maxStreak: 12,
    karma: 40,
    equippedSkin: "cap",
  },
  {
    rank: 3,
    userId: "google_alex.dev@gmail.com",
    name: "Alex B.",
    provider: "google",
    highScore: 29,
    maxStreak: 9,
    karma: 30,
    equippedSkin: "shades",
  },
  {
    rank: 4,
    userId: "phantom_player99",
    name: "ArcadeFan.sol",
    provider: "phantom",
    highScore: 24,
    maxStreak: 7,
    karma: 20,
    equippedSkin: "default",
  },
  {
    rank: 5,
    userId: "metamask_donor1",
    name: "KindBuilder.eth",
    provider: "metamask",
    highScore: 19,
    maxStreak: 6,
    karma: 60,
    equippedSkin: "crown",
  },
];
