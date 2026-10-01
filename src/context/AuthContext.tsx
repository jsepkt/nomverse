"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type AuthProviderType = "phantom" | "solflare" | "backpack" | "metamask" | "google";

export interface AuthUser {
  id: string;
  name: string;
  addressOrEmail: string;
  provider: AuthProviderType;
  avatar: string;
  verifiedAt: string;
  realNomBalance?: number;
  solBalance?: number;
  tier?: string;
  tierName?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isVerifyingBalance: boolean;
  realNomBalance: number;
  solBalance: number;
  tier: string;
  tierName: string;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginWithPhantom: () => Promise<boolean>;
  loginWithSolflare: () => Promise<boolean>;
  loginWithBackpack: () => Promise<boolean>;
  loginWithMetaMask: () => Promise<boolean>;
  loginWithGoogle: (email: string, name: string) => Promise<boolean>;
  refreshBalance: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "nomverse_auth_session";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isVerifyingBalance, setIsVerifyingBalance] = useState<boolean>(false);
  const [realNomBalance, setRealNomBalance] = useState<number>(0);
  const [solBalance, setSolBalance] = useState<number>(0);
  const [tier, setTier] = useState<string>("fish");
  const [tierName, setTierName] = useState<string>("Nomster Fish");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Helper to fetch live on-chain token and SOL balance
  const fetchHolderData = useCallback(async (walletAddress: string) => {
    if (!walletAddress || walletAddress.startsWith("0x") || walletAddress.includes("@")) return;
    setIsVerifyingBalance(true);
    try {
      const res = await fetch(`/api/holder-balance?wallet=${encodeURIComponent(walletAddress)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const bal = data.balance || 0;
          const sBal = data.solBalance || 0;
          const t = data.tier || "fish";
          const tN = data.tierName || "Nomster Fish";

          setRealNomBalance(bal);
          setSolBalance(sBal);
          setTier(t);
          setTierName(tN);

          setUser((prev) => {
            if (!prev) return null;
            const updated = {
              ...prev,
              realNomBalance: bal,
              solBalance: sBal,
              tier: t,
              tierName: tN,
            };
            try {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
            } catch {
              // Ignore
            }
            return updated;
          });
        }
      }
    } catch (err) {
      console.error("Failed to query on-chain wallet balance:", err);
    } finally {
      setIsVerifyingBalance(false);
    }
  }, []);

  // Restore saved session on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed: AuthUser = JSON.parse(saved);
        setUser(parsed);
        if (parsed.realNomBalance) setRealNomBalance(parsed.realNomBalance);
        if (parsed.solBalance) setSolBalance(parsed.solBalance);
        if (parsed.tier) setTier(parsed.tier);
        if (parsed.tierName) setTierName(parsed.tierName);

        // Re-verify on-chain balance fresh
        if (["phantom", "solflare", "backpack"].includes(parsed.provider)) {
          fetchHolderData(parsed.addressOrEmail);
        }
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  }, [fetchHolderData]);

  const saveUserSession = (newUser: AuthUser) => {
    setUser(newUser);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newUser));
    } catch {
      // Ignore
    }
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  // 1. Phantom Wallet Authentication
  const loginWithPhantom = async (): Promise<boolean> => {
    try {
      const phantomProvider =
        (window as any)?.phantom?.solana ||
        ((window as any)?.solana?.isPhantom ? (window as any).solana : (window as any)?.solana);

      let pubkey = "";
      if (phantomProvider) {
        const resp = await phantomProvider.connect();
        pubkey = resp.publicKey ? resp.publicKey.toString() : "";
      }

      if (!pubkey) {
        // Fallback for demo testing when no extension is present
        const demoSolanaWallets = [
          "7XwF8q9XoX6x2N7YyQ5hV6k8B9v2Z1a3M4c5D6e7F8g9",
          "4NomSter888SolanaNommerCommunityVerified999",
        ];
        pubkey = demoSolanaWallets[Math.floor(Math.random() * demoSolanaWallets.length)];
      }

      const shortAddr = `${pubkey.slice(0, 4)}...${pubkey.slice(-4)}`;
      const newUser: AuthUser = {
        id: `phantom_${pubkey}`,
        name: `${shortAddr}.sol`,
        addressOrEmail: pubkey,
        provider: "phantom",
        avatar: "/mascot.svg",
        verifiedAt: new Date().toISOString(),
      };

      saveUserSession(newUser);
      closeAuthModal();

      // Query live on-chain token & SOL balance
      fetchHolderData(pubkey);
      return true;
    } catch (err) {
      console.error("Phantom authentication failed:", err);
      return false;
    }
  };

  // 2. Solflare Wallet Authentication
  const loginWithSolflare = async (): Promise<boolean> => {
    try {
      const solflareProvider =
        (window as any)?.solflare ||
        ((window as any)?.solana?.isSolflare ? (window as any).solana : null);

      let pubkey = "";
      if (solflareProvider) {
        await solflareProvider.connect();
        pubkey = solflareProvider.publicKey ? solflareProvider.publicKey.toString() : "";
      }

      if (!pubkey) {
        const demoWallets = [
          "SolFLAreNom999DiamondHolderCommunity777",
          "8wFLarENomSterPumpFunTopNommer12345",
        ];
        pubkey = demoWallets[Math.floor(Math.random() * demoWallets.length)];
      }

      const shortAddr = `${pubkey.slice(0, 4)}...${pubkey.slice(-4)}`;
      const newUser: AuthUser = {
        id: `solflare_${pubkey}`,
        name: `${shortAddr}.sol`,
        addressOrEmail: pubkey,
        provider: "solflare",
        avatar: "/mascot.svg",
        verifiedAt: new Date().toISOString(),
      };

      saveUserSession(newUser);
      closeAuthModal();
      fetchHolderData(pubkey);
      return true;
    } catch (err) {
      console.error("Solflare authentication failed:", err);
      return false;
    }
  };

  // 3. Backpack Wallet Authentication
  const loginWithBackpack = async (): Promise<boolean> => {
    try {
      const backpackProvider = (window as any)?.backpack;
      let pubkey = "";
      if (backpackProvider) {
        await backpackProvider.connect();
        pubkey = backpackProvider.publicKey ? backpackProvider.publicKey.toString() : "";
      }

      if (!pubkey) {
        pubkey = "BackPackNomster777WhaleCommunityWallet888";
      }

      const shortAddr = `${pubkey.slice(0, 4)}...${pubkey.slice(-4)}`;
      const newUser: AuthUser = {
        id: `backpack_${pubkey}`,
        name: `${shortAddr}.sol`,
        addressOrEmail: pubkey,
        provider: "backpack",
        avatar: "/mascot.svg",
        verifiedAt: new Date().toISOString(),
      };

      saveUserSession(newUser);
      closeAuthModal();
      fetchHolderData(pubkey);
      return true;
    } catch (err) {
      console.error("Backpack authentication failed:", err);
      return false;
    }
  };

  // 4. MetaMask Wallet Authentication
  const loginWithMetaMask = async (): Promise<boolean> => {
    try {
      const ethereum = (window as any)?.ethereum;
      let address = "";
      if (ethereum) {
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        if (accounts && accounts.length > 0) {
          address = accounts[0];
        }
      }

      if (!address) {
        const demoEvmWallets = [
          "0x71C...b29c",
          "0x3B8...a941",
          "0xNom...c0de",
        ];
        address = demoEvmWallets[Math.floor(Math.random() * demoEvmWallets.length)];
      }

      const shortAddr = address.length > 10 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;
      const newUser: AuthUser = {
        id: `metamask_${address}`,
        name: `${shortAddr}.eth`,
        addressOrEmail: address,
        provider: "metamask",
        avatar: "/mascot.svg",
        verifiedAt: new Date().toISOString(),
      };

      saveUserSession(newUser);
      closeAuthModal();
      return true;
    } catch (err) {
      console.error("MetaMask authentication failed:", err);
      return false;
    }
  };

  // 5. Google Account Authentication
  const loginWithGoogle = async (email: string, name: string): Promise<boolean> => {
    try {
      const safeName = name.trim() || email.split("@")[0] || "Nomster Builder";
      const newUser: AuthUser = {
        id: `google_${email}`,
        name: safeName,
        addressOrEmail: email,
        provider: "google",
        avatar: "/mascot.svg",
        verifiedAt: new Date().toISOString(),
      };

      saveUserSession(newUser);
      closeAuthModal();
      return true;
    } catch (err) {
      console.error("Google authentication failed:", err);
      return false;
    }
  };

  const refreshBalance = async () => {
    if (user && ["phantom", "solflare", "backpack"].includes(user.provider)) {
      await fetchHolderData(user.addressOrEmail);
    }
  };

  const logout = () => {
    setUser(null);
    setRealNomBalance(0);
    setSolBalance(0);
    setTier("fish");
    setTierName("Nomster Fish");
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isVerifyingBalance,
        realNomBalance,
        solBalance,
        tier,
        tierName,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        loginWithPhantom,
        loginWithSolflare,
        loginWithBackpack,
        loginWithMetaMask,
        loginWithGoogle,
        refreshBalance,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
