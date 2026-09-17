"use client";

import React, { useState, useEffect } from "react";
import { Portal } from "../ui/Portal";
import { TOKEN_CONFIG } from "@/config/token";
import {
  HOLDER_TIERS,
  HolderTier,
  HolderPerks,
  getTierForBalance,
  getStoredHolderState,
  setStoredHolderState,
  clearStoredHolderState,
} from "@/lib/holderTiers";
import {
  Shield,
  Coins,
  Sparkles,
  Crown,
  Heart,
  ExternalLink,
  CheckCircle2,
  X,
  Zap,
  Wallet,
} from "lucide-react";
import { sounds } from "../audio/soundEffects";

interface HolderPerksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTierUpdated: (perks: HolderPerks) => void;
}

export const HolderPerksModal: React.FC<HolderPerksModalProps> = ({
  isOpen,
  onClose,
  onTierUpdated,
}) => {
  const [walletInput, setWalletInput] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentPerks, setCurrentPerks] = useState<HolderPerks>(HOLDER_TIERS.fish);
  const [verifiedBalance, setVerifiedBalance] = useState<number>(0);
  const [activeAddress, setActiveAddress] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const saved = getStoredHolderState();
    if (saved) {
      setActiveAddress(saved.walletAddress);
      setVerifiedBalance(saved.balance);
      const perks = getTierForBalance(saved.balance);
      setCurrentPerks(perks);
      onTierUpdated(perks);
    }
  }, [onTierUpdated]);

  if (!isOpen) return null;

  // Auto-connect injected wallet (Phantom / Solflare)
  const handleConnectInjected = async () => {
    setErrorMsg(null);
    setIsVerifying(true);
    try {
      const solana = (window as unknown as { solana?: { isPhantom?: boolean; connect: () => Promise<{ publicKey: { toString: () => string } }> } }).solana;
      if (!solana) {
        throw new Error("No Solana browser wallet detected. Enter your address below or try Bag Simulator!");
      }
      const resp = await solana.connect();
      const pubkey = resp.publicKey.toString();
      await verifyWalletAddress(pubkey);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to connect Solana wallet");
      setIsVerifying(false);
    }
  };

  // Manual address verification via serverless API
  const handleVerifyManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletInput.trim()) return;
    await verifyWalletAddress(walletInput.trim());
  };

  const verifyWalletAddress = async (address: string) => {
    setIsVerifying(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/holder-balance?wallet=${encodeURIComponent(address)}`);
      const data = await res.json();

      const balance = data.success ? data.balance : 0;
      const perks = getTierForBalance(balance);

      setVerifiedBalance(balance);
      setActiveAddress(address);
      setCurrentPerks(perks);
      setStoredHolderState({
        walletAddress: address,
        balance,
        tier: perks.tier,
        verifiedAt: Date.now(),
      });
      onTierUpdated(perks);
      sounds.playPowerUpCollect();
    } catch (err: any) {
      setErrorMsg(err?.message || "Could not query on-chain balance");
    } finally {
      setIsVerifying(false);
    }
  };

  // Dev / Testing Quick Simulator (Allows players to test tiers without spending SOL)
  const handleSimulateTier = (tier: HolderTier) => {
    const perks = HOLDER_TIERS[tier];
    const testBalance = perks.minTokens;
    setVerifiedBalance(testBalance);
    setActiveAddress(`Simulated_${tier.toUpperCase()}`);
    setCurrentPerks(perks);
    setStoredHolderState({
      walletAddress: `Simulated_${tier.toUpperCase()}`,
      balance: testBalance,
      tier,
      verifiedAt: Date.now(),
    });
    onTierUpdated(perks);
    sounds.playGoldenChime();
  };

  const handleDisconnect = () => {
    clearStoredHolderState();
    setActiveAddress(null);
    setVerifiedBalance(0);
    setCurrentPerks(HOLDER_TIERS.fish);
    onTierUpdated(HOLDER_TIERS.fish);
  };

  return (
    <Portal>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="holder-perks-title"
        onClick={onClose}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-3xl border border-emerald-500/30 bg-slate-950 p-6 shadow-[0_0_50px_rgba(20,241,149,0.25)] max-h-[85vh] overflow-y-auto"
        >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-[0_0_20px_rgba(20,241,149,0.4)]">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h2 id="holder-perks-title" className="text-lg font-black font-mono tracking-tight text-white flex items-center gap-2">
              <span>PROOF OF BAG PERKS</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ${TOKEN_CONFIG.symbol}
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Hold $NOM to unlock extra lives, score multipliers & exclusive skins
            </p>
          </div>
        </div>

        {/* Current Status Card */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 mb-5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase">Your Active Tier</div>
            <div
              className="text-base font-black font-mono flex items-center gap-1.5 mt-0.5"
              style={{ color: currentPerks.accentColor }}
            >
              <span>{currentPerks.badge}</span>
              {currentPerks.hasCrown && <Crown className="w-4 h-4 text-amber-400" />}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              Verified: {verifiedBalance.toLocaleString()} $NOM
            </div>
          </div>

          {activeAddress ? (
            <div className="text-right">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Active
              </span>
              <button
                onClick={handleDisconnect}
                className="text-[10px] font-mono text-rose-400 hover:underline mt-1.5 block"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectInjected}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(20,241,149,0.3)]"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>

        {/* Tier Cards Grid */}
        <div className="space-y-2.5 mb-5">
          {(Object.keys(HOLDER_TIERS) as HolderTier[]).map((tierKey) => {
            const t = HOLDER_TIERS[tierKey];
            const isCurrent = currentPerks.tier === t.tier;

            return (
              <div
                key={tierKey}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isCurrent
                    ? "border-emerald-400/80 bg-emerald-950/20 shadow-[0_0_20px_rgba(20,241,149,0.12)]"
                    : "border-slate-800/80 bg-slate-900/50 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-mono font-black"
                      style={{ color: t.accentColor }}
                    >
                      {t.badge}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      ({t.minTokens.toLocaleString()} $NOM)
                    </span>
                  </div>

                  {isCurrent && (
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-300 font-mono mb-2">{t.description}</div>

                <div className="flex flex-wrap gap-2 text-[10px] font-mono text-slate-400">
                  <span className="bg-slate-800/80 px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <Heart className="w-2.5 h-2.5 text-rose-400" />
                    {t.maxLives} Max Lives
                  </span>
                  <span className="bg-slate-800/80 px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 text-amber-400" />
                    {t.scoreMultiplier}x Score
                  </span>
                  <span className="bg-slate-800/80 px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5 text-sky-400" />
                    {t.raidMultiplier}x Raid Dmg
                  </span>
                  {t.hasCrown && (
                    <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-lg flex items-center gap-1 border border-amber-500/30">
                      <Crown className="w-2.5 h-2.5" />
                      Royal Crown
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Address Input Verification */}
        <form onSubmit={handleVerifyManual} className="mb-4">
          <label className="text-[11px] font-mono text-slate-400 block mb-1.5">
            Or paste any Solana Wallet Address to verify bag:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={walletInput}
              onChange={(e) => setWalletInput(e.target.value)}
              placeholder="e.g. 8a1i...jrpump or Phantom public key"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-400"
            />
            <button
              type="submit"
              disabled={isVerifying}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold transition-colors disabled:opacity-50"
            >
              {isVerifying ? "Verifying..." : "Verify"}
            </button>
          </div>
          {errorMsg && (
            <p className="text-[11px] font-mono text-rose-400 mt-1.5">{errorMsg}</p>
          )}
        </form>

        {/* Quick Simulator Test Buttons */}
        <div className="pt-2 border-t border-slate-800/80 mb-4">
          <div className="text-[10px] font-mono text-slate-400 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Dev / Arcade Simulator (Test Perks instantly without wallet):</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {(["fish", "shrimp", "dolphin", "whale"] as HolderTier[]).map((tier) => (
              <button
                key={tier}
                onClick={() => handleSimulateTier(tier)}
                className="py-1 px-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-slate-300 capitalize transition-colors"
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        {/* Primary CTA to pump.fun */}
        <a
          href={TOKEN_CONFIG.pumpFunUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-mono font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(20,241,149,0.35)] transition-all"
        >
          <span>BUY $NOM ON PUMP.FUN TO UPGRADE TIER</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
    </Portal>
  );
};
