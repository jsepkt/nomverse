// NomVerse Viral Referral & Peer-to-Peer Growth Engine
// Generates unpermissioned referral codes, tracks friend invites, and calculates candy commissions

export interface ReferralData {
  myRefCode: string;
  referredBy: string | null;
  totalInvites: number;
  candiesEarned: number;
  unlockedRecruitSkin: boolean;
  invitedFriends: { handle: string; joinedAt: number; candiesEarned: number }[];
}

const REFERRAL_STORAGE_KEY = "nomverse_referral_data_v1";

function generateRandomRefCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "NOM-";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function getReferralData(preferredHandle?: string): ReferralData {
  if (typeof window === "undefined") {
    return {
      myRefCode: "NOM-ARCADE",
      referredBy: null,
      totalInvites: 0,
      candiesEarned: 0,
      unlockedRecruitSkin: false,
      invitedFriends: [],
    };
  }

  try {
    const raw = localStorage.getItem(REFERRAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.myRefCode) return parsed;
    }
  } catch {
    // fallback
  }

  // Create initial referral data
  const code = preferredHandle
    ? `NOM-${preferredHandle.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 8)}`
    : generateRandomRefCode();

  const initialData: ReferralData = {
    myRefCode: code,
    referredBy: null,
    totalInvites: 0,
    candiesEarned: 0,
    unlockedRecruitSkin: false,
    invitedFriends: [],
  };

  saveReferralData(initialData);
  return initialData;
}

export function saveReferralData(data: ReferralData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

// Process incoming ref param from URL
export function processIncomingReferral(refParam: string): { isNewReferee: boolean; referrerCode: string } {
  if (typeof window === "undefined" || !refParam) {
    return { isNewReferee: false, referrerCode: "" };
  }

  const cleanRef = refParam.trim();
  const current = getReferralData();

  // Don't refer yourself
  if (current.myRefCode === cleanRef) {
    return { isNewReferee: false, referrerCode: cleanRef };
  }

  // Already referred by someone
  if (current.referredBy) {
    return { isNewReferee: false, referrerCode: current.referredBy };
  }

  // Register the referrer!
  current.referredBy = cleanRef;
  current.unlockedRecruitSkin = true;
  saveReferralData(current);

  return { isNewReferee: true, referrerCode: cleanRef };
}

// Record candy eaten by a player to calculate friend commission
export function recordFriendPlayCommission(candiesEaten: number): number {
  const current = getReferralData();
  const commission = Math.floor(candiesEaten * 0.1); // 10% bonus
  if (commission > 0) {
    current.candiesEarned += commission;
    saveReferralData(current);
  }
  return commission;
}

// Generate viral share URLs
export function getViralShareUrls(refCode: string, highScore: number = 0) {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://nomverse.fun";
  const inviteUrl = `${origin}/?ref=${encodeURIComponent(refCode)}`;
  
  const shareText = highScore > 0
    ? `🎮 I just scored ${highScore.toLocaleString()} on NomVerse Arcade! Can you beat me? Play free in your browser and claim +3 Free Lives: ${inviteUrl} $NOM #Solana`
    : `🍬 Play NomVerse: The open-source Solana arcade game! Zero install, claim +3 Free Lives & battle the World Raid Boss with me: ${inviteUrl} $NOM #Solana`;

  return {
    inviteUrl,
    shareText,
    twitterUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
    telegramUrl: `https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent(shareText)}`,
    whatsappUrl: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`,
  };
}
