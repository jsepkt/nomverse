"use client";

import React, { useState, useEffect } from "react";
import {
  BountyItem,
  getBounties,
  claimBounty,
  submitBountyPR,
} from "@/lib/bountyStorage";
import { useAuth } from "@/context/AuthContext";
import {
  Sparkles,
  GitPullRequest,
  CheckCircle2,
  Clock,
  Flame,
  Award,
  ExternalLink,
  Code2,
  Palette,
  Globe,
  PlusCircle,
  X,
} from "lucide-react";

export const BountyTab: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const [bounties, setBounties] = useState<BountyItem[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [activePRModalBountyId, setActivePRModalBountyId] = useState<string | null>(null);
  const [prUrlInput, setPrUrlInput] = useState<string>("");

  useEffect(() => {
    setBounties(getBounties());
  }, []);

  const handleClaim = (bountyId: string) => {
    if (!user) {
      openAuthModal();
      return;
    }

    const res = claimBounty(bountyId, { id: user.id, name: user.name });
    if (res.success) {
      setBounties([...res.bounties]);
    } else {
      alert(res.message);
    }
  };

  const handleSubmitPR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePRModalBountyId || !prUrlInput.trim()) return;

    const res = submitBountyPR(activePRModalBountyId, prUrlInput.trim());
    if (res.success) {
      setBounties([...res.bounties]);
      setActivePRModalBountyId(null);
      setPrUrlInput("");
    }
  };

  const filtered = bounties.filter(
    (b) => selectedCat === "all" || b.category === selectedCat
  );

  return (
    <div className="w-full space-y-6 select-none animate-fade-in">
      {/* Tab Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-surface to-solana-purple/10 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>OPEN-SOURCE MICRO-BOUNTIES</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">Community Quests &amp; Grants</h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Earn permanent Community Karma, CC0 badges, and verified developer acclaim by tackling open tasks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
          >
            <GitPullRequest className="w-4 h-4 text-emerald-400" />
            <span>View GitHub Issues</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: "All Quests" },
          { id: "code", label: "💻 Code & Blinks" },
          { id: "art", label: "🎨 3D & Vector Art" },
          { id: "translation", label: "🌍 Localization" },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all shrink-0 border ${
              selectedCat === cat.id
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold"
                : "bg-surface text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Bounties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((bounty) => {
          const isClaimedByMe = user && bounty.claimedBy?.id === user.id;

          return (
            <div
              key={bounty.id}
              className="p-5 rounded-2xl bg-surface border border-slate-800/90 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg"
            >
              <div>
                {/* Header: Status & Reward */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                      bounty.status === "open"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : bounty.status === "claimed"
                        ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                        : "bg-purple-500/10 text-purple-300 border-purple-500/30"
                    }`}
                  >
                    {bounty.status === "open" && "🟢 OPEN FOR CLAIMS"}
                    {bounty.status === "claimed" && "🟡 IN PROGRESS"}
                    {bounty.status === "completed" && "🟣 COMPLETED & MERGED"}
                  </span>

                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-candy-gold">
                    <Award className="w-3.5 h-3.5 text-candy-gold" />
                    <span>+{bounty.karmaReward} Karma</span>
                  </div>
                </div>

                <h4 className="text-base font-bold text-white mb-2">{bounty.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {bounty.description}
                </p>

                {/* Tags */}
                <div className="flex items-center gap-1.5 flex-wrap mb-4">
                  {bounty.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="text-[11px] font-mono text-slate-400">
                  {bounty.claimedBy ? (
                    <span>
                      Claimed by: <strong className="text-white">{bounty.claimedBy.name}</strong>
                    </span>
                  ) : (
                    <span>Ready for pickup</span>
                  )}
                </div>

                <div>
                  {bounty.status === "open" && (
                    <button
                      onClick={() => handleClaim(bounty.id)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-md active:scale-95"
                    >
                      Claim Quest
                    </button>
                  )}

                  {bounty.status === "claimed" && isClaimedByMe && (
                    <button
                      onClick={() => setActivePRModalBountyId(bounty.id)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-md active:scale-95 flex items-center gap-1"
                    >
                      <GitPullRequest className="w-3.5 h-3.5" />
                      <span>Submit PR</span>
                    </button>
                  )}

                  {bounty.status === "completed" && bounty.prUrl && (
                    <a
                      href={bounty.prUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 hover:underline"
                    >
                      <span>Merged PR</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit PR Modal */}
      {activePRModalBountyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-surface border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setActivePRModalBountyId(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <GitPullRequest className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Submit GitHub Pull Request</h4>
                <p className="text-xs text-slate-400">Paste your PR link to complete this quest.</p>
              </div>
            </div>

            <form onSubmit={handleSubmitPR} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">
                  GitHub PR URL
                </label>
                <input
                  type="url"
                  required
                  value={prUrlInput}
                  onChange={(e) => setPrUrlInput(e.target.value)}
                  placeholder="https://github.com/nomverse/nomverse/pull/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:border-emerald-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActivePRModalBountyId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-lg"
                >
                  Confirm Completion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
