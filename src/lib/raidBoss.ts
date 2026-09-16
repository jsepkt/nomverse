// NomVerse Global Community Raid Boss Engine: Lord Mega-FUD

export interface RaidBossState {
  name: string;
  title: string;
  maxHp: number;
  currentHp: number;
  isDefeated: boolean;
  totalParticipants: number;
  userHits: number;
}

export const RAID_MAX_HP = 100000;
const RAID_STORAGE_KEY = "nomverse_raid_state_";

export function getLocalRaidStats(userId?: string): { userHits: number } {
  if (typeof window === "undefined" || !userId) return { userHits: 0 };
  try {
    const raw = localStorage.getItem(`${RAID_STORAGE_KEY}${userId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return { userHits: 0 };
}

export function saveLocalRaidStats(userId: string, hits: number): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    localStorage.setItem(`${RAID_STORAGE_KEY}${userId}`, JSON.stringify({ userHits: hits }));
  } catch {
    // ignore
  }
}
