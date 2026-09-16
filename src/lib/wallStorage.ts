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

export function getWallPosts(): WallPost[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading wall_posts.json:", err);
    return [];
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
