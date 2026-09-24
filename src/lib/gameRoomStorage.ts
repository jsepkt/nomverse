// User-Generated Challenge Rooms Storage & Economy

export interface UgcGameRoom {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  creatorProvider?: string;
  gameMode: "candy_rush" | "survival_sprint" | "boss_attack";
  entryFee: number; // in $NOM (500, 1000, 2500, 5000, 10000, or custom)
  targetScore: number;
  timeLimitSeconds: number;
  prizePool: number; // accumulated prize pool in $NOM
  timesPlayed: number;
  timesWon: number;
  totalNomBurned: number;
  createdAt: number;
  featured?: boolean;
}

const ROOM_STORAGE_KEY = "nomverse_ugc_game_rooms";

export const ENTRY_FEE_PRESETS = [
  { label: "Micro", amount: 500, badge: "Low Risk" },
  { label: "Standard", amount: 1000, badge: "Popular" },
  { label: "Pro", amount: 2500, badge: "High Yield" },
  { label: "Whale", amount: 5000, badge: "Mega Pot" },
  { label: "Boss High-Roller", amount: 10000, badge: "Apex" },
];

const SEED_ROOMS: UgcGameRoom[] = [
  {
    id: "room_solana_speedrun",
    title: "Solana Speedrun: 350 Candies in 45s",
    description: "Munch golden candies fast! Reach 350 points before the 45-second clock expires to sweep the prize pool.",
    creatorId: "phantom_0xSpeedy",
    creatorName: "SpeedyNommer.sol",
    creatorProvider: "phantom",
    gameMode: "candy_rush",
    entryFee: 500,
    targetScore: 350,
    timeLimitSeconds: 45,
    prizePool: 8500,
    timesPlayed: 34,
    timesWon: 9,
    totalNomBurned: 170,
    createdAt: Date.now() - 3600000 * 24,
    featured: true,
  },
  {
    id: "room_fud_boss_raid",
    title: "Lord Mega-FUD Raid Boss Blitz",
    description: "Endure hazard storms and score 500+ points to inflict critical damage on the boss and win the bounty.",
    creatorId: "metamask_0xCyber",
    creatorName: "BossHunter.eth",
    creatorProvider: "metamask",
    gameMode: "boss_attack",
    entryFee: 1000,
    targetScore: 500,
    timeLimitSeconds: 60,
    prizePool: 19400,
    timesPlayed: 52,
    timesWon: 11,
    totalNomBurned: 520,
    createdAt: Date.now() - 3600000 * 18,
    featured: true,
  },
  {
    id: "room_survival_gauntlet",
    title: "Zero-Mistake Survival Gauntlet",
    description: "Navigate high-velocity red hazard waves. Score 300 points without losing a single heart!",
    creatorId: "phantom_0xWhale",
    creatorName: "WhaleChad.sol",
    creatorProvider: "phantom",
    gameMode: "survival_sprint",
    entryFee: 2500,
    targetScore: 300,
    timeLimitSeconds: 50,
    prizePool: 32500,
    timesPlayed: 28,
    timesWon: 4,
    totalNomBurned: 700,
    createdAt: Date.now() - 3600000 * 12,
  },
  {
    id: "room_micro_practice",
    title: "Rookie Snack Sprint (Low Stakes)",
    description: "Warm up your waddle paddles! Easy 200 point target for beginners to practice and win instant $NOM.",
    creatorId: "google_dev",
    creatorName: "CommunityBuilder",
    creatorProvider: "google",
    gameMode: "candy_rush",
    entryFee: 500,
    targetScore: 200,
    timeLimitSeconds: 40,
    prizePool: 4200,
    timesPlayed: 19,
    timesWon: 8,
    totalNomBurned: 95,
    createdAt: Date.now() - 3600000 * 6,
  },
];

export function getUgcRooms(): UgcGameRoom[] {
  if (typeof window === "undefined") return SEED_ROOMS;
  try {
    const raw = localStorage.getItem(ROOM_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return SEED_ROOMS;
}

export function saveUgcRooms(rooms: UgcGameRoom[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ROOM_STORAGE_KEY, JSON.stringify(rooms));
  } catch {
    // ignore
  }
}

export function createUgcRoom(params: {
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  creatorProvider?: string;
  gameMode: "candy_rush" | "survival_sprint" | "boss_attack";
  entryFee: number;
  targetScore: number;
  timeLimitSeconds: number;
  initialPrizeDeposit: number;
}): { success: boolean; room?: UgcGameRoom; error?: string } {
  if (!params.title.trim()) {
    return { success: false, error: "Room title is required." };
  }
  if (params.entryFee < 100) {
    return { success: false, error: "Minimum entry fee is 100 $NOM." };
  }
  if (params.targetScore < 50) {
    return { success: false, error: "Minimum target score is 50 candies." };
  }

  const rooms = getUgcRooms();
  const newRoom: UgcGameRoom = {
    id: `room_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: params.title.trim(),
    description: params.description.trim() || "Community challenge room created by player.",
    creatorId: params.creatorId,
    creatorName: params.creatorName,
    creatorProvider: params.creatorProvider,
    gameMode: params.gameMode,
    entryFee: params.entryFee,
    targetScore: params.targetScore,
    timeLimitSeconds: params.timeLimitSeconds,
    prizePool: Math.max(params.entryFee * 2, params.initialPrizeDeposit),
    timesPlayed: 0,
    timesWon: 0,
    totalNomBurned: 0,
    createdAt: Date.now(),
  };

  rooms.unshift(newRoom);
  saveUgcRooms(rooms);
  return { success: true, room: newRoom };
}

export function recordRoomPlayEvent(
  roomId: string,
  burnedNom: number,
  prizeAdded: number
): UgcGameRoom | null {
  const rooms = getUgcRooms();
  const room = rooms.find((r) => r.id === roomId);
  if (!room) return null;

  room.timesPlayed += 1;
  room.prizePool += prizeAdded;
  room.totalNomBurned += burnedNom;

  saveUgcRooms(rooms);
  return room;
}

export function recordRoomWinEvent(roomId: string, prizeWon: number): UgcGameRoom | null {
  const rooms = getUgcRooms();
  const room = rooms.find((r) => r.id === roomId);
  if (!room) return null;

  room.timesWon += 1;
  // Subtract won amount or reset baseline
  room.prizePool = Math.max(room.entryFee * 2, room.prizePool - prizeWon);

  saveUgcRooms(rooms);
  return room;
}
