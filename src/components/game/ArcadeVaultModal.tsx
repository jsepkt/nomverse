"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Coins,
  Flame,
  ArrowDownCircle,
  ArrowUpCircle,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";
import {
  getUserVault,
  depositToVault,
  withdrawFromVault,
  getTotalNomBurned,
  BURN_FEE_PERCENT,
  UserVaultState,
} from "@/lib/arcadeVault";
import { useAuth } from "@/context/AuthContext";
import { TOKEN_CONFIG } from "@/config/token";
import { sounds } from "../audio/soundEffects";
import confetti from "canvas-confetti";

interface ArcadeVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBalanceUpdated?: (newBalance: number) => void;
}

export const ArcadeVaultModal: React.FC<ArcadeVaultModalProps> = ({
  isOpen,
  onClose,
  onBalanceUpdated,
}) => {
  const { user, openAuthModal } = useAuth();
  const userId = user?.id || "guest";

  const [vaultState, setVaultState] = useState<UserVaultState>(getUserVault(userId));
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw" | "history">("deposit");
  const [depositAmount, setDepositAmount] = useState<number>(2500);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(1000);
  const [walletAddress, setWalletAddress] = useState<string>(
    user?.provider === "phantom" || user?.provider === "metamask" ? user.id : ""
  );
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [totalBurned, setTotalBurned] = useState<number>(getTotalNomBurned());

  useEffect(() => {
    if (isOpen) {
      const state = getUserVault(userId);
      setVaultState(state);
      setTotalBurned(getTotalNomBurned());
      setActionSuccess(null);
      setActionError(null);
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const handleDeposit = () => {
    if (depositAmount <= 0) {
      setActionError("Please select a valid deposit amount.");
      return;
    }

    const res = depositToVault(userId, depositAmount);
    if (res.success) {
      setVaultState(getUserVault(userId));
      setActionSuccess(`Successfully deposited ${depositAmount.toLocaleString()} $NOM into Arcade Vault!`);
      setActionError(null);
      sounds.playGoldenChime();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#14F195", "#9945FF", "#F59E0B"],
      });
      if (onBalanceUpdated) onBalanceUpdated(res.newBalance);
    }
  };

  const handleWithdraw = () => {
    const targetAddr = walletAddress.trim() || user?.id || "Solana_Wallet_Holder";
    if (withdrawAmount <= 0) {
      setActionError("Please enter a valid withdrawal amount.");
      return;
    }
    if (withdrawAmount > vaultState.balance) {
      setActionError("Insufficient balance in your arcade vault.");
      return;
    }

    const res = withdrawFromVault(userId, withdrawAmount, targetAddr);
    if (res.success) {
      setVaultState(getUserVault(userId));
      setTotalBurned(getTotalNomBurned());
      setActionSuccess(
        `Withdrawal approved! Sent ${(withdrawAmount - res.burnedAmount).toLocaleString()} $NOM to wallet (${res.burnedAmount.toLocaleString()} $NOM burned 🔥)`
      );
      setActionError(null);
      sounds.playGoldenChime();
      if (onBalanceUpdated) onBalanceUpdated(res.newBalance);
    } else {
      setActionError(res.error || "Withdrawal failed.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-950 border border-emerald-500/40 shadow-2xl p-5 sm:p-6 text-slate-100 max-h-[90vh] overflow-y-auto font-mono">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <span>NomVerse Arcade Bank</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                1% Burn Sink
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Gasless in-game micro-ledger with instant deposits, withdrawals &amp; automatic burns.
            </p>
          </div>
        </div>

        {/* Active Balance Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/20 to-slate-900 border border-emerald-500/30 shadow-inner mb-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>AVAILABLE ARCADE BALANCE</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Instant Gasless Play
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-white tracking-tight">
              {vaultState.balance.toLocaleString()} <span className="text-emerald-400 text-lg">$NOM</span>
            </div>
            <div className="text-right text-[11px] text-slate-400">
              Won: <span className="text-candy-gold font-bold">+{vaultState.totalWon.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Global Deflationary Burn Ticker Strip */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs mb-5">
          <div className="flex items-center gap-2 text-rose-300">
            <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
            <span>TOTAL $NOM BURNED VIA ARCADE:</span>
          </div>
          <strong className="text-rose-400 text-sm font-black">
            {totalBurned.toLocaleString()} $NOM 🔥
          </strong>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 mb-4 text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab("deposit");
              setActionSuccess(null);
              setActionError(null);
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "deposit"
                ? "bg-emerald-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            <span>Deposit</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("withdraw");
              setActionSuccess(null);
              setActionError(null);
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "withdraw"
                ? "bg-cyan-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ArrowUpCircle className="w-3.5 h-3.5" />
            <span>Withdraw</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("history");
              setActionSuccess(null);
              setActionError(null);
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "history"
                ? "bg-slate-800 text-white border border-slate-700"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>History ({vaultState.transactions.length})</span>
          </button>
        </div>

        {/* Tab 1: Deposit */}
        {activeTab === "deposit" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-bold block">
                Select Deposit Amount ($NOM Credits):
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[500, 1000, 2500, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      depositAmount === amt
                        ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    +{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span>Deposit Fee:</span>
                <span className="text-emerald-400 font-bold">0% (Zero Friction)</span>
              </div>
              <div className="flex justify-between">
                <span>Credited to In-Game Vault:</span>
                <span className="text-white font-bold">{depositAmount.toLocaleString()} $NOM</span>
              </div>
            </div>

            <button
              onClick={handleDeposit}
              className="w-full py-3 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-emerald-400 via-teal-300 to-solana-green text-slate-950 shadow-[0_0_20px_rgba(20,241,149,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowDownCircle className="w-4 h-4 text-slate-950" />
              <span>Confirm Deposit &amp; Credit Vault</span>
            </button>
          </div>
        )}

        {/* Tab 2: Withdraw */}
        {activeTab === "withdraw" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-bold block">
                Withdrawal Amount ($NOM):
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[500, 1000, 2500, vaultState.balance].map((amt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setWithdrawAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      withdrawAmount === amt
                        ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {idx === 3 ? "MAX" : amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-bold block">Destination Solana Address:</label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter base58 Solana wallet..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span>Withdrawal Deflationary Burn ({BURN_FEE_PERCENT}%):</span>
                <span className="text-rose-400 font-bold">
                  -{Math.max(1, Math.round(withdrawAmount * (BURN_FEE_PERCENT / 100))).toLocaleString()} $NOM 🔥
                </span>
              </div>
              <div className="flex justify-between">
                <span>Net Transferred to Wallet:</span>
                <span className="text-cyan-300 font-bold">
                  {(withdrawAmount - Math.max(1, Math.round(withdrawAmount * (BURN_FEE_PERCENT / 100)))).toLocaleString()} $NOM
                </span>
              </div>
            </div>

            <button
              onClick={handleWithdraw}
              className="w-full py-3 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowUpCircle className="w-4 h-4 text-slate-950" />
              <span>Withdraw to Solana Wallet (-1% Burn)</span>
            </button>
          </div>
        )}

        {/* Tab 3: History */}
        {activeTab === "history" && (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {vaultState.transactions.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">No transactions yet.</div>
            ) : (
              vaultState.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="font-bold text-white text-xs">{tx.description}</div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(tx.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div
                    className={`font-black font-mono ${
                      tx.type === "prize_won" || tx.type === "deposit" || tx.type === "creator_royalty"
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {tx.type === "prize_won" || tx.type === "deposit" || tx.type === "creator_royalty" ? "+" : "-"}
                    {tx.amount.toLocaleString()} $NOM
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Notifications */}
        {actionSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {actionError && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}
      </div>
    </div>
  );
};
