"use client";

import React, { useState, useEffect } from "react";
import {
  Palette,
  Flame,
  CheckCircle2,
  Sparkles,
  Lock,
  Unlock,
  Coins,
  Shirt,
  Search,
  Filter,
  PlusCircle,
  AlertCircle,
  Tag,
  ArrowRight,
} from "lucide-react";
import {
  getMemeCharacters,
  getUnlockedCharacterIds,
  unlockMemeCharacter,
  equipMemeCharacter,
  MemeCharacter,
  MINT_LISTING_FEE,
} from "@/lib/memeCharacterStorage";
import { getUserVault } from "@/lib/arcadeVault";
import { useAuth } from "@/context/AuthContext";
import { sounds } from "../audio/soundEffects";
import confetti from "canvas-confetti";

interface MemeCharacterBazaarProps {
  onOpenWorkshop?: () => void;
}

export const MemeCharacterBazaar: React.FC<MemeCharacterBazaarProps> = ({ onOpenWorkshop }) => {
  const { user } = useAuth();
  const userId = user?.id || "guest";
  const userName = user?.name || "Anon Nommer";

  const [characters, setCharacters] = useState<MemeCharacter[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<string[]>(["char_classic_nom"]);
  const [activeSkinId, setActiveSkinId] = useState<string>("char_classic_nom");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "owned" | "free" | "premium">("all");
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const refreshData = () => {
    setCharacters(getMemeCharacters());
    setUnlockedIds(getUnlockedCharacterIds(userId));
  };

  useEffect(() => {
    refreshData();
    window.addEventListener("NOM_MEME_CHARACTERS_UPDATE", refreshData);
    window.addEventListener("NOM_UNLOCKED_CHARACTERS_UPDATE", refreshData);
    return () => {
      window.removeEventListener("NOM_MEME_CHARACTERS_UPDATE", refreshData);
      window.removeEventListener("NOM_UNLOCKED_CHARACTERS_UPDATE", refreshData);
    };
  }, [userId]);

  const handleUnlock = (char: MemeCharacter) => {
    setStatusMessage(null);
    const res = unlockMemeCharacter(userId, userName, char.id);
    if (!res.success) {
      setStatusMessage({ text: res.error || "Unlock failed.", type: "error" });
      sounds.playLifeLost();
      return;
    }

    refreshData();
    sounds.playGoldenChime();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.5 },
      colors: ["#14F195", "#9945FF", "#F59E0B"],
    });

    setStatusMessage({
      text: `🎉 Unlocked "${char.name}"! (${res.burnedAmount} $NOM burned 🔥, creator earned +${res.creatorShare} $NOM)`,
      type: "success",
    });

    // Auto-equip upon unlock
    equipMemeCharacter(char);
    setActiveSkinId(char.id);
  };

  const handleEquip = (char: MemeCharacter) => {
    equipMemeCharacter(char);
    setActiveSkinId(char.id);
    sounds.playNom();
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.6 },
      colors: ["#14F195", "#38BDF8"],
    });
    setStatusMessage({
      text: `Equipped "${char.name}" to game! Ready to munch candies.`,
      type: "success",
    });
  };

  const filteredCharacters = characters.filter((c) => {
    const isOwned = unlockedIds.includes(c.id);
    if (filterType === "owned" && !isOwned) return false;
    if (filterType === "free" && c.priceNom > 0) return false;
    if (filterType === "premium" && c.priceNom <= 0) return false;
    if (searchQuery.trim() && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 font-mono">
      {/* Header Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-950 via-purple-950/30 to-slate-950 border border-purple-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 mb-1.5">
            <Palette className="w-3.5 h-3.5 text-purple-400" />
            <span>COMMUNITY MEME CHARACTER BAZAAR</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Collect, Mint &amp; Equip Meme Characters
          </h3>
          <p className="text-xs text-slate-300 font-sans mt-0.5 max-w-lg leading-relaxed">
            Every meme character unlocked pays a <strong>90% royalty</strong> to its creator and permanently burns <strong>1% of $NOM</strong> from circulation.
          </p>
        </div>

        {onOpenWorkshop && (
          <button
            onClick={onOpenWorkshop}
            className="px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 text-white shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span>Draw &amp; Mint Character</span>
          </button>
        )}
      </div>

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

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {[
            { id: "all", label: "All Characters" },
            { id: "owned", label: "Owned / Unlocked" },
            { id: "free", label: "Free CC0" },
            { id: "premium", label: "Premium $NOM" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as typeof filterType)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border cursor-pointer ${
                filterType === f.id
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-sm"
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
            placeholder="Search meme skins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-400"
          />
        </div>
      </div>

      {/* Character Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCharacters.map((char) => {
          const isOwned = unlockedIds.includes(char.id);
          const isEquipped = activeSkinId === char.id;

          return (
            <div
              key={char.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                isEquipped
                  ? "bg-slate-950 border-emerald-400 shadow-[0_0_20px_rgba(20,241,149,0.2)]"
                  : char.featured
                  ? "bg-slate-950/90 border-purple-500/40 shadow-lg hover:border-purple-400"
                  : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                {/* Character Preview Canvas Box */}
                <div className="relative w-full aspect-square max-h-40 rounded-xl bg-[#030712] border border-slate-800 flex items-center justify-center overflow-hidden mb-3 group">
                  {char.previewDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={char.previewDataUrl}
                      alt={char.name}
                      className="w-28 h-28 object-contain transition-transform group-hover:scale-110 image-rendering-pixelated"
                      style={{ imageRendering: "pixelated" }}
                    />
                  ) : (
                    <div className="text-xs text-slate-500">Pixel Preview</div>
                  )}

                  {isEquipped && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950 shadow-md">
                      ACTIVE
                    </span>
                  )}

                  {char.featured && !isEquipped && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      FEATURED
                    </span>
                  )}
                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-base font-bold text-white truncate">{char.name}</h4>
                  <div className="text-[11px] text-slate-400 shrink-0">
                    By <strong className="text-slate-300">{char.creatorName}</strong>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-sans leading-relaxed mb-3 line-clamp-2">
                  {char.description}
                </p>

                {/* Stats Pill */}
                <div className="flex items-center justify-between text-[11px] p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 mb-3">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Coins className="w-3 h-3 text-amber-400" />
                    <span>Price:</span>
                    <strong className={char.priceNom === 0 ? "text-emerald-400" : "text-amber-300 font-black"}>
                      {char.priceNom === 0 ? "Free CC0" : `${char.priceNom.toLocaleString()} $NOM`}
                    </strong>
                  </div>

                  <div className="text-slate-400">
                    <span>Unlocks: </span>
                    <strong className="text-white">{char.unlocksCount}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                {isOwned ? (
                  <button
                    onClick={() => handleEquip(char)}
                    disabled={isEquipped}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isEquipped
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 cursor-default"
                        : "bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 shadow-md hover:scale-105 active:scale-95"
                    }`}
                  >
                    <Shirt className="w-3.5 h-3.5" />
                    <span>{isEquipped ? "Currently Equipped" : "Equip to Game"}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleUnlock(char)}
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Unlock className="w-3.5 h-3.5 text-slate-950" />
                    <span>Unlock ({char.priceNom.toLocaleString()} $NOM)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
