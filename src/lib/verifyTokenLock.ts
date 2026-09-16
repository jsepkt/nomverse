import { TOKEN_CONFIG } from "@/config/token";

// Build-time and runtime integrity validation for the canonical token mint
export function verifyTokenLock(): { isValid: boolean; message: string } {
  if (!TOKEN_CONFIG.mintAddress) {
    return { isValid: false, message: "Token mint address cannot be empty." };
  }

  // If token is locked, enforce read-only immutability
  if (TOKEN_CONFIG.isLocked) {
    if (!Object.isFrozen(TOKEN_CONFIG)) {
      throw new Error("SECURITY_ALERT: TOKEN_CONFIG must remain frozen with Object.freeze().");
    }
  }

  return { isValid: true, message: "Token configuration integrity verified." };
}
