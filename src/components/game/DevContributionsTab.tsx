"use client";

import React, { useState, useEffect, useId } from "react";
import { useAuth } from "@/context/AuthContext";
import { getClientLifeState } from "@/lib/lifeSystem";
import {
  SEED_CONTRIBUTORS,
  CONTRIBUTOR_LEVELS,
  calculateUserXP,
  getUserLoggedContributions,
  logUserContribution,
  ContributorCategory,
  CommunityContributor,
  UserLoggedContribution,
  UserXPBreakdown,
} from "@/lib/contributions";
import { sounds } from "../audio/soundEffects";
import confetti from "canvas-confetti";
import {
  Code2,
  GitPullRequest,
  Trophy,
  Sparkles,
  ExternalLink,
  PlusCircle,
  CheckCircle2,
  Flame,
  Heart,
  ShieldCheck,
  Star,
  Users,
  Award,
  Layers,
  Zap,
} from "lucide-react";

export const DevContributionsTab: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const userId = user?.id || "guest";

  const [xpData, setXpData] = useState<UserXPBreakdown | null>(null);
  const [userContributions, setUserContributions] = useState<UserLoggedContribution[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);

  // Form State for new contribution
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState<ContributorCategory>("engine");
  const [formUrl, setFormUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const titleInputId = useId();
  const categorySelectId = useId();
  const urlInputId = useId();
  const descTextareaId = useId();

  // Load user XP & contributions
  const reloadData = () => {
    const lifeState = getClientLifeState(userId);
    const karma = lifeState.lifesaverKarma || 0;

    let highScore = 0;
    let maxStreak = 0;
    try {
      const storedHighScore = localStorage.getItem("nomverse_highscore");
      if (storedHighScore) highScore = parseInt(storedHighScore, 10) || 0;
      const storedMaxStreak = localStorage.getItem("nomverse_max_streak");
      if (storedMaxStreak) maxStreak = parseInt(storedMaxStreak, 10) || 0;
    } catch {
      // ignore
    }

    const calculated = calculateUserXP(userId, karma, highScore, maxStreak);
    setXpData(calculated);

    const logged = getUserLoggedContributions(userId);
    setUserContributions(logged);
  };

  useEffect(() => {
    reloadData();
  }, [userId, user]);

  const handleSubmitContribution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const newEntry = logUserContribution(userId, {
        title: formTitle.trim(),
        description: formDescription.trim() || "Community code / mod contribution to NomVerse",
        category: formCategory,
        url: formUrl.trim() || "https://github.com/jsepkt/nomverse",
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      sounds.playGoldenChime();

      setSuccessToast(`🎉 +150 XP Awarded for "${newEntry.title}"!`);
      setTimeout(() => setSuccessToast(null), 4000);

      setFormTitle("");
      setFormDescription("");
      setFormUrl("");
      setIsSubmitModalOpen(false);
      reloadData();
    } catch {
      // ignore
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredContributors =
    selectedCategory === "all"
      ? SEED_CONTRIBUTORS
      : SEED_CONTRIBUTORS.filter((c) => c.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 text-xs font-bold flex items-center justify-between shadow-[0_0_25px_rgba(20,241,149,0.3)] animate-in fade-in">
          <span>{successToast}</span>
          <button onClick={() => setSuccessToast(null)} className="text-slate-400 hover:text-white ml-2">
            ✕
          </button>
        </div>
      )}

      {/* MY CONTRIBUTOR LEVEL & XP TRACKER (HERO CARD) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-emerald-500/40 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Left: User Level & Status */}
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Your Contributor Profile
              </span>
              {!user && (
                <span className="text-[10px] font-mono text-slate-400">
                  (Guest Profile • Local XP Active)
                </span>
              )}
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border-2 border-emerald-400/60 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(20,241,149,0.25)] shrink-0">
                {xpData?.levelInfo.badge.split(" ")[0] || "🌱"}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Level {xpData?.levelInfo.level}: {xpData?.levelInfo.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Earn XP through high scores, rescuing friends with SOS hearts, and logging pull requests.
                </p>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">
                  Total XP: <strong className="text-emerald-400 font-black">{xpData?.totalXP || 0} XP</strong>
                </span>
                <span className="text-slate-400">
                  Target: <strong className="text-amber-300 font-bold">{xpData?.nextLevelXP || 150} XP</strong>
                </span>
              </div>

              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 relative">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-solana-green transition-all duration-300 shadow-[0_0_15px_rgba(20,241,149,0.5)]"
                  style={{ width: `${xpData?.progressPercent || 0}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                <span>{xpData?.progressPercent || 0}% toward next rank</span>
                <span>{xpData?.levelInfo.badge}</span>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Buttons & Stats */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 lg:w-64">
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="w-full py-3 px-4 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-emerald-400 via-teal-300 to-solana-green text-slate-950 shadow-[0_0_20px_rgba(20,241,149,0.35)] hover:shadow-[0_0_30px_rgba(20,241,149,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>Log My Mod / PR (+150 XP)</span>
            </button>

            {!user && (
              <button
                onClick={openAuthModal}
                className="w-full py-2.5 px-3 rounded-xl font-mono text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
              >
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Link Wallet to Cloud Sync</span>
              </button>
            )}

            {/* Unlocked Perks Pill */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] font-mono space-y-1">
              <div className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                Current Level Perks:
              </div>
              <div className="text-emerald-300 flex items-center gap-1.5 truncate">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">{xpData?.levelInfo.perks[0]}</span>
              </div>
              {xpData?.levelInfo.perks[1] && (
                <div className="text-emerald-300 flex items-center gap-1.5 truncate">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate">{xpData?.levelInfo.perks[1]}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* XP Source Breakdown Row */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <div className="text-[10px] text-slate-400">ARCADE HIGH SCORE</div>
            <div className="text-sm font-bold text-emerald-400">+{xpData?.breakdown.highScoreXP || 0} XP</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <div className="text-[10px] text-slate-400">COMBO STREAKS</div>
            <div className="text-sm font-bold text-amber-400">+{xpData?.breakdown.streakXP || 0} XP</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <div className="text-[10px] text-slate-400">COMMUNITY KARMA</div>
            <div className="text-sm font-bold text-pink-400">+{xpData?.breakdown.karmaXP || 0} XP</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <div className="text-[10px] text-slate-400">SUBMITTED MODS</div>
            <div className="text-sm font-bold text-cyan-300">+{xpData?.breakdown.contributionsXP || 0} XP</div>
          </div>
        </div>
      </div>

      {/* USER'S LOGGED CONTRIBUTIONS (IF ANY) */}
      {userContributions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <GitPullRequest className="w-4 h-4 text-emerald-400" />
              <span>Your Logged Contributions ({userContributions.length})</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {userContributions.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-white truncate">{item.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold shrink-0">
                      +{item.xpAwarded} XP
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/70 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span className="capitalize">{item.category}</span>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <span>View Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMMUNITY DEVELOPER HALL OF FAME */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span>Community Developer Hall of Fame</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Core Contributors
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Meet the builders crafting the physics, audio, art, and infrastructure of NomVerse.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
            {["all", "engine", "art", "audio", "physics", "infrastructure", "lore"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase font-bold transition-all ${
                  selectedCategory === cat
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Contributor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredContributors.map((dev) => (
            <div
              key={dev.id}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                      {dev.avatar}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">{dev.name}</h4>
                      <span className="text-xs font-mono text-slate-400">{dev.handle}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold shrink-0">
                    Lvl {dev.level}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    {dev.role}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
                    {dev.featuredWork}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500">{dev.contributionsCount} PRs Merged</span>
                <span className="text-cyan-400 font-bold">{dev.xp} XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: SUBMIT / LOG CONTRIBUTION */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-emerald-500/40 p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <GitPullRequest className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Log Your NomVerse Mod</h3>
                  <span className="text-xs text-slate-400">Awards +150 XP toward your contributor rank</span>
                </div>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitContribution} className="space-y-4">
              <div>
                <label htmlFor={titleInputId} className="block text-xs font-mono text-slate-300 mb-1">
                  Contribution / Mod Title *
                </label>
                <input
                  id={titleInputId}
                  type="text"
                  required
                  placeholder="e.g. Added 60fps waddle smoothing & sound FX"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor={categorySelectId} className="block text-xs font-mono text-slate-300 mb-1">Category</label>
                  <select
                    id={categorySelectId}
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ContributorCategory)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
                  >
                    <option value="engine">Engine / Gameplay</option>
                    <option value="physics">Physics / Mechanics</option>
                    <option value="art">Art / Sprites / Skins</option>
                    <option value="audio">Audio / Music</option>
                    <option value="lore">Lore / Story</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="community">Community / Docs</option>
                  </select>
                </div>

                <div>
                  <label htmlFor={urlInputId} className="block text-xs font-mono text-slate-300 mb-1">PR / Commit URL</label>
                  <input
                    id={urlInputId}
                    type="url"
                    placeholder="https://github.com/..."
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={descTextareaId} className="block text-xs font-mono text-slate-300 mb-1">Brief Description</label>
                <textarea
                  id={descTextareaId}
                  rows={3}
                  placeholder="What did this change improve or introduce to NomVerse?"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-emerald-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-400 hover:bg-emerald-300 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                >
                  <span>Submit &amp; Claim 150 XP</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
