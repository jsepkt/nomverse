// NomVerse In-Game $NOM Arcade Vault & Deflationary Burn Ledger

export interface VaultTransaction {
  id: string;
  type: "deposit" | "withdraw" | "entry_fee" | "prize_won" | "creator_royalty" | "burn";
  amount: number;
  timestamp: number;
  description: string;
  txHash?: string;
}

export interface UserVaultState {
  balance: number;
  totalWon: number;
  totalSpent: number;
  totalCreatorEarnings: number;
  transactions: VaultTransaction[];
}

const VAULT_STORAGE_PREFIX = "nomverse_vault_";
const GLOBAL_BURN_KEY = "nomverse_global_nom_burned";
const INITIAL_DEMO_CREDIT = 10000; // Free 10k $NOM credit for players to test the Game Room immediately

// Fee Split Configuration: Lowest Burn Fee Model
export const BURN_FEE_PERCENT = 1; // 1% lowest burn fee
export const CREATOR_ROYALTY_PERCENT = 9; // 9% creator royalty
export const PRIZE_POOL_PERCENT = 90; // 90% added to challenge prize pool

export function getUserVault(userId: string): UserVaultState {
  if (typeof window === "undefined") {
    return {
      balance: INITIAL_DEMO_CREDIT,
      totalWon: 0,
      totalSpent: 0,
      totalCreatorEarnings: 0,
      transactions: [],
    };
  }

  const key = `${VAULT_STORAGE_PREFIX}${userId || "guest"}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }

  // Initialize with initial demo testing credit
  const initial: UserVaultState = {
    balance: INITIAL_DEMO_CREDIT,
    totalWon: 0,
    totalSpent: 0,
    totalCreatorEarnings: 0,
    transactions: [
      {
        id: `tx_${Date.now()}`,
        type: "deposit",
        amount: INITIAL_DEMO_CREDIT,
        timestamp: Date.now(),
        description: "Welcome Arcade Grant (Instant Testing Credits)",
      },
    ],
  };

  saveUserVault(userId, initial);
  return initial;
}

export function saveUserVault(userId: string, state: UserVaultState) {
  if (typeof window === "undefined") return;
  const key = `${VAULT_STORAGE_PREFIX}${userId || "guest"}`;
  try {
    localStorage.setItem(key, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("NOM_VAULT_UPDATE", { detail: { userId, balance: state.balance } }));
  } catch {
    // ignore
  }
}

export function getTotalNomBurned(): number {
  if (typeof window === "undefined") return 42850;
  try {
    const raw = localStorage.getItem(GLOBAL_BURN_KEY);
    if (raw) {
      return parseInt(raw, 10) || 42850;
    }
  } catch {
    // ignore
  }
  return 42850; // Genesis burn baseline
}

export function recordGlobalBurn(amount: number): number {
  const current = getTotalNomBurned();
  const updated = current + amount;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(GLOBAL_BURN_KEY, updated.toString());
      window.dispatchEvent(new CustomEvent("NOM_BURN_UPDATE", { detail: { totalBurned: updated } }));
    } catch {
      // ignore
    }
  }
  return updated;
}

// Deposit $NOM into Arcade Vault
export function depositToVault(
  userId: string,
  amount: number,
  txHash?: string
): { success: boolean; newBalance: number } {
  if (amount <= 0) return { success: false, newBalance: 0 };

  const state = getUserVault(userId);
  state.balance += amount;
  state.transactions.unshift({
    id: `dep_${Date.now()}`,
    type: "deposit",
    amount,
    timestamp: Date.now(),
    description: `Deposited ${amount.toLocaleString()} $NOM into Arcade Vault`,
    txHash: txHash || `sol_${Math.random().toString(36).substring(2, 10)}`,
  });

  saveUserVault(userId, state);
  return { success: true, newBalance: state.balance };
}

// Withdraw $NOM from Arcade Vault to connected Solana wallet
export function withdrawFromVault(
  userId: string,
  amount: number,
  walletAddress: string
): { success: boolean; newBalance: number; burnedAmount: number; error?: string } {
  const state = getUserVault(userId);

  if (amount <= 0 || amount > state.balance) {
    return { success: false, newBalance: state.balance, burnedAmount: 0, error: "Insufficient vault balance." };
  }

  // Apply lowest 1% withdrawal burn fee
  const burnedAmount = Math.max(1, Math.round(amount * (BURN_FEE_PERCENT / 100)));
  const netWithdraw = amount - burnedAmount;

  state.balance -= amount;
  recordGlobalBurn(burnedAmount);

  state.transactions.unshift({
    id: `wth_${Date.now()}`,
    type: "withdraw",
    amount: netWithdraw,
    timestamp: Date.now(),
    description: `Withdrew ${netWithdraw.toLocaleString()} $NOM to ${walletAddress.substring(0, 4)}...${walletAddress.slice(-4)} (${burnedAmount.toLocaleString()} burned)`,
    txHash: `burn_wth_${Math.random().toString(36).substring(2, 10)}`,
  });

  saveUserVault(userId, state);
  return { success: true, newBalance: state.balance, burnedAmount };
}

// Deduct Entry Fee when joining a community game room
export function deductRoomEntryFee(
  userId: string,
  roomId: string,
  entryFee: number,
  creatorId: string
): {
  success: boolean;
  prizeShare: number;
  creatorShare: number;
  burnedShare: number;
  error?: string;
} {
  const playerState = getUserVault(userId);

  if (playerState.balance < entryFee) {
    return {
      success: false,
      prizeShare: 0,
      creatorShare: 0,
      burnedShare: 0,
      error: `Insufficient $NOM balance. You need ${entryFee.toLocaleString()} $NOM to enter this room.`,
    };
  }

  // 1% burn fee, 9% creator royalty, 90% prize pool
  const burnedShare = Math.max(1, Math.round(entryFee * (BURN_FEE_PERCENT / 100)));
  const creatorShare = Math.round(entryFee * (CREATOR_ROYALTY_PERCENT / 100));
  const prizeShare = entryFee - burnedShare - creatorShare;

  playerState.balance -= entryFee;
  playerState.totalSpent += entryFee;
  playerState.transactions.unshift({
    id: `play_${Date.now()}`,
    type: "entry_fee",
    amount: entryFee,
    timestamp: Date.now(),
    description: `Room Entry Fee: ${entryFee.toLocaleString()} $NOM (${burnedShare} burned 🔥)`,
  });
  saveUserVault(userId, playerState);

  // Credit creator royalty
  if (creatorId && creatorId !== userId) {
    const creatorState = getUserVault(creatorId);
    creatorState.balance += creatorShare;
    creatorState.totalCreatorEarnings += creatorShare;
    creatorState.transactions.unshift({
      id: `royalty_${Date.now()}`,
      type: "creator_royalty",
      amount: creatorShare,
      timestamp: Date.now(),
      description: `Creator Royalty from Room #${roomId.substring(0, 6)}: +${creatorShare.toLocaleString()} $NOM`,
    });
    saveUserVault(creatorId, creatorState);
  }

  // Record permanent global burn
  recordGlobalBurn(burnedShare);

  return {
    success: true,
    prizeShare,
    creatorShare,
    burnedShare,
  };
}

// Award Prize when player successfully completes a challenge
export function awardChallengePrize(
  userId: string,
  roomId: string,
  roomTitle: string,
  prizeAmount: number
): { success: boolean; newBalance: number } {
  const state = getUserVault(userId);
  state.balance += prizeAmount;
  state.totalWon += prizeAmount;

  state.transactions.unshift({
    id: `win_${Date.now()}`,
    type: "prize_won",
    amount: prizeAmount,
    timestamp: Date.now(),
    description: `🏆 Challenge Victory: "${roomTitle}"! Won ${prizeAmount.toLocaleString()} $NOM`,
  });

  saveUserVault(userId, state);
  return { success: true, newBalance: state.balance };
}
