// NomVerse Content Moderation & Sensitive Content Filter
// Ensures a welcoming, respectful, and family-friendly open-source community environment

// Prohibited terms including NSFW, severe profanity, hate speech, slurs, scams, and toxicity
const PROHIBITED_WORDS = [
  // Profanity & severe toxicity
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "cunt",
  "bastard",
  "nigger",
  "nigga",
  "faggot",
  "retard",
  "kill yourself",
  "kys",
  "die in a fire",
  // NSFW / explicit sexual content
  "porn",
  "nsfw",
  "nude",
  "nudes",
  "naked",
  "sex",
  "blowjob",
  "handjob",
  "boobs",
  "penis",
  "vagina",
  "dildo",
  "onlyfans",
  "xxx",
  "hentai",
  // Scams & phishing
  "drainer",
  "send eth to",
  "send sol to",
  "doubler",
  "free airdrop claim here",
  "claim-gift",
  "wallet-connect-fix",
  "private key",
  "seed phrase",
  "secret phrase",
  "giveaway telegram",
  "t.me/free",
];

// Sensitive content patterns (e.g. suspicious links or scam domains)
const SUSPICIOUS_URL_PATTERNS = [
  /bit\.ly\/[a-zA-Z0-9_-]+/i,
  /tinyurl\.com\/[a-zA-Z0-9_-]+/i,
  /claim-[a-z0-9]+\.(xyz|top|ru|cc)/i,
  /airdrop-[a-z0-9]+\.(xyz|top|ru|cc)/i,
  /t\.me\/(joinchat|[a-zA-Z0-9_]+)/i,
];

export interface ModerationResult {
  isValid: boolean;
  reason?: string;
  flaggedWord?: string;
}

/**
 * Validates post or reply text against NomVerse sensitive content rules.
 */
export function validateContent(text: string): ModerationResult {
  if (!text || text.trim().length === 0) {
    return { isValid: false, reason: "Content cannot be empty." };
  }

  const normalized = text.toLowerCase();

  // 1. Check for prohibited sensitive words & slurs
  for (const word of PROHIBITED_WORDS) {
    // Word boundary check or substring match for phrases
    const isPhrase = word.includes(" ");
    if (isPhrase) {
      if (normalized.includes(word)) {
        return {
          isValid: false,
          reason: "Sensitive or inappropriate phrases are not allowed in NomVerse.",
          flaggedWord: word,
        };
      }
    } else {
      const regex = new RegExp(`\\b${word}\\b`, "i");
      if (regex.test(normalized)) {
        return {
          isValid: false,
          reason: "Sensitive, explicit, or offensive words are not allowed in NomVerse.",
          flaggedWord: word,
        };
      }
    }
  }

  // 2. Check for suspicious phishing or drainer URLs
  for (const pattern of SUSPICIOUS_URL_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isValid: false,
        reason: "Suspicious or unverified external links are blocked to protect community members.",
      };
    }
  }

  return { isValid: true };
}
