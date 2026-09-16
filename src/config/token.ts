// NomVerse Immutable pump.fun Token Configuration
// Once the canonical mint address is updated after launch on pump.fun,
// this configuration is immutably frozen. Pull requests altering this address are rejected.

export const PUMP_TOKEN_MINT = "PENDING_PUMP_FUN_LAUNCH"; // Replace with your pump.fun mint address once launched

export interface TokenConfig {
  readonly mintAddress: string;
  readonly name: string;
  readonly symbol: string;
  readonly decimals: number;
  readonly totalSupply: number;
  readonly pumpFunUrl: string;
  readonly isLocked: boolean;
}

export const TOKEN_CONFIG: TokenConfig = Object.freeze({
  mintAddress: PUMP_TOKEN_MINT,
  name: "NomVerse",
  symbol: "NOM",
  decimals: 6,
  totalSupply: 1_000_000_000, // 1 Billion standard pump.fun supply
  pumpFunUrl:
    PUMP_TOKEN_MINT === "PENDING_PUMP_FUN_LAUNCH"
      ? "https://pump.fun"
      : `https://pump.fun/${PUMP_TOKEN_MINT}`,
  isLocked: PUMP_TOKEN_MINT !== "PENDING_PUMP_FUN_LAUNCH",
});
