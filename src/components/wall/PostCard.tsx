"use client";

import React, { useState } from "react";
import Image from "next/image";
import { WallPost } from "@/lib/wallStorage";
import { useAuth } from "@/context/AuthContext";
import { UserBadge } from "../auth/UserBadge";
import { ReplyThread } from "./ReplyThread";
import { ReportModal } from "./ReportModal";
import { validateContent } from "@/lib/contentModeration";
import { replenishClientLives, addKarmaToUser } from "@/lib/lifeSystem";
import { sounds } from "../audio/soundEffects";
import {
  ThumbsUp,
  ThumbsDown,
  Meh,
  MessageCircle,
  Flag,
  Edit3,
  Trash2,
  AlertTriangle,
  Calendar,
  Gift,
  Heart,
  Trophy,
  Sparkles,
} from "lucide-react";

interface PostCardProps {
  post: WallPost;
  onEditPost: (postId: string, title: string, content: string) => Promise<boolean>;
  onDeletePost: (postId: string) => Promise<boolean>;
  onReact: (postId: string, reaction: "like" | "dislike" | "neutral") => Promise<void>;
  onAddReply: (postId: string, content: string) => Promise<boolean>;
  onDeleteReply: (postId: string, replyId: string) => Promise<boolean>;
  onReportPost: (postId: string, reason: string) => Promise<void>;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onEditPost,
  onDeletePost,
  onReact,
  onAddReply,
  onDeleteReply,
  onReportPost,
}) => {
  const { user, openAuthModal } = useAuth();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>(post.title);
  const [editContent, setEditContent] = useState<string>(post.content);
  const [editError, setEditError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [showReplies, setShowReplies] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [revealedFlagged, setRevealedFlagged] = useState<boolean>(false);
  const [giftSent, setGiftSent] = useState<boolean>(false);

  const isOwner = user && user.id === post.authorId;
  const isReportedByMe = user && post.reports.some((r) => r.userId === user.id);
  const isFlaggedSensitive = post.reports.length >= 2;

  const isSOSPost =
    post.title.includes("[LIFE SOS]") ||
    post.content.includes("lost all my lives") ||
    post.content.includes("lost all 3 lives");
  const isHighScorePost =
    post.title.includes("[HIGH SCORE RECORD]") || post.title.includes("[HIGH SCORE VICTORY]");

  const userLiked = user && post.likes.includes(user.id);
  const userDisliked = user && post.dislikes.includes(user.id);
  const userNeutral = user && post.neutrals.includes(user.id);

  const handleReact = (reaction: "like" | "dislike" | "neutral") => {
    if (!user) {
      openAuthModal();
      return;
    }
    onReact(post.id, reaction);
  };

  const handleGiftLife = async () => {
    if (!user) {
      openAuthModal();
      return;
    }

    if (user.id === post.authorId) {
      alert("You cannot gift a life to your own Nomster!");
      return;
    }

    try {
      setGiftSent(true);
      sounds.playGiftReceived();

      // Replenish recipient's life state locally and reward karma to giver
      replenishClientLives(post.authorId, 1);
      addKarmaToUser(user.id, 10);

      await fetch("/api/lives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "gift_life",
          postId: post.id,
          giverId: user.id,
          giverName: user.name,
          giverProvider: user.provider,
          recipientId: post.authorId,
          recipientName: post.authorName,
        }),
      });

      // Also add a reply to the post automatically
      await onAddReply(
        post.id,
        `🎁 Sent a +1 Life Gift to ${post.authorName}! Nomster has been revived. Enjoy the game! ❤️`
      );
    } catch (err) {
      console.error("Failed to send life gift:", err);
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      setEditError("Title and content cannot be empty.");
      return;
    }

    const checkTitle = validateContent(editTitle);
    if (!checkTitle.isValid) {
      setEditError(checkTitle.reason || "Sensitive words are not allowed in title.");
      return;
    }

    const checkContent = validateContent(editContent);
    if (!checkContent.isValid) {
      setEditError(checkContent.reason || "Sensitive words are not allowed in content.");
      return;
    }

    setIsSaving(true);
    const success = await onEditPost(post.id, editTitle, editContent);
    setIsSaving(false);

    if (success) {
      setIsEditing(false);
      setEditError(null);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this post from the wall?")) {
      await onDeletePost(post.id);
    }
  };

  return (
    <div
      className={`rounded-2xl bg-surface border p-5 sm:p-6 shadow-lg transition-all ${
        isHighScorePost
          ? "border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.15)]"
          : isSOSPost
          ? "border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.1)]"
          : "border-slate-800/90 hover:border-slate-700/80"
      }`}
    >
      {/* Top Author Metadata Bar */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 p-1 flex items-center justify-center shrink-0">
            <Image
              src="/mascot.svg"
              alt="Author Avatar"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-white">{post.authorName}</span>
              <UserBadge provider={post.authorProvider} />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 font-medium">
              <span className="capitalize text-emerald-400 font-mono">#{post.category}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
              {post.updatedAt && <span className="italic text-slate-500">(edited)</span>}
            </div>
          </div>
        </div>

        {/* Owner Controls (Edit / Delete) */}
        {isOwner && !isEditing && (
          <div className="flex items-center gap-1 text-slate-400">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
              title="Edit post"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
              title="Delete post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* High Score Celebration Banner */}
      {isHighScorePost && (
        <div className="my-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
          <span>🏆 ARCADE HIGH SCORE VICTORY!</span>
        </div>
      )}

      {/* Sensitive Content Blur/Warning Flag */}
      {isFlaggedSensitive && !revealedFlagged ? (
        <div className="my-4 p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-rose-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Community Sensitive Content Warning</span>
          </div>
          <p className="text-xs text-slate-400">
            This post was flagged by multiple community members for sensitive or inappropriate content.
          </p>
          <button
            onClick={() => setRevealedFlagged(true)}
            className="text-xs font-mono text-rose-300 hover:underline pt-1"
          >
            Click to reveal content anyway
          </button>
        </div>
      ) : (
        <>
          {/* Post Body (or Edit Form) */}
          {isEditing ? (
            <div className="my-4 space-y-3 p-4 rounded-xl bg-slate-900 border border-emerald-500/30">
              {editError && (
                <div className="text-xs text-rose-400 font-mono">{editError}</div>
              )}
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-solana-green"
              />
              <textarea
                rows={3}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-solana-green resize-none"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditTitle(post.title);
                    setEditContent(post.content);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="px-3 py-1.5 rounded-lg bg-solana-green text-slate-950 text-xs font-bold hover:opacity-90"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          ) : (
            <div className="my-3.5 space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {post.title}
              </h3>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                {post.content}
              </p>
            </div>
          )}
        </>
      )}

      {/* Life SOS Action Card */}
      {isSOSPost && (
        <div className="my-3 p-3.5 rounded-xl bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-slate-900 border border-rose-500/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-rose-300">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse shrink-0" />
            <span>
              <strong>Life SOS:</strong> Nomster is starving! Send a life gift to revive this player.
            </span>
          </div>

          <button
            onClick={handleGiftLife}
            disabled={giftSent || Boolean(user && user.id === post.authorId)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md shadow-rose-900/30 disabled:opacity-50"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>{giftSent ? "✓ Life Gift Sent!" : "🎁 Send +1 Life Gift"}</span>
          </button>
        </div>
      )}

      {/* Social Reactions & Interactions Bar */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Like / Dislike / Neutral */}
        <div className="flex items-center gap-1.5">
          {/* Like */}
          <button
            onClick={() => handleReact("like")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
              userLiked
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title="Like this post"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span className="font-mono font-bold">{post.likes.length}</span>
          </button>

          {/* Dislike */}
          <button
            onClick={() => handleReact("dislike")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
              userDisliked
                ? "bg-rose-500/20 border-rose-500/50 text-rose-300"
                : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title="Dislike"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span className="font-mono font-bold">{post.dislikes.length}</span>
          </button>

          {/* Neutral */}
          <button
            onClick={() => handleReact("neutral")}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
              userNeutral
                ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            title="Neutral / Under Discussion"
          >
            <Meh className="w-3.5 h-3.5" />
            <span className="font-mono font-bold">{post.neutrals.length}</span>
          </button>
        </div>

        {/* Right: Reply Toggle & Report */}
        <div className="flex items-center gap-2">
          {/* Reply Thread Toggle */}
          <button
            onClick={() => setShowReplies(!showReplies)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-all ${
              showReplies
                ? "bg-solana-purple/20 border-solana-purple/40 text-purple-300"
                : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5 text-solana-purple" />
            <span>Replies ({post.replies.length})</span>
          </button>

          {/* Report Button */}
          <button
            onClick={() => {
              if (!user) {
                openAuthModal();
                return;
              }
              setShowReportModal(true);
            }}
            className={`p-1.5 rounded-lg border transition-colors ${
              isReportedByMe
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                : "bg-slate-900/80 border-slate-800 text-slate-500 hover:text-rose-400"
            }`}
            title={isReportedByMe ? "You reported this post" : "Report sensitive or abusive content"}
          >
            <Flag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expandable Reply Thread */}
      {showReplies && (
        <ReplyThread
          postId={post.id}
          replies={post.replies}
          onAddReply={onAddReply}
          onDeleteReply={onDeleteReply}
        />
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        postId={post.id}
        onClose={() => setShowReportModal(false)}
        onSubmitReport={onReportPost}
      />
    </div>
  );
};
