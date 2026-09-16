"use client";

import React, { useState } from "react";
import Image from "next/image";
import { WallReply } from "@/lib/wallStorage";
import { useAuth } from "@/context/AuthContext";
import { UserBadge } from "../auth/UserBadge";
import { validateContent } from "@/lib/contentModeration";
import { Send, Trash2, ShieldAlert, LogIn } from "lucide-react";

interface ReplyThreadProps {
  postId: string;
  replies: WallReply[];
  onAddReply: (postId: string, content: string) => Promise<boolean>;
  onDeleteReply: (postId: string, replyId: string) => Promise<boolean>;
}

export const ReplyThread: React.FC<ReplyThreadProps> = ({
  postId,
  replies,
  onAddReply,
  onDeleteReply,
}) => {
  const { user, openAuthModal } = useAuth();
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

    if (!content.trim()) return;

    // Real-time moderation check
    const check = validateContent(content);
    if (!check.isValid) {
      setError(check.reason || "Sensitive contents are not allowed.");
      return;
    }

    setIsSubmitting(true);
    const success = await onAddReply(postId, content);
    setIsSubmitting(false);

    if (success) {
      setContent("");
      setError(null);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-4">
      {/* Existing Replies List */}
      {replies.length > 0 && (
        <div className="space-y-3">
          {replies.map((reply) => {
            const isOwner = user && user.id === reply.authorId;
            return (
              <div
                key={reply.id}
                className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <div className="relative w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 p-0.5 flex items-center justify-center shrink-0">
                    <Image
                      src="/mascot.svg"
                      alt="Nomster avatar"
                      width={18}
                      height={18}
                      className="object-contain"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-slate-200">{reply.authorName}</span>
                      <UserBadge provider={reply.authorProvider} />
                      <span className="text-[10px] text-slate-500">
                        {new Date(reply.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                      {reply.content}
                    </p>
                  </div>
                </div>

                {isOwner && (
                  <button
                    onClick={() => onDeleteReply(postId, reply.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                    title="Delete reply"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reply Composer */}
      {user ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          {error && (
            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Write a constructive reply or suggestion..."
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-solana-green/50 transition-colors"
            />
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-solana-green/20 text-solana-green border border-solana-green/40 hover:bg-solana-green/30 disabled:opacity-40 text-xs font-bold transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Reply</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Sign in with Phantom, MetaMask, or Google to reply.</span>
          <button
            onClick={openAuthModal}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 font-mono font-medium transition-colors"
          >
            <LogIn className="w-3 h-3" />
            <span>Sign In</span>
          </button>
        </div>
      )}
    </div>
  );
};
