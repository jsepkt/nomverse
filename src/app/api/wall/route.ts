import { NextRequest, NextResponse } from "next/server";
import {
  getWallPosts,
  createPost,
  editPost,
  deletePost,
  toggleReaction,
  addReply,
  deleteReply,
  reportPost,
} from "@/lib/wallStorage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const posts = getWallPosts();
    return NextResponse.json({ success: true, posts });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load posts";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { authorId, authorName, authorProvider, title, content, category } = body;

    if (!authorId || !authorName || !authorProvider || !title || !content) {
      return NextResponse.json(
        { success: false, error: "Missing required fields for post." },
        { status: 400 }
      );
    }

    const result = createPost(authorId, authorName, authorProvider, title, content, category);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, post: result.post });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create post";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "edit") {
      const { postId, authorId, title, content, category } = body;
      const result = editPost(postId, authorId, title, content, category);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, post: result.post });
    }

    if (action === "react") {
      const { postId, userId, reaction } = body;
      if (!postId || !userId || !reaction) {
        return NextResponse.json(
          { success: false, error: "Missing parameters for reaction." },
          { status: 400 }
        );
      }
      const result = toggleReaction(postId, userId, reaction);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, post: result.post });
    }

    if (action === "reply") {
      const { postId, authorId, authorName, authorProvider, content } = body;
      if (!postId || !authorId || !content) {
        return NextResponse.json(
          { success: false, error: "Missing parameters for reply." },
          { status: 400 }
        );
      }
      const result = addReply(postId, authorId, authorName, authorProvider, content);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, reply: result.reply });
    }

    if (action === "report") {
      const { postId, userId, reason } = body;
      if (!postId || !userId) {
        return NextResponse.json(
          { success: false, error: "Missing parameters for report." },
          { status: 400 }
        );
      }
      const result = reportPost(postId, userId, reason);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, post: result.post });
    }

    return NextResponse.json({ success: false, error: "Unknown action." }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to process request";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { postId, replyId, authorId } = body;

    if (!authorId || !postId) {
      return NextResponse.json(
        { success: false, error: "Missing required identifiers." },
        { status: 400 }
      );
    }

    if (replyId) {
      const result = deleteReply(postId, replyId, authorId);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    const result = deletePost(postId, authorId);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete item";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
