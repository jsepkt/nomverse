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
  RefreshCw,
  Share2,
  Send,
} from "lucide-react";
import {
  getUserVault,
  depositToVault,
  withdrawFromVault,
  burnNomDirectly,
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
  const {
    user,
    openAuthModal,
    realNomBalance,
    solBalance,
    tierName,
    isVerifyingBalance,
    refreshBalance,
  } = useAuth();
  const userId = user?.id || "guest";

  const [vaultState, setVaultState] = useState<UserVaultState>(getUserVault(userId));
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw" | "burn" | "history">("deposit");
  const [depositAmount, setDepositAmount] = useState<number>(2500);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(1000);
  const [burnAmount, setBurnAmount] = useState<number>(1000);
  const [lastBurned, setLastBurned] = useState<number | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [totalBurned, setTotalBurned] = useState<number>(getTotalNomBurned());

  const isSolanaConnected =
    !!user && ["phantom", "solflare", "backpack"].includes(user.provider);

  useEffect(() => {
    if (isOpen) {
      const state = getUserVault(userId);
      setVaultState(state);
      setTotalBurned(getTotalNomBurned());
      setActionSuccess(null);
      setActionError(null);
      if (user?.addressOrEmail && isSolanaConnected) {
        setWalletAddress(user.addressOrEmail);
      }
    }
  }, [isOpen, userId, user, isSolanaConnected]);

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
    const targetAddr = walletAddress.trim() || user?.addressOrEmail || "Solana_Wallet_Holder";
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
        `Withdrawal approved! Sent ${(withdrawAmount - res.burnedAmount).toLocaleString()} $NOM to ${targetAddr.slice(0, 6)}... (${res.burnedAmount.toLocaleString()} $NOM burned 🔥)`
      );
      setActionError(null);
      sounds.playGoldenChime();
      if (onBalanceUpdated) onBalanceUpdated(res.newBalance);
    } else {
      setActionError(res.error || "Withdrawal failed.");
    }
  };

  const handleDirectBurn = () => {
    if (burnAmount <= 0) {
      setActionError("Please select a valid burn amount.");
      return;
    }
    if (burnAmount > vaultState.balance) {
      setActionError(`Insufficient balance. You have ${vaultState.balance.toLocaleString()} $NOM.`);
      return;
    }

    const res = burnNomDirectly(userId, burnAmount, user?.name);
    if (res.success) {
      setVaultState(getUserVault(userId));
      setTotalBurned(getTotalNomBurned());
      setLastBurned(burnAmount);
      setActionSuccess(`🔥 Successfully incinerated ${burnAmount.toLocaleString()} $NOM! Permanent supply reduced.`);
      setActionError(null);
      sounds.playGoldenChime();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.5 },
        colors: ["#F43F5E", "#F59E0B", "#EF4444"],
      });
      if (onBalanceUpdated) onBalanceUpdated(res.newBalance);
    } else {
      setActionError(res.error || "Burn failed.");
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

        {/* Real On-Chain Solana Wallet Sync Strip */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1.5 uppercase font-bold">
                <span>ON-CHAIN WALLET</span>
                {isSolanaConnected ? (
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[9px]">
                    {user?.provider.toUpperCase()} CONNECTED
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[9px]">
                    NOT CONNECTED
                  </span>
                )}
              </div>
              {isSolanaConnected ? (
                <div className="font-bold text-white flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="text-emerald-400">{realNomBalance.toLocaleString()} $NOM</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300">{solBalance} SOL</span>
                  <span className="text-[10px] text-amber-400 font-mono">({tierName})</span>
                </div>
              ) : (
                <div className="text-xs text-slate-300 mt-0.5 font-sans">
                  Connect Phantom or Solflare to sync real tokens
                </div>
              )}
            </div>
          </div>

          <div>
            {isSolanaConnected ? (
              <button
                type="button"
                onClick={() => refreshBalance()}
                disabled={isVerifyingBalance}
                className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Refresh on-chain balance"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${isVerifyingBalance ? "animate-spin" : ""}`} />
                <span>{isVerifyingBalance ? "Syncing..." : "Sync Chain"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>

        {/* Active In-Game Balance Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/20 to-slate-900 border border-emerald-500/30 shadow-inner mb-4">
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
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs mb-4">
          <div className="flex items-center gap-2 text-rose-300">
            <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
            <span>TOTAL $NOM BURNED VIA ARCADE:</span>
          </div>
          <strong className="text-rose-400 text-sm font-black">
            {totalBurned.toLocaleString()} $NOM 🔥
          </strong>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 mb-4 text-[10px] sm:text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab("deposit");
              setActionSuccess(null);
              setActionError(null);
            }}
            className={`py-2 px-0.5 sm:px-1 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer truncate ${
              activeTab === "deposit"
                ? "bg-emerald-500 text-slate-950 shadow-md font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ArrowDownCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Deposit</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("withdraw");
              setActionSuccess(null);
              setActionError(null);
            }}
            className={`py-2 px-0.5 sm:px-1 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer truncate ${
              activeTab === "withdraw"
                ? "bg-cyan-500 text-slate-950 shadow-md font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ArrowUpCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Withdraw</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("burn");
              setActionSuccess(null);
              setActionError(null);
            }}
            className={`py-2 px-0.5 sm:px-1 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer truncate ${
              activeTab === "burn"
                ? "bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md font-black"
                : "text-rose-400 hover:text-rose-300"
            }`}
          >
            <Flame className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">🔥 Burn</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("history");
              setActionSuccess(null);
              setActionError(null);
            }}
            className={`py-2 px-0.5 sm:px-1 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer truncate ${
              activeTab === "history"
                ? "bg-slate-800 text-white border border-slate-700 font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span className="truncate">History</span>
          </button>
        </div>

        {/* Tab 1: Deposit */}
        {activeTab === "deposit" && (
          <div className="space-y-4">
            {/* Quick Fill from Real On-Chain Wallet Balance if Connected */}
            {isSolanaConnected && realNomBalance > 0 && (
              <div className="p-2.5 rounded-xl bg-purple-950/25 border border-purple-500/30 flex items-center justify-between text-xs">
                <span className="text-purple-300 text-[11px]">From On-Chain Wallet:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDepositAmount(Math.max(100, Math.floor(realNomBalance * 0.25)))}
                    className="px-2 py-0.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 text-[10px] font-bold border border-purple-500/30 cursor-pointer"
                  >
                    25%
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepositAmount(Math.max(100, Math.floor(realNomBalance * 0.5)))}
                    className="px-2 py-0.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 text-[10px] font-bold border border-purple-500/30 cursor-pointer"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepositAmount(Math.floor(realNomBalance))}
                    className="px-2 py-0.5 rounded-lg bg-purple-500/30 hover:bg-purple-500/40 text-purple-100 text-[10px] font-bold border border-purple-500/50 cursor-pointer"
                  >
                    100% MAX
                  </button>
                </div>
              </div>
            )}

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
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
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

            {/* Direct pump.fun Buy Link */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Need more $NOM tokens?</span>
              <a
                href={TOKEN_CONFIG.pumpFunUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold hover:underline"
              >
                <span>Buy on pump.fun</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
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
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
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
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-300 font-bold">Destination Solana Address:</label>
                {isSolanaConnected && (
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Auto-filled ({user.provider})
                  </span>
                )}
              </div>
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

        {/* Tab 3: Burn / Incinerate */}
        {activeTab === "burn" && (
          <div className="space-y-4">
            <div className="p-3 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-xs space-y-1">
              <div className="font-bold text-rose-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>Voluntary Token Incineration</span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                Incinerated tokens are permanently destroyed and subtracted from the 1 Billion $NOM supply. Burns rank your address in the Burn Hall of Fame and broadcast a Whale Incineration announcement to the entire community.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-bold block">
                Select Amount to Incinerate ($NOM):
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[500, 1000, 5000, vaultState.balance].map((amt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setBurnAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      burnAmount === amt
                        ? "bg-rose-500/25 border-rose-400 text-rose-300 shadow-md font-black"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {idx === 3 ? "MAX" : `🔥 ${amt.toLocaleString()}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span>Burn Destination:</span>
                <span className="text-rose-400 font-bold font-mono">Permanent Null Burn Sink</span>
              </div>
              <div className="flex justify-between">
                <span>Supply Impact:</span>
                <span className="text-white font-bold">-{burnAmount.toLocaleString()} $NOM Forever</span>
              </div>
            </div>

            <button
              onClick={handleDirectBurn}
              className="w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 text-white shadow-[0_0_25px_rgba(244,63,94,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Flame className="w-4 h-4 fill-white text-white animate-pulse" />
              <span>Incinerate {burnAmount.toLocaleString()} $NOM Forever 🔥</span>
            </button>

            {lastBurned && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `🔥 I just permanently incinerated ${lastBurned.toLocaleString()} $NOM in the @Nomverse Arcade!\n\nDeflation in action. Come play & burn: https://nomverse.org/play\nMint: ${TOKEN_CONFIG.mintAddress}\n\n#NOM #Solana #pumpfun #burn`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Flex Burn on X</span>
                </a>

                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent("https://nomverse.org/play")}&text=${encodeURIComponent(
                    `🔥 Just burned ${lastBurned.toLocaleString()} $NOM on Nomverse Arcade! Supply is shrinking daily: mint ${TOKEN_CONFIG.mintAddress}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5 text-blue-400" />
                  <span>Telegram</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: History */}
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
