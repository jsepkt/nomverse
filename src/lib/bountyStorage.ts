// NomVerse Open-Source Community Bounties & Micro-Quests

export interface BountyItem {
  id: string;
  title: string;
  description: string;
  category: "code" | "art" | "lore" | "translation";
  karmaReward: number;
  status: "open" | "claimed" | "completed";
  claimedBy?: { id: string; name: string };
  prUrl?: string;
  tags: string[];
}

const SEED_BOUNTIES: BountyItem[] = [
  {
    id: "bounty_01",
    title: "Design a 3D Blender Rig & Printable STL for Nomster",
    description: "Create an open-source .blend file and 3D printable STL of Nomster under CC0. Should feature movable jaw and cute round proportions.",
    category: "art",
    karmaReward: 500,
    status: "open",
    tags: ["Blender", "3D Printing", "CC0 Asset"],
  },
  {
    id: "bounty_02",
    title: "Translate Living Lore Chapters 1 & 2 into Spanish & Japanese",
    description: "Translate the markdown files in src/content/stories/ into Spanish (es) and Japanese (ja) preserving the whimsical crypto candy humor.",
    category: "translation",
    karmaReward: 350,
    status: "claimed",
    claimedBy: { id: "metamask_0x71Cb29c", name: "0xLoreWeaver.eth" },
    tags: ["i18n", "Localization", "Markdown"],
  },
  {
    id: "bounty_03",
    title: "Create Solana Blink / Action for Instant Candy Munching",
    description: "Build an official Solana Actions & Blinks JSON spec enabling Twitter/Discord users to tip 0.01 SOL to drop a candy directly on Nomster.",
    category: "code",
    karmaReward: 650,
    status: "open",
    tags: ["Solana", "Actions", "Blinks"],
  },
  {
    id: "bounty_04",
    title: "Compose Retro 8-Bit Chiptune Sound Pack for NomBeats",
    description: "Provide 4 unique chiptune oscillator presets (Arp, Sub-bass, Noise Snare, Glitch Chomp) using Web Audio API synthesis.",
    category: "code",
    karmaReward: 400,
    status: "open",
    tags: ["WebAudio", "Chiptune", "Synth"],
  },
  {
    id: "bounty_05",
    title: "Telegram & Discord CC0 Animated Mascot Sticker Pack",
    description: "Draw 12 expressive animated stickers (LFG, Rekt, HODL, NomNom, LaserEyes, ToTheMoon) in transparent WebP format.",
    category: "art",
    karmaReward: 300,
    status: "completed",
    claimedBy: { id: "phantom_artist44", name: "PixelNommer.sol" },
    prUrl: "https://github.com/nomverse/nomverse/pull/14",
    tags: ["Telegram", "Discord", "Stickers"],
  },
];

const BOUNTY_STORAGE_KEY = "nomverse_community_bounties";

export function getBounties(): BountyItem[] {
  if (typeof window === "undefined") return SEED_BOUNTIES;
  try {
    const raw = localStorage.getItem(BOUNTY_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return SEED_BOUNTIES;
}

export function claimBounty(
  bountyId: string,
  user: { id: string; name: string }
): { success: boolean; bounties: BountyItem[]; message?: string } {
  const list = getBounties();
  const bounty = list.find((b) => b.id === bountyId);

  if (!bounty) return { success: false, bounties: list, message: "Bounty not found" };
  if (bounty.status !== "open") {
    return { success: false, bounties: list, message: "This bounty is already claimed or completed." };
  }

  bounty.status = "claimed";
  bounty.claimedBy = user;

  try {
    localStorage.setItem(BOUNTY_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }

  return { success: true, bounties: list };
}

export function submitBountyPR(
  bountyId: string,
  prUrl: string
): { success: boolean; bounties: BountyItem[]; message?: string } {
  const list = getBounties();
  const bounty = list.find((b) => b.id === bountyId);

  if (!bounty) return { success: false, bounties: list, message: "Bounty not found" };

  bounty.prUrl = prUrl;
  bounty.status = "completed";

  try {
    localStorage.setItem(BOUNTY_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }

  return { success: true, bounties: list };
}
