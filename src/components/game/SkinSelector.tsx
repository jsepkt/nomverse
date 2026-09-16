"use client";

import React from "react";
import { SkinId, SKINS_CATALOG, getEquippedSkin, setEquippedSkin } from "@/lib/skins";
import { useAuth } from "@/context/AuthContext";
import { X, Lock, CheckCircle2, Sparkles, Shirt } from "lucide-react";

interface SkinSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  equippedSkin: SkinId;
  onEquip: (skin: SkinId) => void;
  highScore: number;
  maxStreak: number;
  karma: number;
}

export const SkinSelector: React.FC<SkinSelectorProps> = ({
  isOpen,
  onClose,
  equippedSkin,
  onEquip,
  highScore,
  maxStreak,
  karma,
}) => {
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleSelect = (skinId: SkinId, unlocked: boolean) => {
    if (!unlocked) return;
    if (user) {
      setEquippedSkin(user.id, skinId);
    }
    onEquip(skinId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-surface border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-solana-purple/10 border border-solana-purple/30 flex items-center justify-center text-solana-purple">
            <Shirt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Nomster CC0 Closet</h3>
            <p className="text-xs text-slate-400">Unlock cosmetics by playing &amp; gifting lives!</p>
          </div>
        </div>

        {/* Skins Grid */}
        <div className="space-y-2.5">
          {SKINS_CATALOG.map((skin) => {
            const unlocked = skin.isUnlocked({ highScore, maxStreak, karma });
            const isEquipped = equippedSkin === skin.id;

            return (
              <div
                key={skin.id}
                onClick={() => handleSelect(skin.id, unlocked)}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  isEquipped
                    ? "bg-emerald-500/15 border-emerald-500/60 shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                    : unlocked
                    ? "bg-slate-900/80 border-slate-800 hover:border-slate-700 cursor-pointer"
                    : "bg-slate-950/60 border-slate-900 opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{skin.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-white">{skin.name}</span>
                      {isEquipped && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          EQUIPPED
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">{skin.description}</p>
                    {!unlocked && (
                      <div className="text-[10px] font-mono text-amber-400 flex items-center gap-1 mt-0.5">
                        <Lock className="w-3 h-3" />
                        <span>Requires: {skin.requirement}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  {unlocked ? (
                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        isEquipped
                          ? "bg-emerald-500 text-slate-950"
                          : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                      }`}
                    >
                      {isEquipped ? "Active" : "Equip"}
                    </button>
                  ) : (
                    <Lock className="w-4 h-4 text-slate-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 text-center text-[11px] font-mono text-slate-500">
          All cosmetics are 100% CC0 public domain vectors.
        </div>
      </div>
    </div>
  );
};
