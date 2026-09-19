import { NextRequest, NextResponse } from "next/server";
import { TOKEN_CONFIG } from "@/config/token";
import { getTierForBalance } from "@/lib/holderTiers";

export const dynamic = "force-dynamic";

const TOKEN_2022_PROGRAM_ID = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
const TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const SOLANA_RPC = "https://api.mainnet-beta.solana.com";

async function queryTokensByProgram(wallet: string, programId: string): Promise<number> {
  try {
    const res = await fetch(SOLANA_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getTokenAccountsByOwner",
        params: [
          wallet,
          { programId },
          { encoding: "jsonParsed" },
        ],
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return 0;

    const data = await res.json();
    let balance = 0;

    if (Array.isArray(data?.result?.value)) {
      for (const account of data.result.value) {
        const info = account?.account?.data?.parsed?.info;
        if (info?.mint === TOKEN_CONFIG.mintAddress) {
          const amt = parseFloat(info?.tokenAmount?.uiAmountString || "0");
          if (!isNaN(amt)) {
            balance += amt;
          }
        }
      }
    }
    return balance;
  } catch {
    return 0;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get("wallet")?.trim();

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: "Missing wallet address" },
        { status: 400 }
      );
    }

    // First query Token-2022 (canonical program for $NOM on pump.fun)
    let tokenBalance = await queryTokensByProgram(wallet, TOKEN_2022_PROGRAM_ID);

    // If 0, fallback query standard SPL Token program
    if (tokenBalance === 0) {
      tokenBalance = await queryTokensByProgram(wallet, TOKEN_PROGRAM_ID);
    }

    const perks = getTierForBalance(tokenBalance);

    return NextResponse.json({
      success: true,
      wallet,
      balance: tokenBalance,
      tier: perks.tier,
      tierName: perks.label,
      perks,
      isHolder: tokenBalance > 0,
      verifiedAt: Date.now(),
    });
  } catch (error: any) {
    console.error("Holder balance verification error:", error);
    return NextResponse.json({
      success: false,
      error: error?.message || "Failed to fetch on-chain holder balance",
      balance: 0,
      tier: "fish",
    });
  }
}
