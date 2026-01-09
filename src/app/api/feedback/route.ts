import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface FeedbackRequest {
  userId: string;
  type: "bug" | "feature" | "other";
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackRequest = await request.json();
    const { userId, type, message } = body;

    if (!userId || !type || !message?.trim()) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user to verify they're authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the userId matches the authenticated user
    if (user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Insert feedback into the dedicated feedback table
    const { error: insertError } = await supabase.from("feedback").insert({
      user_id: userId,
      type,
      message: message.trim(),
    });

    if (insertError) {
      console.error("Feedback insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to save feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feedback submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
