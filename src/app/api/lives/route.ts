import { NextRequest, NextResponse } from "next/server";
import { createPost, addReply } from "@/lib/wallStorage";

export const dynamic = "force-dynamic";

// In-memory pending life gifts mailbox: recipientId -> count of gifts
const pendingLifeGifts = new Map<string, number>();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const recipientId = searchParams.get("recipientId");

    if (!recipientId) {
      return NextResponse.json({ success: true, giftsReceived: 0 });
    }

    const count = pendingLifeGifts.get(recipientId) || 0;
    if (count > 0) {
      // Consume the gift so it only triggers once
      pendingLifeGifts.delete(recipientId);
    }

    return NextResponse.json({ success: true, giftsReceived: count });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to query pending life gifts";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // 1. Request Life on The NomWall (SOS Broadcast)
    if (action === "request_sos") {
      const { authorId, authorName, authorProvider, score } = body;
      if (!authorId || !authorName) {
        return NextResponse.json({ success: false, error: "Missing author info" }, { status: 400 });
      }

      const title = `🚨 [LIFE SOS] Nomster is starving! Can someone send a Life Gift?`;
      const content = `I lost all my lives after reaching a score of ${score || 0} candies! 😢 My cooldown is active. Could a fellow builder click below to gift a life? You will receive the permanent ❤️ Lifesaver badge and +10 Karma on The NomWall!`;

      const result = createPost(authorId, authorName, authorProvider, title, content, "game");
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      return NextResponse.json({ success: true, post: result.post });
    }

    // 2. Automatically Celebrate High Score Victory on The NomWall
    if (action === "post_high_score") {
      const { authorId, authorName, authorProvider, score, streak } = body;
      if (!authorId || !authorName || !score) {
        return NextResponse.json({ success: false, error: "Missing high score details" }, { status: 400 });
      }

      const title = `🏆 [HIGH SCORE RECORD] ${authorName} devoured ${score} Solana Candies!`;
      const content = `🔥 Nomster is on a cryptographic tear! I just reached a new personal record of ${score} candies devoured with an incredible combo streak of x${streak || 1} in FEAST MODE! 🚀 Can anyone beat this on the arcade?`;

      const result = createPost(authorId, authorName, authorProvider, title, content, "game");
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      return NextResponse.json({ success: true, post: result.post });
    }

    // 3. Send Life Gift to a Player
    if (action === "gift_life") {
      const { postId, giverId, giverName, giverProvider, recipientId, recipientName } = body;
      if (!recipientId || !giverId) {
        return NextResponse.json({ success: false, error: "Missing gift parameters" }, { status: 400 });
      }

      // Record in pending gifts mailbox for real-time revival
      const current = pendingLifeGifts.get(recipientId) || 0;
      pendingLifeGifts.set(recipientId, current + 1);

      // Add a celebratory reply if associated with a wall post
      if (postId) {
        addReply(
          postId,
          giverId,
          giverName || "Generous Builder",
          giverProvider || "phantom",
          `🎁 Sent a +1 Life Gift to ${recipientName || "player"}! Nomster has been revived. Enjoy the game! ❤️`
        );
      }

      return NextResponse.json({
        success: true,
        message: `Life gift sent! You earned the permanent ❤️ Lifesaver badge and +10 Karma!`,
      });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process life request";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
