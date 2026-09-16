"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { UserBadge } from "../auth/UserBadge";
import { validateContent } from "@/lib/contentModeration";
import { Send, ShieldAlert, Sparkles, LogIn, Lightbulb, BookOpen, Gamepad2, Flame, MessageSquare } from "lucide-react";

interface PostComposerProps {
  onPostCreated: (post: {
    title: string;
    content: string;
    category: "ideas" | "lore" | "game" | "tokenomics" | "general";
  }) => Promise<boolean>;
}

const CATEGORIES = [
  { id: "ideas", label: "Ideas & Features", icon: Lightbulb, color: "text-amber-400" },
  { id: "lore", label: "Lore & Story", icon: BookOpen, color: "text-purple-400" },
  { id: "game", label: "Game Dev", icon: Gamepad2, color: "text-emerald-400" },
  { id: "tokenomics", label: "pump.fun", icon: Flame, color: "text-rose-400" },
  { id: "general", label: "General", icon: MessageSquare, color: "text-blue-400" },
] as const;

export const PostComposer: React.FC<PostComposerProps> = ({ onPostCreated }) => {
  const { user, openAuthModal } = useAuth();
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [category, setCategory] = useState<"ideas" | "lore" | "game" | "tokenomics" | "general">("ideas");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (error) setError(null);
  };

  const handleContentChange = (val: string) => {
    setContent(val);
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError("Please fill out both a title and message.");
      return;
    }

    // Validate title & content against sensitive words
    const checkTitle = validateContent(title);
    if (!checkTitle.isValid) {
      setError(checkTitle.reason || "Sensitive words in title are not allowed.");
      return;
    }

    const checkContent = validateContent(content);
    if (!checkContent.isValid) {
      setError(checkContent.reason || "Sensitive words in message are not allowed.");
      return;
    }

    setIsSubmitting(true);
    const success = await onPostCreated({ title, content, category });
    setIsSubmitting(false);

    if (success) {
      setTitle("");
      setContent("");
      setError(null);
    }
  };

  if (!user) {
    return (
      <div className="rounded-2xl bg-surface border border-slate-800 p-6 sm:p-8 text-center shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-lg mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Join the On-Platform Community Wall</h3>
          <p className="text-xs sm:text-sm text-slate-400">
            No external social media needed. Sign in with your <strong>Phantom</strong>, <strong>MetaMask</strong>, or <strong>Google</strong> account to publish your ideas, remix concepts, and participate in open Web3 discussions.
          </p>
          <div className="pt-2">
            <button
              onClick={openAuthModal}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-400 to-solana-green text-slate-950 shadow-lg shadow-emerald-900/30 hover:scale-105 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Connect Wallet / Sign In</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-surface border border-slate-800/90 p-5 sm:p-6 shadow-xl mb-8">
      {/* Active User Header */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 p-1 flex items-center justify-center">
            <Image
              src="/mascot.svg"
              alt="User Mascot Avatar"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white">{user.name}</span>
              <UserBadge provider={user.provider} />
            </div>
            <div className="text-[11px] font-mono text-slate-500 truncate max-w-[200px] sm:max-w-xs">
              {user.addressOrEmail}
            </div>
          </div>
        </div>

        <div className="text-[11px] font-mono text-emerald-400/80 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 hidden sm:block">
          Public Commons Wall
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Real-time Sensitive Filter Alert */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Category Selector Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  isSelected
                    ? "bg-slate-800 text-white border-solana-green/60 shadow-sm"
                    : "bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Title Input */}
        <div>
          <input
            type="text"
            placeholder="Post Title (e.g., 'Proposal for New Mini-Game Candy Obstacle')"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-solana-green/50 transition-colors"
          />
        </div>

        {/* Content Textarea */}
        <div>
          <textarea
            rows={3}
            placeholder="Share your ideas, suggestions, lore questions, or bug reports with the NomVerse community... (Family-friendly CC0 discussion only)"
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-solana-green/50 transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between gap-4 pt-1">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-solana-green" />
            <span>Sensitive content strictly moderated</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-500 to-solana-green text-slate-950 hover:opacity-90 disabled:opacity-40 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? "Publishing..." : "Post to Wall"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
