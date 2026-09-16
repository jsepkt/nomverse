import React from "react";
import { AuthProviderType } from "@/context/AuthContext";
import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

interface UserBadgeProps {
  provider: AuthProviderType;
  className?: string;
  showText?: boolean;
}

export const UserBadge: React.FC<UserBadgeProps> = ({
  provider,
  className = "",
  showText = true,
}) => {
  switch (provider) {
    case "phantom":
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-purple-500/10 text-purple-300 border border-purple-500/30 ${className}`}
          title="Verified Phantom Solana Wallet"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          {showText && <span>Phantom Verified</span>}
        </span>
      );
    case "metamask":
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30 ${className}`}
          title="Verified MetaMask EVM Wallet"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          {showText && <span>MetaMask Verified</span>}
        </span>
      );
    case "google":
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-blue-500/10 text-blue-300 border border-blue-500/30 ${className}`}
          title="Verified Google Account"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          {showText && <span>Google Verified</span>}
        </span>
      );
    default:
      return null;
  }
};
