"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type AuthProviderType = "phantom" | "metamask" | "google";

export interface AuthUser {
  id: string;
  name: string;
  addressOrEmail: string;
  provider: AuthProviderType;
  avatar: string;
  verifiedAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginWithPhantom: () => Promise<boolean>;
  loginWithMetaMask: () => Promise<boolean>;
  loginWithGoogle: (email: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "nomverse_auth_session";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Restore saved session on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      // Check for native window.solana (Phantom)
      const solana = (window as unknown as { solana?: { isPhantom?: boolean; connect: () => Promise<{ publicKey: { toString: () => string } }> } }).solana;

      let pubkey = "";
      if (solana && solana.isPhantom) {
        const resp = await solana.connect();
        pubkey = resp.publicKey.toString();
      } else {
        // Fallback demo/sandbox address for testing on desktop without Phantom installed
        const demoSolanaWallets = [
          "7XwF8q9XoX6x2N7YyQ5hV6k8B9v2Z1a3M4c5D6e7F8g9",
          "9YzA1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8S9t0U",
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
      return true;
    } catch (err) {
      console.error("Phantom authentication failed:", err);
      return false;
    }
  };

  // 2. MetaMask Wallet Authentication
  const loginWithMetaMask = async (): Promise<boolean> => {
    try {
      const ethereum = (window as unknown as { ethereum?: { request: (args: { method: string }) => Promise<string[]> } }).ethereum;

      let address = "";
      if (ethereum) {
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        if (accounts && accounts.length > 0) {
          address = accounts[0];
        }
      }

      if (!address) {
        // Fallback demo EVM address
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

  // 3. Google Account Authentication
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

  const logout = () => {
    setUser(null);
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
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        loginWithPhantom,
        loginWithMetaMask,
        loginWithGoogle,
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
