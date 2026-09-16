import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface ServerRaidState {
  name: string;
  title: string;
  maxHp: number;
  currentHp: number;
  isDefeated: boolean;
  totalParticipants: number;
  recentAttacks: { name: string; damage: number; timestamp: number }[];
}

// In-memory persistent server state
const raidState: ServerRaidState = {
  name: "Lord Mega-FUD",
  title: "Ancient Glitch Dragon of Paper Hands",
  maxHp: 100000,
  currentHp: 73420, // starts primed for community action
  isDefeated: false,
  totalParticipants: 42,
  recentAttacks: [
    { name: "3bZ8...aHdf.sol", damage: 15, timestamp: Date.now() - 120000 },
    { name: "0xLoreWeaver.eth", damage: 8, timestamp: Date.now() - 300000 },
    { name: "StarNommer", damage: 24, timestamp: Date.now() - 600000 },
  ],
};

export async function GET() {
  return NextResponse.json({
    success: true,
    raid: raidState,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { damage = 1, authorName = "Anonymous Nommer" } = body;

    if (raidState.isDefeated) {
      return NextResponse.json({ success: true, raid: raidState });
    }

    const safeDamage = Math.min(Math.max(1, Number(damage) || 1), 50);
    raidState.currentHp = Math.max(0, raidState.currentHp - safeDamage);

    if (raidState.currentHp === 0) {
      raidState.isDefeated = true;
    }

    raidState.recentAttacks.unshift({
      name: authorName,
      damage: safeDamage,
      timestamp: Date.now(),
    });

    if (raidState.recentAttacks.length > 8) {
      raidState.recentAttacks.pop();
    }

    return NextResponse.json({
      success: true,
      raid: raidState,
      damageDealt: safeDamage,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to register raid damage";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
