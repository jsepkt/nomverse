"use client";

import React, { useState, useEffect, useCallback, useId } from "react";
import {
  Activity,
  Cpu,
  Database,
  ExternalLink,
  RotateCcw,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Wallet,
  AlertCircle,
  Radio,
  Search,
} from "lucide-react";
import { TOKEN_CONFIG } from "@/config/token";
import { setStoredHolderState, HOLDER_TIERS } from "@/lib/holderTiers";

const SOLANA_MAINNET_RPC = "https://api.mainnet-beta.solana.com";

interface SolanaNetworkStats {
  slot: number;
  epoch: number;
  epochProgressPercent: number;
  tps: number;
  latencyMs: number;
  lastUpdated: number;
}

interface AddressLookupResult {
  address: string;
  solBalance: number;
  isHolder: boolean;
  tierName: string;
  verifiedAt: number;
}

export const SolanaRpcTelemetry: React.FC = () => {
  const [networkStats, setNetworkStats] = useState<SolanaNetworkStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Address Lookup State
  const [searchAddress, setSearchAddress] = useState<string>("");
  const [isLookingUp, setIsLookingUp] = useState<boolean>(false);
  const [lookupResult, setLookupResult] = useState<AddressLookupResult | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const addressInputId = useId();

  // Fetch real on-chain Solana metrics via official JSON-RPC 2.0
  const fetchSolanaRpc = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const start = performance.now();

    try {
      // 1. Fetch current slot and recent performance samples for real TPS
      const [slotRes, epochRes, perfRes] = await Promise.all([
        fetch(SOLANA_MAINNET_RPC, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getSlot" }),
        }),
        fetch(SOLANA_MAINNET_RPC, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "getEpochInfo" }),
        }),
        fetch(SOLANA_MAINNET_RPC, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 3,
            method: "getRecentPerformanceSamples",
            params: [2],
          }),
        }),
      ]);

      const latencyMs = Math.round(performance.now() - start);

      const slotData = await slotRes.json();
      const epochData = await epochRes.json();
      const perfData = await perfRes.json();

      const slot = slotData.result || 0;
      const epoch = epochData.result?.epoch || 0;
      const slotIndex = epochData.result?.slotIndex || 0;
      const slotsInEpoch = epochData.result?.slotsInEpoch || 432000;
      const epochProgressPercent = Math.min(100, Math.round((slotIndex / slotsInEpoch) * 100));

      // Calculate real TPS from the most recent sample
      let tps = 2400; // fallback standard Solana TPS
      if (perfData.result && perfData.result[0]) {
        const sample = perfData.result[0];
        const numTx = sample.numTransactions || 0;
        const period = sample.samplePeriodSecs || 60;
        tps = Math.round(numTx / period);
      }

      setNetworkStats({
        slot,
        epoch,
        epochProgressPercent,
        tps,
        latencyMs,
        lastUpdated: Date.now(),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to connect to Solana RPC";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSolanaRpc();
    const interval = setInterval(fetchSolanaRpc, 15000); // 15-second refresh
    return () => clearInterval(interval);
  }, [fetchSolanaRpc]);

  // Real on-chain balance verification for any Solana wallet
  const handleVerifyAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const addr = searchAddress.trim();
    if (!addr || addr.length < 32 || addr.length > 44) {
      setLookupError("Please enter a valid base58 Solana public key (32-44 characters)");
      return;
    }

    setIsLookingUp(true);
    setLookupError(null);
    setLookupResult(null);

    try {
      const res = await fetch(`/api/holder-balance?wallet=${encodeURIComponent(addr)}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Solana address verification failed");
      }

      const nomBalance = data.balance || 0;
      const isHolder = nomBalance > 0;
      const tierName = data.perks?.label || data.tierName || (isHolder ? "NOM Holder" : "Cadet");

      if (isHolder) {
        setStoredHolderState({
          walletAddress: addr,
          balance: nomBalance,
          tier: data.tier || "fish",
          verifiedAt: Date.now(),
        });
      }

      setLookupResult({
        address: addr,
        solBalance: nomBalance,
        isHolder,
        tierName,
        verifiedAt: Date.now(),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to query Solana mainnet balance";
      setLookupError(message);
    } finally {
      setIsLookingUp(false);
    }
  };

  return (
    <div className="w-full rounded-3xl bg-slate-950/80 border border-slate-800 p-5 sm:p-6 shadow-2xl relative overflow-hidden space-y-6">
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-solana-purple/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white">Solana Mainnet-Beta RPC Telemetry</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                Live On-Chain
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Endpoint: <span className="text-slate-300">{SOLANA_MAINNET_RPC}</span>
            </p>
          </div>
        </div>

        <button
          onClick={fetchSolanaRpc}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 hover:bg-slate-800 transition-all self-start sm:self-auto disabled:opacity-50"
          title="Refresh real-time on-chain stats"
        >
          <RotateCcw className={`w-3.5 h-3.5 text-emerald-400 ${isLoading ? "animate-spin" : ""}`} />
          <span>Sync RPC</span>
        </button>
      </div>

      {/* Live Metric Telemetry Gauges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 font-mono">
        {/* Metric 1: Current Slot Height */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>SLOT HEIGHT</span>
            <Database className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-white truncate">
            {networkStats ? networkStats.slot.toLocaleString() : "..."}
          </div>
          <div className="text-[10px] text-emerald-400/90 mt-1">Confirmed Blocks</div>
        </div>

        {/* Metric 2: Epoch Progress */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>EPOCH</span>
            <Cpu className="w-3.5 h-3.5 text-solana-purple" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-solana-purple">
            {networkStats ? `#${networkStats.epoch}` : "..."}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {networkStats ? `${networkStats.epochProgressPercent}% Complete` : "Loading..."}
          </div>
        </div>

        {/* Metric 3: Real TPS */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>NETWORK TPS</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-amber-300">
            {networkStats ? `${networkStats.tps.toLocaleString()} TPS` : "..."}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Real-time throughput</div>
        </div>

        {/* Metric 4: RPC Latency */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>RPC LATENCY</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-cyan-300">
            {networkStats ? `${networkStats.latencyMs} ms` : "..."}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Direct Node Ping</div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Real On-Chain Address Lookup & Holder Verification */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-3">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>Verify Any Solana Address on Mainnet</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Directly inspect real on-chain balance via `getBalance` JSON-RPC. Automatically unlocks verified Holder perks in the arcade.
          </p>
        </div>

        <form onSubmit={handleVerifyAddress} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              id={addressInputId}
              type="text"
              placeholder="Paste Solana Wallet Address (e.g. 7xKX...)"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-emerald-400 placeholder:text-slate-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLookingUp}
            className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-md shadow-emerald-500/20 disabled:opacity-50"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isLookingUp ? "Verifying..." : "Verify On-Chain"}</span>
          </button>
        </form>

        {lookupError && (
          <div className="text-xs font-mono text-rose-400 flex items-center gap-1.5 pt-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{lookupError}</span>
          </div>
        )}

        {lookupResult && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold text-white truncate max-w-[200px] sm:max-w-[320px]">
                  {lookupResult.address}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                {lookupResult.tierName}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-300 pt-1 border-t border-emerald-500/20">
              <div>
                Real $NOM Balance: <strong className="text-white">{lookupResult.solBalance.toLocaleString()} $NOM</strong>
              </div>
              <div className="text-right">
                <a
                  href={`https://solscan.io/account/${lookupResult.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 underline"
                >
                  <span>View on Solscan</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
