// NomVerse Immutable pump.fun Token Configuration
// Canonical Mint Address: 8a1iQy5wSP77TPnvPqFou3ubjsAgRMAEPqKjU2jrpump
// This configuration is permanently locked under CC0 open-source rules.
// Any pull request or external modification attempting to alter this address is strictly prohibited and rejected by CI.

export const PUMP_TOKEN_MINT = "8a1iQy5wSP77TPnvPqFou3ubjsAgRMAEPqKjU2jrpump" as const;

export interface TokenConfig {
  readonly mintAddress: string;
  readonly name: string;
  readonly symbol: string;
  readonly decimals: number;
  readonly totalSupply: number;
  readonly pumpFunUrl: string;
  readonly isLocked: boolean;
  readonly lockedTimestamp: string;
}

export const TOKEN_CONFIG: TokenConfig = Object.freeze({
  mintAddress: PUMP_TOKEN_MINT,
  name: "NomVerse",
  symbol: "NOM",
  decimals: 6,
  totalSupply: 1_000_000_000, // 1 Billion standard pump.fun supply
  pumpFunUrl: `https://pump.fun/${PUMP_TOKEN_MINT}`,
  isLocked: true,
  lockedTimestamp: "2026-09-16T17:38:23.000Z",
});
