"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Flame,
  PlusCircle,
  Coins,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Target,
  Swords,
  Clock,
  Sparkles,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  Play,
} from "lucide-react";
import {
  getUgcRooms,
  UgcGameRoom,
  recordRoomPlayEvent,
  recordRoomWinEvent,
} from "@/lib/gameRoomStorage";
import {
  getUserVault,
  deductRoomEntryFee,
  awardChallengePrize,
  getTotalNomBurned,
} from "@/lib/arcadeVault";
import { useAuth } from "@/context/AuthContext";
import { ArcadeVaultModal } from "./ArcadeVaultModal";
import { CreateRoomModal } from "./CreateRoomModal";
import { sounds } from "../audio/soundEffects";
import confetti from "canvas-confetti";

interface UgcGameRoomsTabProps {
  onStartChallenge?: (room: UgcGameRoom) => void;
}

export const UgcGameRoomsTab: React.FC<UgcGameRoomsTabProps> = ({ onStartChallenge }) => {
  const { user, openAuthModal } = useAuth();
  const userId = user?.id || "guest";

  const [rooms, setRooms] = useState<UgcGameRoom[]>([]);
  const [balance, setBalance] = useState<number>(10000);
  const [totalBurned, setTotalBurned] = useState<number>(42850);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [isVaultOpen, setIsVaultOpen] = useState<boolean>(false);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [activeChallenge, setActiveChallenge] = useState<UgcGameRoom | null>(null);
  const [victoryRoom, setVictoryRoom] = useState<{ room: UgcGameRoom; prizeWon: number } | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    setRooms(getUgcRooms());
    setBalance(getUserVault(userId).balance);
    setTotalBurned(getTotalNomBurned());

    // Listen for gameplay victory events from Phaser
    const handleChallengeVictory = (e: Event) => {
      const customEvent = e as CustomEvent<{ roomId: string; score: number }>;
      if (!customEvent.detail) return;

      const currentRooms = getUgcRooms();
      const room = currentRooms.find((r) => r.id === customEvent.detail.roomId);
      if (room) {
        const prize = room.prizePool;
        awardChallengePrize(userId, room.id, room.title, prize);
        recordRoomWinEvent(room.id, prize);

        setBalance(getUserVault(userId).balance);
        setRooms(getUgcRooms());
        setVictoryRoom({ room, prizeWon: prize });
        setActiveChallenge(null);

        sounds.playGoldenChime();
        confetti({
          particleCount: 100,
          spread: 90,
          origin: { y: 0.4 },
          colors: ["#14F195", "#9945FF", "#F59E0B"],
        });
      }
    };

    window.addEventListener("NOM_CHALLENGE_VICTORY", handleChallengeVictory);
    return () => window.removeEventListener("NOM_CHALLENGE_VICTORY", handleChallengeVictory);
  }, [userId]);

  const handleEnterRoom = (room: UgcGameRoom) => {
    setStatusMessage(null);

    // Deduct entry fee: 90% prize pool, 9% creator royalty, 1% auto-burn
    const res = deductRoomEntryFee(userId, room.id, room.entryFee, room.creatorId);

    if (!res.success) {
      setStatusMessage({ text: res.error || "Failed to enter room.", type: "error" });
      setIsVaultOpen(true);
      return;
    }

    // Record room stats
    recordRoomPlayEvent(room.id, res.burnedShare, res.prizeShare);

    // Update state
    setBalance(getUserVault(userId).balance);
    setTotalBurned(getTotalNomBurned());
    setRooms(getUgcRooms());
    setActiveChallenge(room);

    sounds.playPowerUpCollect();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#14F195", "#38BDF8"],
    });

    setStatusMessage({
      text: `Entered "${room.title}"! -${room.entryFee.toLocaleString()} $NOM (${res.burnedShare} burned 🔥). Go munch candies!`,
      type: "success",
    });

    // Dispatch global event for Phaser GameContainer
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("NOM_START_CHALLENGE", {
          detail: {
            roomId: room.id,
            roomTitle: room.title,
            targetScore: room.targetScore,
            timeLimitSeconds: room.timeLimitSeconds,
            prizePool: room.prizePool,
          },
        })
      );
    }

    if (onStartChallenge) {
      onStartChallenge(room);
    }

    // Scroll smoothly up to the arcade screen
    const arcadeElem = document.getElementById("arcade-cabinet");
    if (arcadeElem) {
      arcadeElem.scrollIntoView({ behavior: "smooth" });
    }
  };

  const filteredRooms = rooms.filter((r) => {
    if (selectedFilter === "micro" && r.entryFee > 500) return false;
    if (selectedFilter === "high" && r.prizePool < 10000) return false;
    if (selectedFilter === "candy" && r.gameMode !== "candy_rush") return false;
    if (selectedFilter === "boss" && r.gameMode !== "boss_attack") return false;
    if (searchQuery.trim() && !r.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-5 font-mono">
      {/* Top Arcade Bank & Live Deflationary Stats Strip */}
      <div className="p-4 rounded-3xl bg-slate-950/80 border border-emerald-500/30 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left: Player $NOM Vault Balance */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Your Arcade Vault</div>
            <div className="text-xl sm:text-2xl font-black text-white flex items-baseline gap-1.5">
              <span>{balance.toLocaleString()}</span>
              <span className="text-emerald-400 text-sm">$NOM</span>
            </div>
          </div>
        </div>

        {/* Center: Total $NOM Burned Counter */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-rose-950/20 border border-rose-500/30 self-start md:self-auto">
          <Flame className="w-4 h-4 text-rose-400 animate-pulse shrink-0" />
          <div className="text-xs">
            <span className="text-slate-400">Burned: </span>
            <strong className="text-rose-400 font-black">{totalBurned.toLocaleString()} $NOM</strong>
            <span className="text-[10px] text-slate-500 hidden sm:inline"> (1% Sink)</span>
          </div>
        </div>

        {/* Right: Quick Bank & Create Room Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsVaultOpen(true)}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            <span>Bank &amp; Deposit</span>
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-slate-950" />
            <span>+ Create Room</span>
          </button>
        </div>
      </div>

      {/* Active Challenge Notification Banner */}
      {activeChallenge && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/40 border-2 border-emerald-400/80 shadow-[0_0_25px_rgba(20,241,149,0.3)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2.5">
            <Zap className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[10px] text-emerald-400 font-bold uppercase">LIVE ACTIVE CHALLENGE</div>
              <div className="text-sm font-black text-white">{activeChallenge.title}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-300">Target: <strong className="text-emerald-400">{activeChallenge.targetScore} pts</strong></span>
            <span className="text-slate-300">Prize Bounty: <strong className="text-candy-gold">~{activeChallenge.prizePool.toLocaleString()} $NOM</strong></span>
          </div>
        </div>
      )}

      {/* Notifications */}
      {statusMessage && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/40 text-rose-300"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {[
            { id: "all", label: "All Rooms" },
            { id: "micro", label: "Micro (≤500)" },
            { id: "high", label: "High Pot (>10k)" },
            { id: "candy", label: "Candy Rush" },
            { id: "boss", label: "Boss Attack" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                selectedFilter === f.id
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search community rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
          />
        </div>
      </div>

      {/* Community Challenge Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRooms.map((room) => {
          const isFeatured = room.featured;
          return (
            <div
              key={room.id}
              className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                isFeatured
                  ? "bg-slate-950 border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.15)] hover:border-amber-400/70"
                  : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                {/* Header Tag */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    <span>{room.gameMode.replace("_", " ")}</span>
                  </span>

                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <span>Creator: </span>
                    <strong className="text-white">{room.creatorName}</strong>
                  </div>
                </div>

                {/* Title & Description */}
                <h4 className="text-base font-bold text-white mb-1.5">{room.title}</h4>
                <p className="text-xs text-slate-300 font-sans leading-relaxed mb-4">
                  {room.description}
                </p>

                {/* Challenge Target Pills */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Target to Beat:</span>
                    <strong className="text-emerald-400 text-sm font-black">{room.targetScore} Candies</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Time Limit:</span>
                    <strong className="text-amber-300 text-sm font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {room.timeLimitSeconds}s
                    </strong>
                  </div>
                </div>
              </div>

              {/* Bottom Strip: Entry Fee & Action */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Prize Bounty:</div>
                  <div className="text-base font-black text-candy-gold">
                    ~{room.prizePool.toLocaleString()} <span className="text-xs text-amber-400">$NOM</span>
                  </div>
                </div>

                <button
                  onClick={() => handleEnterRoom(room)}
                  className="px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-solana-green text-slate-950 shadow-[0_0_15px_rgba(20,241,149,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>PLAY (-{room.entryFee.toLocaleString()} $NOM)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Challenge Victory Modal */}
      {victoryRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-950 border-2 border-emerald-400 shadow-2xl text-center space-y-4 font-mono">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 mx-auto flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20 animate-bounce">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest">
                CHALLENGE COMPLETED!
              </div>
              <h3 className="text-xl font-black text-white mt-1">
                You Beat the Room Target!
              </h3>
              <p className="text-xs text-slate-300 mt-1 font-sans">
                Room: &ldquo;{victoryRoom.room.title}&rdquo;
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-emerald-950/40 border border-emerald-500/40">
              <div className="text-xs text-slate-400">Total Bounty Awarded:</div>
              <div className="text-3xl font-black text-emerald-400 mt-0.5">
                +{victoryRoom.prizeWon.toLocaleString()} $NOM
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Credited directly to your In-Game Arcade Bank!
              </div>
            </div>

            <button
              onClick={() => setVictoryRoom(null)}
              className="w-full py-3 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 hover:scale-105 transition-all cursor-pointer shadow-lg"
            >
              Collect Rewards &amp; Continue
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ArcadeVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        onBalanceUpdated={(newBal) => setBalance(newBal)}
      />

      <CreateRoomModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onRoomCreated={(newRoom) => {
          setRooms(getUgcRooms());
          setStatusMessage({
            text: `Room "${newRoom.title}" published! You will earn a 9% royalty whenever someone plays.`,
            type: "success",
          });
        }}
      />
    </div>
  );
};
