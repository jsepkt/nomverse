export type ContributorCategory =
  | "engine"
  | "physics"
  | "audio"
  | "art"
  | "lore"
  | "community"
  | "infrastructure";

export interface ContributorLevelInfo {
  level: number;
  title: string;
  badge: string;
  color: string;
  textColor: string;
  borderColor: string;
  bgGradient: string;
  minXP: number;
  maxXP: number;
  perks: string[];
}

export interface CommunityContributor {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  role: string;
  category: ContributorCategory;
  level: number;
  xp: number;
  contributionsCount: number;
  featuredWork: string;
  githubUrl?: string;
  prNumber?: number;
  badges: string[];
}

export interface UserLoggedContribution {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: ContributorCategory;
  url?: string;
  xpAwarded: number;
  timestamp: number;
  status: "verified" | "pending";
}

export const CONTRIBUTOR_LEVELS: ContributorLevelInfo[] = [
  {
    level: 1,
    title: "Novice Modder",
    badge: "🌱 Modder",
    color: "#10b981",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500/40",
    bgGradient: "from-emerald-500/20 via-teal-500/10 to-slate-900",
    minXP: 0,
    maxXP: 150,
    perks: ["NomWall Contributor Badge", "Arcade Room Companion Access", "Community Forum Flair"],
  },
  {
    level: 2,
    title: "Physics Artisan",
    badge: "⚙️ Artisan",
    color: "#06b6d4",
    textColor: "text-cyan-400",
    borderColor: "border-cyan-500/40",
    bgGradient: "from-cyan-500/20 via-blue-500/10 to-slate-900",
    minXP: 151,
    maxXP: 400,
    perks: ["Custom Candy Skin in Jukebox", "Priority Feature Issue Review", "Arcade Stage Tester Access"],
  },
  {
    level: 3,
    title: "Core Contributor",
    badge: "⚡ Core Dev",
    color: "#8b5cf6",
    textColor: "text-purple-400",
    borderColor: "border-purple-500/40",
    bgGradient: "from-purple-500/20 via-indigo-500/10 to-slate-900",
    minXP: 401,
    maxXP: 800,
    perks: ["Arcade Hall of Fame Showcase", "NomVerse Merch Whitelist", "Custom Discord Contributor Role"],
  },
  {
    level: 4,
    title: "Master Architect",
    badge: "💎 Architect",
    color: "#f59e0b",
    textColor: "text-amber-400",
    borderColor: "border-amber-500/40",
    bgGradient: "from-amber-500/20 via-orange-500/10 to-slate-900",
    minXP: 801,
    maxXP: 1500,
    perks: ["Glowing Golden Nomster Name Tag", "Direct PR Review Rights", "Lord Mega-FUD Raid Boss Tuning"],
  },
  {
    level: 5,
    title: "NomVerse Legend",
    badge: "👑 Legend",
    color: "#14f195",
    textColor: "text-solana-green",
    borderColor: "border-emerald-400/60",
    bgGradient: "from-emerald-400/25 via-solana-green/20 to-purple-950/60",
    minXP: 1501,
    maxXP: 3000,
    perks: ["Immortalized on Game Room Showcase", "Canonical Lore Co-Author", "CC0 Engine Core Governance"],
  },
];

export const SEED_CONTRIBUTORS: CommunityContributor[] = [
  {
    id: "contributor-1",
    name: "CryptoWaddler",
    handle: "@cryptowaddler",
    avatar: "🦆",
    role: "Lead Phaser 3 Engine Architect",
    category: "engine",
    level: 5,
    xp: 2850,
    contributionsCount: 24,
    featuredWork: "Phaser 3 Canvas renderer with sub-pixel waddle kinematics & collision matrix",
    githubUrl: "https://github.com/jsepkt/nomverse",
    prNumber: 42,
    badges: ["Core Maintainer", "Engine God", "CC0 Hero"],
  },
  {
    id: "contributor-2",
    name: "PixelNommer",
    handle: "@pixelnommer",
    avatar: "🎨",
    role: "Lead CC0 Sprite & Vector Artist",
    category: "art",
    level: 4,
    xp: 1420,
    contributionsCount: 16,
    featuredWork: "5 Procedural character skins, candy particle effects & SVG mascot vector suite",
    githubUrl: "https://github.com/jsepkt/nomverse",
    prNumber: 38,
    badges: ["Pixel Wizard", "Costume Maker"],
  },
  {
    id: "contributor-3",
    name: "SynthWaveSol",
    handle: "@synthsol",
    avatar: "🎹",
    role: "Web Audio Synthesizer Designer",
    category: "audio",
    level: 4,
    xp: 1280,
    contributionsCount: 12,
    featuredWork: "Zero-asset pure Web Audio API 8-bit oscillator suite & Arcade Jukebox",
    githubUrl: "https://github.com/jsepkt/nomverse",
    prNumber: 31,
    badges: ["Audio Virtuoso", "8-Bit Maestro"],
  },
  {
    id: "contributor-4",
    name: "QuantumQuokka",
    handle: "@quantumq",
    avatar: "🧸",
    role: "Toddler Mode & Assist Physics Dev",
    category: "physics",
    level: 3,
    xp: 760,
    contributionsCount: 9,
    featuredWork: "Gentle floaty candy gravity, automatic catch assist & toddler waddle steering",
    githubUrl: "https://github.com/jsepkt/nomverse",
    prNumber: 27,
    badges: ["Toddler Champion", "Accessibility"],
  },
  {
    id: "contributor-5",
    name: "SolSlayer99",
    handle: "@solslayer",
    avatar: "👾",
    role: "World Raid Boss Architect",
    category: "infrastructure",
    level: 3,
    xp: 690,
    contributionsCount: 7,
    featuredWork: "Lord Mega-FUD global HP bar, local attacks & community SOS broadcast network",
    githubUrl: "https://github.com/jsepkt/nomverse",
    prNumber: 22,
    badges: ["Raid Master", "Mega-FUD Bane"],
  },
  {
    id: "contributor-6",
    name: "LoreWeaver",
    handle: "@loreweaver",
    avatar: "📜",
    role: "Story Bible & Episodic Campaign Lead",
    category: "lore",
    level: 2,
    xp: 380,
    contributionsCount: 5,
    featuredWork: "Episodes 1 to 5 narrative arcs, boss lore bios & community story repository",
    githubUrl: "https://github.com/jsepkt/nomverse",
    prNumber: 15,
    badges: ["Story Crafter", "Lore Keeper"],
  },
];

export function getContributorLevel(xp: number): ContributorLevelInfo {
  if (xp <= 150) return CONTRIBUTOR_LEVELS[0];
  if (xp <= 400) return CONTRIBUTOR_LEVELS[1];
  if (xp <= 800) return CONTRIBUTOR_LEVELS[2];
  if (xp <= 1500) return CONTRIBUTOR_LEVELS[3];
  return CONTRIBUTOR_LEVELS[4];
}

const STORAGE_PREFIX = "nomverse_contributions_";

export function getUserLoggedContributions(userId: string): UserLoggedContribution[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return [];
}

export function logUserContribution(
  userId: string,
  contribution: {
    title: string;
    description: string;
    category: ContributorCategory;
    url?: string;
  }
): UserLoggedContribution {
  const existing = getUserLoggedContributions(userId);
  const newEntry: UserLoggedContribution = {
    id: `mod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId,
    title: contribution.title,
    description: contribution.description,
    category: contribution.category,
    url: contribution.url || "https://github.com/jsepkt/nomverse",
    xpAwarded: 150,
    timestamp: Date.now(),
    status: "verified",
  };

  const updated = [newEntry, ...existing];
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(updated));
  } catch {
    // ignore
  }

  return newEntry;
}

export interface UserXPBreakdown {
  totalXP: number;
  levelInfo: ContributorLevelInfo;
  nextLevelXP: number;
  progressPercent: number;
  breakdown: {
    karmaXP: number;
    highScoreXP: number;
    streakXP: number;
    contributionsXP: number;
  };
}

export function calculateUserXP(
  userId: string,
  karma: number,
  highScore: number,
  maxStreak: number
): UserXPBreakdown {
  const contributions = getUserLoggedContributions(userId);
  const contributionsXP = contributions.reduce((acc, c) => acc + c.xpAwarded, 0);
  const karmaXP = (karma || 0) * 10;
  const highScoreXP = Math.floor((highScore || 0) * 2);
  const streakXP = (maxStreak || 0) * 15;

  const totalXP = karmaXP + highScoreXP + streakXP + contributionsXP;
  const levelInfo = getContributorLevel(totalXP);

  const currentLevelMin = levelInfo.minXP;
  const currentLevelMax = levelInfo.maxXP;
  const progressWithinLevel = Math.max(0, totalXP - currentLevelMin);
  const range = Math.max(1, currentLevelMax - currentLevelMin);
  const progressPercent = Math.min(100, Math.round((progressWithinLevel / range) * 100));

  return {
    totalXP,
    levelInfo,
    nextLevelXP: currentLevelMax,
    progressPercent,
    breakdown: {
      karmaXP,
      highScoreXP,
      streakXP,
      contributionsXP,
    },
  };
}
