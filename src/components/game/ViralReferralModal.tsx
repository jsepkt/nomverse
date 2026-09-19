"use client";

import React, { useState } from "react";
import { Portal } from "../ui/Portal";
import {
  getReferralData,
  getViralShareUrls,
  ReferralData,
} from "@/lib/referralSystem";
import { copyToClipboard } from "@/lib/clipboard";
import { sounds } from "../audio/soundEffects";
import confetti from "canvas-confetti";
import {
  Users,
  Copy,
  Check,
  Sparkles,
  Share2,
  Heart,
  Coins,
  ExternalLink,
  X,
  MessageCircle,
} from "lucide-react";
import { TwitterXIcon } from "../ui/icons";
import { TOKEN_CONFIG } from "@/config/token";

interface ViralReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  userHighScore?: number;
}

export const ViralReferralModal: React.FC<ViralReferralModalProps> = ({
  isOpen,
  onClose,
  userHighScore = 0,
}) => {
  const [data, setData] = useState<ReferralData>(() => getReferralData());
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const shareUrls = getViralShareUrls(data.myRefCode, userHighScore);

  const handleCopyLink = async () => {
    await copyToClipboard(shareUrls.inviteUrl);
    setCopied(true);
    sounds.playGoldenChime();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#14F195", "#9945FF", "#F59E0B"],
    });
    setTimeout(() => setCopied(false), 2200);
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "NomVerse Arcade Challenge",
          text: shareUrls.shareText,
          url: shareUrls.inviteUrl,
        });
      } catch {
        // user cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-emerald-500/40 shadow-[0_0_60px_rgba(20,241,149,0.2)] p-5 sm:p-7 overflow-hidden text-center text-white">
          {/* Background Ambient Glows */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-solana-purple/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="space-y-1.5 mb-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Users className="w-3.5 h-3.5" />
              <span>VIRAL SQUAD BEACON</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Invite Friends & Earn Yield
            </h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Share your link: Friends get <strong>+3 Free Lives</strong>. You get <strong>10% Candy Commission</strong> on every game they play!
            </p>
          </div>

          {/* Referral Stats Cards */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-left">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Total Recruits</div>
              <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
                {data.totalInvites} <span className="text-xs text-slate-500 font-normal">friends</span>
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-left">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Candy Royalties</div>
              <div className="text-2xl font-black font-mono text-amber-400 mt-0.5">
                +{data.candiesEarned} <span className="text-xs text-slate-500 font-normal">candies</span>
              </div>
            </div>
          </div>

          {/* Unique Link Input Box */}
          <div className="space-y-2 mb-5">
            <div className="text-left text-xs font-mono text-slate-300 font-bold flex items-center justify-between">
              <span>Your Personal Invite Link:</span>
              <span className="text-emerald-400 font-normal text-[11px]">Code: {data.myRefCode}</span>
            </div>
            <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-left">
              <div className="text-xs font-mono text-slate-300 truncate pl-2 select-all">
                {shareUrls.inviteUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shrink-0 active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(20,241,149,0.3)]"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Viral Social Share Buttons */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <a
              href={shareUrls.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-sky-400" />
              <span>Telegram</span>
            </a>

            <a
              href={shareUrls.twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <TwitterXIcon className="w-4 h-4 text-slate-300" />
              <span>X / Twitter</span>
            </a>

            <a
              href={shareUrls.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Native Mobile Share Button */}
          <button
            onClick={handleNativeShare}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-300 to-solana-green text-slate-950 font-black font-mono text-xs sm:text-sm shadow-[0_0_25px_rgba(20,241,149,0.3)] hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>SHARE CHALLENGE ON MOBILE</span>
          </button>
        </div>
      </div>
    </Portal>
  );
};
