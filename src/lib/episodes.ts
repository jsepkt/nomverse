export interface EpisodeConfig {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  lore: string;
  icon: string;
  themeColor: string;
  stageEnvironment: "meadow" | "moon" | "matrix" | "hyperdrive";
  targetScore: number;
  isBossEpisode?: boolean;
  bossName?: string;
  bossHp?: number;
  rewardTitle: string;
  isComingSoon?: boolean;
}

export const EPISODES: EpisodeConfig[] = [
  {
    id: "ep1",
    number: 1,
    title: "The Meadow of Green Candles",
    subtitle: "The Awakening",
    lore: "Nomster awakens on the peaceful pump.fun plains. Fresh green candles bloom everywhere! Practice your waddles, master Air Juggles, and feast on the green candy bounties.",
    icon: "🌱",
    themeColor: "#14F195",
    stageEnvironment: "meadow",
    targetScore: 15,
    rewardTitle: "Green Candle Cadet",
  },
  {
    id: "ep2",
    number: 2,
    title: "The Red Candle Trench",
    subtitle: "The Flash Crash",
    lore: "A sudden market dip shakes the order book! Red FUD glitch bombs rain from the sky. Master the Super Dash [Spacebar / Shift] to weave past hazards and keep your streak alive!",
    icon: "⚡",
    themeColor: "#EF4444",
    stageEnvironment: "matrix",
    targetScore: 30,
    rewardTitle: "Trench Survivor",
  },
  {
    id: "ep3",
    number: 3,
    title: "Showdown with Lord Mega-FUD",
    subtitle: "The Citadel of Paper Hands",
    lore: "Lord Mega-FUD descends in person to freeze Nomster's stash! Dodge his laser strikes, catch power candies to shoot photon spit blasts, and crush his 100 HP bar!",
    icon: "👾",
    themeColor: "#9945FF",
    stageEnvironment: "moon",
    targetScore: 40,
    isBossEpisode: true,
    bossName: "Lord Mega-FUD",
    bossHp: 100,
    rewardTitle: "FUD Slayer",
  },
  {
    id: "ep4",
    number: 4,
    title: "Raydium Hyper-Drive",
    subtitle: "The Promised Land",
    lore: "The $69K bonding curve threshold is shattered! The Raydium liquidity portal activates. Enter Zero-G hyperspace where fortunes are forged and golden candies shower endlessly!",
    icon: "👑",
    themeColor: "#F59E0B",
    stageEnvironment: "hyperdrive",
    targetScore: 69,
    rewardTitle: "Bonding Ascendant",
  },
  {
    id: "ep5",
    number: 5,
    title: "The Multiverse of Memes",
    subtitle: "Season 2 Preview",
    lore: "Lord Mega-FUD has retreated into the deep meme void. New dimensions, cross-chain boss raids, and community-crafted skins are forging now... Crave the next drop!",
    icon: "🌌",
    themeColor: "#06B6D4",
    stageEnvironment: "moon",
    targetScore: 999,
    rewardTitle: "Multiverse Pioneer",
    isComingSoon: true,
  },
];

export interface EpisodeProgress {
  unlocked: boolean;
  stars: number; // 0 to 3
  highScore: number;
  completed: boolean;
}

const STORAGE_PREFIX = "nomverse_episode_progress_";

export function getEpisodeProgress(userId: string = "guest"): Record<string, EpisodeProgress> {
  if (typeof window === "undefined") {
    return {
      ep1: { unlocked: true, stars: 0, highScore: 0, completed: false },
      ep2: { unlocked: false, stars: 0, highScore: 0, completed: false },
      ep3: { unlocked: false, stars: 0, highScore: 0, completed: false },
      ep4: { unlocked: false, stars: 0, highScore: 0, completed: false },
      ep5: { unlocked: false, stars: 0, highScore: 0, completed: false },
    };
  }

  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure episode 1 is always unlocked
      parsed.ep1 = { ...(parsed.ep1 || {}), unlocked: true };
      return parsed;
    }
  } catch {
    // ignore
  }

  return {
    ep1: { unlocked: true, stars: 0, highScore: 0, completed: false },
    ep2: { unlocked: false, stars: 0, highScore: 0, completed: false },
    ep3: { unlocked: false, stars: 0, highScore: 0, completed: false },
    ep4: { unlocked: false, stars: 0, highScore: 0, completed: false },
    ep5: { unlocked: false, stars: 0, highScore: 0, completed: false },
  };
}

export function saveEpisodeCompletion(
  episodeId: string,
  score: number,
  stars: number,
  userId: string = "guest"
): Record<string, EpisodeProgress> {
  const current = getEpisodeProgress(userId);

  const prev = current[episodeId] || { unlocked: true, stars: 0, highScore: 0, completed: false };
  current[episodeId] = {
    unlocked: true,
    completed: true,
    stars: Math.max(prev.stars || 0, stars),
    highScore: Math.max(prev.highScore || 0, score),
  };

  // Unlock next episode
  const index = EPISODES.findIndex((e) => e.id === episodeId);
  if (index !== -1 && index + 1 < EPISODES.length) {
    const nextEp = EPISODES[index + 1];
    if (!nextEp.isComingSoon) {
      current[nextEp.id] = {
        ...(current[nextEp.id] || { stars: 0, highScore: 0, completed: false }),
        unlocked: true,
      };
    }
  }

  try {
    localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(current));
  } catch {
    // ignore
  }

  return current;
}
