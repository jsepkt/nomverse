"use client";

import React, { useState, useEffect } from "react";
import { Portal } from "../ui/Portal";
import { X, GitPullRequest, Sparkles, Copy, CheckCircle2, Eye, Edit3, ExternalLink, MessageSquare } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { copyToClipboard } from "@/lib/clipboard";

interface LoreStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoreStudioModal: React.FC<LoreStudioModalProps> = ({ isOpen, onClose }) => {
  const { user, openAuthModal } = useAuth();
  const [title, setTitle] = useState<string>("The Great Solana Candy Halving");
  const [chapterNum, setChapterNum] = useState<number>(3);
  const [author, setAuthor] = useState<string>(user?.name || "Anonymous Builder");
  const [tags, setTags] = useState<string>("arcade, halving, solana, feast");
  const [content, setContent] = useState<string>(
    `The Solana network began humming with an unearthly pitch.

Nomster paused mid-munch. The golden block drops weren't falling every 400 milliseconds anymore—they were doubling in size and glowing with iridescent violet and cyan bands.

"THE CANDY HALVING HAS COMMENCED," flashed a terminal on validator node #849.

Nomster tightened his little green fists, adjusted his cyber shades, and grinned with his tiny fangs. If the candies were going to fall twice as fast, he would simply have to eat twice as fiercely.`
  );
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const fullMarkdown = `---
title: "${title}"
chapter: ${chapterNum}
date: "${new Date().toISOString().split("T")[0]}"
author: "${author}"
tags: [${tags
    .split(",")
    .map((t) => `"${t.trim()}"`)
    .join(", ")}]
---

${content}
`;

  const handleCopyMarkdown = async () => {
    await copyToClipboard(fullMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [isPostingWall, setIsPostingWall] = useState<boolean>(false);
  const [wallPosted, setWallPosted] = useState<boolean>(false);

  const handleOpenGitHubPR = () => {
    // Generate GitHub file creation link with encoded content
    const encodedContent = encodeURIComponent(fullMarkdown);
    const githubUrl = `https://github.com/jsepkt/nomverse/new/main?filename=src/content/stories/chapter-0${chapterNum}.md&value=${encodedContent}`;
    window.open(githubUrl, "_blank", "noopener,noreferrer");
  };

  const handlePostToWall = async () => {
    if (!user) {
      openAuthModal();
      return;
    }
    setIsPostingWall(true);
    try {
      await fetch("/api/wall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorId: user.id,
          authorName: user.name,
          authorProvider: user.provider,
          title: `📖 [LORE PROPOSAL] Chapter ${chapterNum}: ${title}`,
          content: `${content}\n\n*Tags: ${tags}*\n*Author: ${author}*`,
          category: "lore",
        }),
      });
      setWallPosted(true);
      setTimeout(() => setWallPosted(false), 3500);
    } catch (err) {
      console.error("Failed to post lore to wall:", err);
    } finally {
      setIsPostingWall(false);
    }
  };

  return (
    <Portal>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lore-studio-title"
        onClick={onClose}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl max-h-[90vh] bg-surface border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-solana-purple/10 border border-solana-purple/30 flex items-center justify-center text-solana-purple">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 id="lore-studio-title" className="text-lg font-bold text-white">NomVerse Living Lore Studio</h3>
                <p className="text-xs text-slate-400">
                  Write a new canon chapter. 100% CC0 public domain story engine.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        {/* Metadata Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-3 border-b border-slate-800 text-xs">
          <div>
            <label className="text-[11px] font-mono text-slate-400">Chapter Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono text-slate-400">Author Credit:</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono text-slate-400">Tags (comma separated):</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
            />
          </div>
        </div>

        {/* Split Screen Editor & Live Preview */}
        <div className="flex-1 min-h-[280px] grid grid-cols-1 md:grid-cols-2 gap-4 py-4 overflow-y-auto">
          {/* Left: Raw Markdown Editor */}
          <div className="flex flex-col space-y-1">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <Edit3 className="w-3 h-3 text-solana-green" />
              <span>Markdown Story Editor</span>
            </span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-solana-green/50 resize-none leading-relaxed"
            />
          </div>

          {/* Right: Visual Reader Preview */}
          <div className="flex flex-col space-y-1">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <Eye className="w-3 h-3 text-solana-purple" />
              <span>Visual Live Preview</span>
            </span>
            <div className="flex-1 p-4 rounded-xl bg-slate-900/60 border border-slate-800 overflow-y-auto space-y-3">
              <h2 className="text-base font-bold text-white">
                Chapter {chapterNum}: {title}
              </h2>
              <div className="text-[11px] font-mono text-emerald-400">By {author}</div>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {content}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Markdown Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Raw Markdown</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePostToWall}
              disabled={isPostingWall || wallPosted}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 transition-all disabled:opacity-60"
            >
              {wallPosted ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Posted to NomWall!</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isPostingWall ? "Posting..." : "Share to NomWall"}</span>
                </>
              )}
            </button>

            <button
              onClick={handleOpenGitHubPR}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/30 transition-all hover:scale-105"
            >
              <GitPullRequest className="w-4 h-4 text-pink-300" />
              <span>Open GitHub PR (1-Click)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
    </Portal>
  );
};
