// NomVerse Community Burn Hall of Fame & Live Deflationary Feed Storage

export interface CommunityFeedItem {
  id: string;
  type: "burn" | "play_entry" | "bounty_win" | "creator_royalty" | "withdraw_burn";
  playerName: string;
  amountNom: number;
  burnedNom?: number;
  roomTitle?: string;
  roomId?: string;
  timestamp: number;
  highlight?: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  value: number; // Burned, Earned, or Won
  secondaryValue?: number;
  badge: string;
  avatarSeed: string;
  isCurrentUser?: boolean;
}

const FEED_STORAGE_KEY = "nomverse_community_burn_feed_v1";

const SEED_FEED_ITEMS: CommunityFeedItem[] = [
  {
    id: "feed_1",
    type: "bounty_win",
    playerName: "CandyWhale.sol",
    amountNom: 9000,
    roomTitle: "Lord FUD Speedrun",
    timestamp: Date.now() - 45 * 1000,
    highlight: true,
  },
  {
    id: "feed_2",
    type: "burn",
    playerName: "SolanaSlayer",
    amountNom: 1000,
    burnedNom: 10,
    roomTitle: "Diamond Hands Gauntlet",
    timestamp: Date.now() - 110 * 1000,
  },
  {
    id: "feed_3",
    type: "creator_royalty",
    playerName: "MemeLord_CC0",
    amountNom: 450,
    roomTitle: "Moon or Dust Dash",
    timestamp: Date.now() - 190 * 1000,
  },
  {
    id: "feed_4",
    type: "burn",
    playerName: "PyromancerNom",
    amountNom: 5000,
    burnedNom: 50,
    roomTitle: "Whale's Feast",
    timestamp: Date.now() - 320 * 1000,
  },
  {
    id: "feed_5",
    type: "bounty_win",
    playerName: "GlitchHunter",
    amountNom: 4500,
    roomTitle: "Sugar Rush Frenzy",
    timestamp: Date.now() - 480 * 1000,
    highlight: true,
  },
  {
    id: "feed_6",
    type: "withdraw_burn",
    playerName: "PumpChad",
    amountNom: 25000,
    burnedNom: 250,
    timestamp: Date.now() - 750 * 1000,
  },
  {
    id: "feed_7",
    type: "burn",
    playerName: "NeonNommer",
    amountNom: 2500,
    burnedNom: 25,
    roomTitle: "Lord FUD Speedrun",
    timestamp: Date.now() - 980 * 1000,
  },
  {
    id: "feed_8",
    type: "creator_royalty",
    playerName: "CandyCrusher",
    amountNom: 225,
    roomTitle: "Diamond Hands Gauntlet",
    timestamp: Date.now() - 1240 * 1000,
  },
];

export function getCommunityFeed(): CommunityFeedItem[] {
  if (typeof window === "undefined") return SEED_FEED_ITEMS;
  try {
    const raw = localStorage.getItem(FEED_STORAGE_KEY);
    if (raw) {
      const parsed: CommunityFeedItem[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }

  // Seed initially
  saveCommunityFeed(SEED_FEED_ITEMS);
  return SEED_FEED_ITEMS;
}

export function saveCommunityFeed(feed: CommunityFeedItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(feed.slice(0, 50))); // Keep latest 50
    window.dispatchEvent(new CustomEvent("NOM_COMMUNITY_FEED_UPDATE"));
  } catch {
    // ignore
  }
}

export function recordFeedItem(item: Omit<CommunityFeedItem, "id" | "timestamp">) {
  const current = getCommunityFeed();
  const newItem: CommunityFeedItem = {
    ...item,
    id: `feed_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
  };

  const updated = [newItem, ...current];
  saveCommunityFeed(updated);
  return newItem;
}

// Top Burners Leaderboard
export function getTopBurners(currentUserBurned: number = 0, currentUserName: string = "You"): LeaderboardEntry[] {
  const base: LeaderboardEntry[] = [
    { rank: 1, id: "b1", name: "FireNom.sol", value: 14800, badge: "Pyromancer King", avatarSeed: "fn" },
    { rank: 2, id: "b2", name: "SolanaWhale99", value: 11250, badge: "Phoenix Whale", avatarSeed: "sw" },
    { rank: 3, id: "b3", name: "PumpChad", value: 8900, badge: "Inferno Legend", avatarSeed: "pc" },
    { rank: 4, id: "b4", name: "DiamondHands", value: 6400, badge: "Flame Warden", avatarSeed: "dh" },
    { rank: 5, id: "b5", name: "Nomster007", value: 4850, badge: "Spark Scout", avatarSeed: "n7" },
    { rank: 6, id: "b6", name: "MegaBurner", value: 3200, badge: "Torch Bearer", avatarSeed: "mb" },
    { rank: 7, id: "b7", name: "FudIncinerator", value: 2100, badge: "Ash Maker", avatarSeed: "fi" },
  ];

  if (currentUserBurned > 0) {
    base.push({
      rank: 999,
      id: "current_user",
      name: currentUserName || "You",
      value: currentUserBurned,
      badge: currentUserBurned >= 5000 ? "Phoenix Whale" : currentUserBurned >= 1000 ? "Inferno Legend" : "Spark Scout",
      avatarSeed: "you",
      isCurrentUser: true,
    });
  }

  // Sort by value descending and recalculate ranks
  return base
    .sort((a, b) => b.value - a.value)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}

// Top Room Creators Leaderboard (Royalty Income)
export function getTopCreators(currentUserEarned: number = 0, currentUserName: string = "You"): LeaderboardEntry[] {
  const base: LeaderboardEntry[] = [
    { rank: 1, id: "c1", name: "MemeLord_CC0", value: 45200, secondaryValue: 14, badge: "Master Architect", avatarSeed: "ml" },
    { rank: 2, id: "c2", name: "CandyCrusher", value: 32800, secondaryValue: 8, badge: "Confectioner", avatarSeed: "cc" },
    { rank: 3, id: "c3", name: "PixelWizard", value: 28100, secondaryValue: 6, badge: "Skin Maestro", avatarSeed: "pw" },
    { rank: 4, id: "c4", name: "FudDestroyer", value: 19500, secondaryValue: 5, badge: "Boss Crafter", avatarSeed: "fd" },
    { rank: 5, id: "c5", name: "NomVerseOG", value: 14200, secondaryValue: 4, badge: "Community Pillar", avatarSeed: "og" },
    { rank: 6, id: "c6", name: "SolanaSparks", value: 8900, secondaryValue: 3, badge: "Room Smith", avatarSeed: "ss" },
  ];

  if (currentUserEarned > 0) {
    base.push({
      rank: 999,
      id: "current_user",
      name: currentUserName || "You",
      value: currentUserEarned,
      secondaryValue: 1,
      badge: currentUserEarned >= 20000 ? "Master Architect" : currentUserEarned >= 5000 ? "Skin Maestro" : "Room Smith",
      avatarSeed: "you",
      isCurrentUser: true,
    });
  }

  return base
    .sort((a, b) => b.value - a.value)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}

// Top Bounty Winners (Hall of Fame)
export function getTopWinners(currentUserWon: number = 0, currentUserName: string = "You"): LeaderboardEntry[] {
  const base: LeaderboardEntry[] = [
    { rank: 1, id: "w1", name: "GlitchHunter", value: 128000, badge: "Grandmaster Nommer", avatarSeed: "gh" },
    { rank: 2, id: "w2", name: "CandyWhale.sol", value: 95000, badge: "Apex Muncher", avatarSeed: "cw" },
    { rank: 3, id: "w3", name: "SpeedDemon_Sol", value: 74500, badge: "Frenzy Blitz", avatarSeed: "sd" },
    { rank: 4, id: "w4", name: "NeonNommer", value: 52000, badge: "Reflex King", avatarSeed: "nn" },
    { rank: 5, id: "w5", name: "SugarRush", value: 38000, badge: "Sweet Tooth", avatarSeed: "sr" },
    { rank: 6, id: "w6", name: "SolanaSniper", value: 24500, badge: "Candy Stalker", avatarSeed: "snp" },
  ];

  if (currentUserWon > 0) {
    base.push({
      rank: 999,
      id: "current_user",
      name: currentUserName || "You",
      value: currentUserWon,
      badge: currentUserWon >= 50000 ? "Grandmaster Nommer" : currentUserWon >= 10000 ? "Apex Muncher" : "Sweet Tooth",
      avatarSeed: "you",
      isCurrentUser: true,
    });
  }

  return base
    .sort((a, b) => b.value - a.value)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}
