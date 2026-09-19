import fs from "fs";
import path from "path";
import { AuthProviderType } from "@/context/AuthContext";
import { validateContent } from "./contentModeration";

export interface WallReply {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorProvider: AuthProviderType;
  content: string;
  createdAt: string;
}

export interface WallPost {
  id: string;
  authorId: string;
  authorName: string;
  authorProvider: AuthProviderType;
  title: string;
  content: string;
  category: "ideas" | "lore" | "game" | "tokenomics" | "general";
  createdAt: string;
  updatedAt?: string;
  likes: string[];
  dislikes: string[];
  neutrals: string[];
  reports: { userId: string; reason: string; reportedAt: string }[];
  replies: WallReply[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "wall_posts.json");

export const DEFAULT_WALL_POSTS: WallPost[] = [
  {
    id: "post_quest_01",
    authorId: "phantom_nomster_core",
    authorName: "NomsterCore.sol",
    authorProvider: "phantom",
    title: "🎮 [COMMUNITY QUEST #01] Design Nomster's Next Enemy: The Glitch Worm",
    content: "Calling all pixel artists & game builders! Chapter 3 introduced the Glitch Worm lurking in the mempool voids. Propose sprite designs, attack patterns, or submit a PR in src/components/game/. The winning submission will be merged into the official Phaser arcade engine! 👾\n\n**Reward:** +500 Karma + Verified CC0 Champion Badge.",
    category: "game",
    createdAt: "2026-09-17T18:00:00.000Z",
    likes: ["phantom_player99", "google_gamer1", "metamask_dev"],
    dislikes: [],
    neutrals: [],
    reports: [],
    replies: [
      {
        id: "reply_q1_01",
        postId: "post_quest_01",
        authorId: "phantom_artist44",
        authorName: "PixelNommer.sol",
        authorProvider: "phantom",
        content: "Drafted an 8-bit segment worm sprite with neon magenta glitches! Opening PR shortly.",
        createdAt: "2026-09-17T18:42:00.000Z",
      },
      {
        id: "reply_q1_02",
        postId: "post_quest_01",
        authorId: "google_builder",
        authorName: "GlitchHunter",
        authorProvider: "google",
        content: "Attack pattern should make it slither horizontally across the middle lane to block candies!",
        createdAt: "2026-09-17T19:15:00.000Z",
      },
    ],
  },
  {
    id: "post_quest_02",
    authorId: "phantom_chiptune",
    authorName: "ChiptuneWizard",
    authorProvider: "phantom",
    title: "🎵 [COMMUNITY QUEST #02] Compose the Boss Theme on NomBeats",
    content: "Use the built-in 8-bit NomBeats synthesizer below to sequence a 140 BPM boss rush chiptune track! Export your preset JSON and share it here. Community voted track becomes the official Level 3 theme!",
    category: "ideas",
    createdAt: "2026-09-17T16:30:00.000Z",
    likes: ["google_gamer1", "phantom_fan"],
    dislikes: [],
    neutrals: [],
    reports: [],
    replies: [
      {
        id: "reply_q2_01",
        postId: "post_quest_02",
        authorId: "google_synth",
        authorName: "SoundNommer",
        authorProvider: "google",
        content: "Working on a square-wave arpeggio bassline that drops right when FEAST MODE activates!",
        createdAt: "2026-09-17T17:10:00.000Z",
      },
    ],
  },
  {
    id: "post_lore_01",
    authorId: "metamask_lorekeeper",
    authorName: "LoreKeeper.eth",
    authorProvider: "metamask",
    title: "📜 [LORE PROPOSAL] Chapter 04: The Secret of the Golden Sugar Core",
    content: "Deep beneath the Raydium liquidity pool, Nomster stumbles upon a crystalline Sugar Core pulsing with Solana energy. How should Nomster harness this power? Does eating golden sugar trigger a permanent Frenzy state? Read and vote on the storyline in Lore Studio!",
    category: "lore",
    createdAt: "2026-09-17T14:10:00.000Z",
    likes: ["phantom_player99", "metamask_0x8523"],
    dislikes: [],
    neutrals: [],
    reports: [],
    replies: [
      {
        id: "reply_l1_01",
        postId: "post_lore_01",
        authorId: "google_gamer1",
        authorName: "StarNommer",
        authorProvider: "google",
        content: "A 10x Golden Sugar Frenzy mode when hitting a 20+ streak would be insane!",
        createdAt: "2026-09-17T15:00:00.000Z",
      },
    ],
  },
  {
    id: "post_meme_01",
    authorId: "phantom_memelord",
    authorName: "MemeLord.sol",
    authorProvider: "phantom",
    title: "🎨 [CC0 MEME] When the 100x Golden Sugar Drop Lands",
    content: "Made with the in-browser Nomster Meme Studio! Nomster with Laser Eyes and Diamond Hands staring down a red FUD spike. 100% CC0 public domain — remix, print, or share freely! 🚀💎",
    category: "ideas",
    createdAt: "2026-09-17T12:00:00.000Z",
    likes: ["phantom_player99", "google_gamer1"],
    dislikes: [],
    neutrals: [],
    reports: [],
    replies: [],
  },
  {
    id: "post_game_01",
    authorId: "phantom_speedrun",
    authorName: "ArcadeSpeedrunner",
    authorProvider: "phantom",
    title: "💡 [FEATURE SUGGESTION] Speed Dash Trails & Magnetic Pulse Power-Up",
    content: "What if collecting 3 consecutive green candies grants Nomster a brief magnetic pulse that pulls in nearby treats? Would reward combo streaks and make high-score chasing even more kinetic.",
    category: "game",
    createdAt: "2026-09-17T10:30:00.000Z",
    likes: ["phantom_player99"],
    dislikes: [],
    neutrals: [],
    reports: [],
    replies: [
      {
        id: "reply_g1_01",
        postId: "post_game_01",
        authorId: "metamask_nomdev",
        authorName: "NomDev.eth",
        authorProvider: "metamask",
        content: "Love this idea! We could add a neon cyan magnet aura around Nomster's head.",
        createdAt: "2026-09-17T11:05:00.000Z",
      },
    ],
  },
  {
    id: "post_token_01",
    authorId: "phantom_solana_maxi",
    authorName: "SolanaMaxi.sol",
    authorProvider: "phantom",
    title: "📊 [TOKENOMICS] 100% Fair Launch, Zero Dev Allocation, 100% CC0",
    content: "The cleanest launch model on Solana. 85 SOL bonding threshold on pump.fun -> automatic LP migration to Raydium with burned LP forever. The brand is owned by the internet, code is on GitHub, and the mascot belongs to everyone.",
    category: "tokenomics",
    createdAt: "2026-09-16T22:00:00.000Z",
    likes: ["phantom_player99", "google_gamer1", "metamask_dev"],
    dislikes: [],
    neutrals: [],
    reports: [],
    replies: [],
  },
  {
    id: "post_tech_01",
    authorId: "google_dev",
    authorName: "MobileDevNommer",
    authorProvider: "google",
    title: "🛠️ [OPEN SOURCE] Contributing Mobile Tilt Controls PR",
    content: "I'm working on a PR to enable accelerometer tilt controls for mobile players so you can tilt your phone to steer Nomster! Check out src/components/game/PhaserCanvas.tsx on GitHub if you want to test.",
    category: "general",
    createdAt: "2026-09-16T20:15:00.000Z",
    likes: ["phantom_player99"],
    dislikes: [],
    neutrals: [],
    reports: [],
    replies: [],
  },
];

export function getWallPosts(): WallPost[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      saveWallPosts(DEFAULT_WALL_POSTS);
      return DEFAULT_WALL_POSTS;
    }
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveWallPosts(DEFAULT_WALL_POSTS);
      return DEFAULT_WALL_POSTS;
    }
    return parsed;
  } catch (err) {
    console.error("Error reading wall_posts.json:", err);
    return DEFAULT_WALL_POSTS;
  }
}

export function saveWallPosts(posts: WallPost[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2), "utf8");
  } catch (err) {
    console.error("Error saving wall_posts.json:", err);
  }
}

export function createPost(
  authorId: string,
  authorName: string,
  authorProvider: AuthProviderType,
  title: string,
  content: string,
  category: "ideas" | "lore" | "game" | "tokenomics" | "general" = "general"
): { success: boolean; post?: WallPost; error?: string } {
  // Check sensitive content
  const titleCheck = validateContent(title);
  if (!titleCheck.isValid) {
    return { success: false, error: `Title rejected: ${titleCheck.reason}` };
  }

  const contentCheck = validateContent(content);
  if (!contentCheck.isValid) {
    return { success: false, error: `Content rejected: ${contentCheck.reason}` };
  }

  const posts = getWallPosts();
  const newPost: WallPost = {
    id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    authorId,
    authorName,
    authorProvider,
    title: title.trim(),
    content: content.trim(),
    category,
    createdAt: new Date().toISOString(),
    likes: [],
    dislikes: [],
    neutrals: [],
    reports: [],
    replies: [],
  };

  posts.unshift(newPost);
  saveWallPosts(posts);
  return { success: true, post: newPost };
}

export function editPost(
  postId: string,
  authorId: string,
  title: string,
  content: string,
  category?: "ideas" | "lore" | "game" | "tokenomics" | "general"
): { success: boolean; post?: WallPost; error?: string } {
  const titleCheck = validateContent(title);
  if (!titleCheck.isValid) {
    return { success: false, error: `Title rejected: ${titleCheck.reason}` };
  }

  const contentCheck = validateContent(content);
  if (!contentCheck.isValid) {
    return { success: false, error: `Content rejected: ${contentCheck.reason}` };
  }

  const posts = getWallPosts();
  const index = posts.findIndex((p) => p.id === postId);
  if (index === -1) {
    return { success: false, error: "Post not found." };
  }

  // Only the original author can edit
  if (posts[index].authorId !== authorId) {
    return { success: false, error: "Unauthorized: You can only edit your own posts." };
  }

  posts[index].title = title.trim();
  posts[index].content = content.trim();
  if (category) posts[index].category = category;
  posts[index].updatedAt = new Date().toISOString();

  saveWallPosts(posts);
  return { success: true, post: posts[index] };
}

export function deletePost(postId: string, authorId: string): { success: boolean; error?: string } {
  const posts = getWallPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) {
    return { success: false, error: "Post not found." };
  }

  if (post.authorId !== authorId) {
    return { success: false, error: "Unauthorized: You can only delete your own posts." };
  }

  const updated = posts.filter((p) => p.id !== postId);
  saveWallPosts(updated);
  return { success: true };
}

export function toggleReaction(
  postId: string,
  userId: string,
  reaction: "like" | "dislike" | "neutral"
): { success: boolean; post?: WallPost; error?: string } {
  const posts = getWallPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) return { success: false, error: "Post not found." };

  // Remove user from all other reactions
  post.likes = post.likes.filter((id) => id !== userId);
  post.dislikes = post.dislikes.filter((id) => id !== userId);
  post.neutrals = post.neutrals.filter((id) => id !== userId);

  // Toggle selection
  if (reaction === "like") {
    post.likes.push(userId);
  } else if (reaction === "dislike") {
    post.dislikes.push(userId);
  } else if (reaction === "neutral") {
    post.neutrals.push(userId);
  }

  saveWallPosts(posts);
  return { success: true, post };
}

export function addReply(
  postId: string,
  authorId: string,
  authorName: string,
  authorProvider: AuthProviderType,
  content: string
): { success: boolean; reply?: WallReply; error?: string } {
  const contentCheck = validateContent(content);
  if (!contentCheck.isValid) {
    return { success: false, error: `Reply rejected: ${contentCheck.reason}` };
  }

  const posts = getWallPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) return { success: false, error: "Post not found." };

  const newReply: WallReply = {
    id: `reply_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    postId,
    authorId,
    authorName,
    authorProvider,
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };

  post.replies.push(newReply);
  saveWallPosts(posts);
  return { success: true, reply: newReply };
}

export function deleteReply(
  postId: string,
  replyId: string,
  authorId: string
): { success: boolean; error?: string } {
  const posts = getWallPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) return { success: false, error: "Post not found." };

  const replyIndex = post.replies.findIndex((r) => r.id === replyId);
  if (replyIndex === -1) return { success: false, error: "Reply not found." };

  if (post.replies[replyIndex].authorId !== authorId && post.authorId !== authorId) {
    return { success: false, error: "Unauthorized to delete this reply." };
  }

  post.replies.splice(replyIndex, 1);
  saveWallPosts(posts);
  return { success: true };
}

export function reportPost(
  postId: string,
  userId: string,
  reason: string
): { success: boolean; post?: WallPost; error?: string } {
  const posts = getWallPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) return { success: false, error: "Post not found." };

  // Avoid duplicate reports from same user
  const alreadyReported = post.reports.some((r) => r.userId === userId);
  if (alreadyReported) {
    return { success: false, error: "You have already reported this post." };
  }

  post.reports.push({
    userId,
    reason: reason.trim() || "Inappropriate / Sensitive Content",
    reportedAt: new Date().toISOString(),
  });

  saveWallPosts(posts);
  return { success: true, post };
}
