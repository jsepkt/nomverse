import { NextRequest, NextResponse } from "next/server";
import { TOKEN_CONFIG } from "@/config/token";
import { getTierForBalance } from "@/lib/holderTiers";

export const dynamic = "force-dynamic";

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

    // Free public Solana RPC endpoint
    const rpcEndpoint = "https://api.mainnet-beta.solana.com";

    const body = {
      jsonrpc: "2.0",
      id: 1,
      method: "getTokenAccountsByOwner",
      params: [
        wallet,
        {
          mint: TOKEN_CONFIG.mintAddress,
        },
        {
          encoding: "jsonParsed",
        },
      ],
    };

    const res = await fetch(rpcEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      // Short timeout to avoid blocking
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      throw new Error(`Solana RPC response: ${res.status}`);
    }

    const data = await res.json();
    let tokenBalance = 0;

    if (data?.result?.value && Array.isArray(data.result.value)) {
      for (const account of data.result.value) {
        const amountStr = account?.account?.data?.parsed?.info?.tokenAmount?.uiAmountString;
        const amount = parseFloat(amountStr || "0");
        if (!isNaN(amount)) {
          tokenBalance += amount;
        }
      }
    }

    const perks = getTierForBalance(tokenBalance);

    return NextResponse.json({
      success: true,
      wallet,
      balance: tokenBalance,
      tier: perks.tier,
      perks,
      verifiedAt: Date.now(),
    });
  } catch (error: any) {
    // In case of RPC rate limits or test environments, allow graceful response
    return NextResponse.json({
      success: false,
      error: error?.message || "Failed to fetch on-chain holder balance",
      balance: 0,
      tier: "fish",
    });
  }
}
