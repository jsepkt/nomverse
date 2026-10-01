import { NextRequest, NextResponse } from "next/server";
import { TOKEN_CONFIG } from "@/config/token";
import { getTierForBalance } from "@/lib/holderTiers";

export const dynamic = "force-dynamic";

const TOKEN_2022_PROGRAM_ID = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
const TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

const RPC_ENDPOINTS = [
  "https://rpc.ankr.com/solana",
  "https://solana-rpc.publicnode.com",
  "https://api.mainnet-beta.solana.com",
];

async function callRpcWithFallback(body: any): Promise<any> {
  for (const endpoint of RPC_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const json = await res.json();
        if (json && !json.error) {
          return json;
        }
      }
    } catch {
      // Try next fallback endpoint
    }
  }
  return null;
}

async function queryTokensByProgram(wallet: string, programId: string): Promise<number> {
  try {
    const data = await callRpcWithFallback({
      jsonrpc: "2.0",
      id: 1,
      method: "getTokenAccountsByOwner",
      params: [
        wallet,
        { programId },
        { encoding: "jsonParsed" },
      ],
    });

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

async function querySolBalance(wallet: string): Promise<number> {
  try {
    const data = await callRpcWithFallback({
      jsonrpc: "2.0",
      id: 2,
      method: "getBalance",
      params: [wallet],
    });
    const lamports = data?.result?.value;
    if (typeof lamports === "number") {
      return parseFloat((lamports / 1e9).toFixed(4));
    }
    return 0;
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

    // Parallel fetch: Token-2022 balance and native SOL balance
    const [token2022Balance, solBalance] = await Promise.all([
      queryTokensByProgram(wallet, TOKEN_2022_PROGRAM_ID),
      querySolBalance(wallet),
    ]);

    let tokenBalance = token2022Balance;
    // Fallback: check standard SPL token program if 0
    if (tokenBalance === 0) {
      tokenBalance = await queryTokensByProgram(wallet, TOKEN_PROGRAM_ID);
    }

    const perks = getTierForBalance(tokenBalance);

    return NextResponse.json({
      success: true,
      wallet,
      balance: tokenBalance,
      solBalance,
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
      solBalance: 0,
      tier: "fish",
    });
  }
}
