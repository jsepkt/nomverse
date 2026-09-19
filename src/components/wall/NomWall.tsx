"use client";

import React, { useState, useEffect, useCallback } from "react";
import { WallPost } from "@/lib/wallStorage";
import { useAuth } from "@/context/AuthContext";
import { PostComposer } from "./PostComposer";
import { PostCard } from "./PostCard";
import { LeaderboardTab } from "./LeaderboardTab";
import { BountyTab } from "./BountyTab";
import {
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Flame,
  Lightbulb,
  Gamepad2,
  BookOpen,
  Trophy,
  Award,
} from "lucide-react";

export const NomWall: React.FC = () => {
  const { user } = useAuth();
  const [activeMainTab, setActiveMainTab] = useState<"wall" | "leaderboard" | "bounties">("wall");
  const [posts, setPosts] = useState<WallPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "discussed" | "likes">("newest");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/wall");
      const data = await res.json();
      if (data.success && Array.isArray(data.posts)) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error("Failed to load wall posts:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    fetchPosts();
  };

  // Create post
  const handlePostCreated = async (postData: {
    title: string;
    content: string;
    category: "ideas" | "lore" | "game" | "tokenomics" | "general";
  }): Promise<boolean> => {
    if (!user) return false;

    try {
      const res = await fetch("/api/wall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorId: user.id,
          authorName: user.name,
          authorProvider: user.provider,
          title: postData.title,
          content: postData.content,
          category: postData.category,
        }),
      });

      const data = await res.json();
      if (data.success && data.post) {
        setPosts((prev) => [data.post, ...prev]);
        return true;
      } else {
        alert(data.error || "Failed to create post.");
        return false;
      }
    } catch (err) {
      console.error("Error creating post:", err);
      return false;
    }
  };

  // Edit post
  const handleEditPost = async (postId: string, title: string, content: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const res = await fetch("/api/wall", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "edit",
          postId,
          authorId: user.id,
          title,
          content,
        }),
      });

      const data = await res.json();
      if (data.success && data.post) {
        setPosts((prev) => prev.map((p) => (p.id === postId ? data.post : p)));
        return true;
      } else {
        alert(data.error || "Failed to update post.");
        return false;
      }
    } catch (err) {
      console.error("Error updating post:", err);
      return false;
    }
  };

  // Delete post
  const handleDeletePost = async (postId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const res = await fetch("/api/wall", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          authorId: user.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        return true;
      } else {
        alert(data.error || "Failed to delete post.");
        return false;
      }
    } catch (err) {
      console.error("Error deleting post:", err);
      return false;
    }
  };

  // React to post
  const handleReact = async (postId: string, reaction: "like" | "dislike" | "neutral") => {
    if (!user) return;

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const newLikes = p.likes.filter((id) => id !== user.id);
        const newDislikes = p.dislikes.filter((id) => id !== user.id);
        const newNeutrals = p.neutrals.filter((id) => id !== user.id);

        if (reaction === "like") newLikes.push(user.id);
        if (reaction === "dislike") newDislikes.push(user.id);
        if (reaction === "neutral") newNeutrals.push(user.id);

        return { ...p, likes: newLikes, dislikes: newDislikes, neutrals: newNeutrals };
      })
    );

    try {
      await fetch("/api/wall", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "react",
          postId,
          userId: user.id,
          reaction,
        }),
      });
    } catch (err) {
      console.error("Error saving reaction:", err);
      fetchPosts();
    }
  };

  // Add reply
  const handleAddReply = async (postId: string, content: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const res = await fetch("/api/wall", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reply",
          postId,
          authorId: user.id,
          authorName: user.name,
          authorProvider: user.provider,
          content,
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, replies: [...p.replies, data.reply] } : p
          )
        );
        return true;
      } else {
        alert(data.error || "Failed to post reply.");
        return false;
      }
    } catch (err) {
      console.error("Error posting reply:", err);
      return false;
    }
  };

  // Delete reply
  const handleDeleteReply = async (postId: string, replyId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const res = await fetch("/api/wall", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          replyId,
          authorId: user.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, replies: p.replies.filter((r) => r.id !== replyId) }
              : p
          )
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error deleting reply:", err);
      return false;
    }
  };

  // Report post
  const handleReportPost = async (postId: string, reason: string): Promise<void> => {
    if (!user) return;

    try {
      const res = await fetch("/api/wall", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "report",
          postId,
          userId: user.id,
          reason,
        }),
      });

      const data = await res.json();
      if (data.success && data.post) {
        setPosts((prev) => prev.map((p) => (p.id === postId ? data.post : p)));
      }
    } catch (err) {
      console.error("Error reporting post:", err);
    }
  };

  // Filter & Sort
  const filteredPosts = posts
    .filter((post) => {
      const matchCat = selectedCategory === "all" || post.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.authorName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "discussed") {
        return b.replies.length - a.replies.length;
      }
      if (sortBy === "likes") {
        return b.likes.length - a.likes.length;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <section id="wall" className="w-full py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-slate-950/20">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-4">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>THE PUBLIC COMMONS WALL</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
            Community Thoughts &amp; Ideas Wall
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            NomVerse is completely unchained from third-party social media (no X/Twitter, no Facebook). All feedback, game improvements, lore suggestions, and discussions live right here on the public wall with verified <strong>Phantom</strong>, <strong>MetaMask</strong>, and <strong>Google</strong> identities.
          </p>
        </div>

        {/* Main Section Navigation Switcher */}
        <div className="flex justify-center mb-8 px-2">
          <div className="p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800/80 backdrop-blur-xl flex items-center gap-1.5 max-w-full overflow-x-auto no-scrollbar shadow-xl">
            <button
              onClick={() => setActiveMainTab("wall")}
              className={`inline-flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                activeMainTab === "wall"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_20px_rgba(34,197,94,0.25)]"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent"
              }`}
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Community Feed &amp; Discussions</span>
              <span className="sm:hidden">Feed</span>
            </button>

            <button
              onClick={() => setActiveMainTab("leaderboard")}
              className={`inline-flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                activeMainTab === "leaderboard"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent"
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">🏆 Hall of Fame</span>
              <span className="sm:hidden">🏆 Hall of Fame</span>
            </button>

            <button
              onClick={() => setActiveMainTab("bounties")}
              className={`inline-flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                activeMainTab === "bounties"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.25)]"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent"
              }`}
            >
              <Award className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">📜 Bounties &amp; Quests</span>
              <span className="sm:hidden">📜 Quests</span>
            </button>
          </div>
        </div>

        {activeMainTab === "leaderboard" ? (
          <LeaderboardTab />
        ) : activeMainTab === "bounties" ? (
          <BountyTab />
        ) : (
          <>
            {/* Post Composer */}
            <PostComposer onPostCreated={handlePostCreated} />

        {/* Filter, Sort & Search Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800/80">
          {/* Category Filter Pills (Horizontal Scroll Strip) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 w-full md:w-auto shrink-0 scroll-smooth">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border shrink-0 hover:scale-105 active:scale-95 ${
                selectedCategory === "all"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(34,197,94,0.25)]"
                  : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
              }`}
            >
              All Topics ({posts.length})
            </button>
            <button
              onClick={() => setSelectedCategory("ideas")}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border shrink-0 hover:scale-105 active:scale-95 flex items-center gap-1 ${
                selectedCategory === "ideas"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                  : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
              }`}
            >
              <span>💡</span>
              <span>Ideas</span>
            </button>
            <button
              onClick={() => setSelectedCategory("lore")}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border shrink-0 hover:scale-105 active:scale-95 flex items-center gap-1 ${
                selectedCategory === "lore"
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                  : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
              }`}
            >
              <span>📖</span>
              <span>Lore</span>
            </button>
            <button
              onClick={() => setSelectedCategory("game")}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border shrink-0 hover:scale-105 active:scale-95 flex items-center gap-1 ${
                selectedCategory === "game"
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                  : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
              }`}
            >
              <span>🎮</span>
              <span>Game</span>
            </button>
            <button
              onClick={() => setSelectedCategory("tokenomics")}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border shrink-0 hover:scale-105 active:scale-95 flex items-center gap-1 ${
                selectedCategory === "tokenomics"
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.25)]"
                  : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
              }`}
            >
              <span>🔥</span>
              <span>pump.fun</span>
            </button>
          </div>

          {/* Right Toolbar: Search & Sort */}
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            {/* Search Input */}
            <div className="relative flex-1 md:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search wall..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-solana-green/50 transition-all"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "discussed" | "likes")}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-solana-green/50 transition-all cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="discussed">Most Replies</option>
              <option value="likes">Top Liked</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={handleManualRefresh}
              className={`p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all hover:scale-105 active:scale-95 ${
                isRefreshing ? "animate-spin text-emerald-400" : ""
              }`}
              title="Refresh Wall"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Posts Feed */}
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-xs font-mono text-emerald-400">CONNECTING TO THE NOMWALL...</div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-surface border border-slate-800 p-8 space-y-3">
            <div className="text-3xl">🌱</div>
            <h4 className="text-base font-bold text-white">No thoughts found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Be the first verified builder to post on this topic. Share your thoughts or ideas with the community!
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onEditPost={handleEditPost}
                onDeletePost={handleDeletePost}
                onReact={handleReact}
                onAddReply={handleAddReply}
                onDeleteReply={handleDeleteReply}
                onReportPost={handleReportPost}
              />
            ))}
          </div>
        )}
          </>
        )}
      </div>
    </section>
  );
};
