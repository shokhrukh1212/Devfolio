import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

type FeatureKey = "analytics" | "custom_domain";

interface WaitlistRequest {
  feature: FeatureKey;
  userId: string;
  metadata?: {
    requested_domain?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: WaitlistRequest = await request.json();
    const { feature, userId, metadata } = body;

    if (!feature || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user to verify they're authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify the userId matches the authenticated user
    if (user.id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get current profile data
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("custom_data")
      .eq("id", userId)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Build updated custom_data
    const currentCustomData = profile.custom_data || {};
    const currentWaitlist = currentCustomData.waitlist_interests || {};

    const updatedWaitlist = {
      ...currentWaitlist,
      [feature]: true,
      joined_at: currentWaitlist.joined_at || new Date().toISOString(),
    };

    // Add requested domain if this is a custom_domain feature
    if (feature === "custom_domain" && metadata?.requested_domain) {
      updatedWaitlist.requested_domain = metadata.requested_domain;
    }

    const updatedCustomData = {
      ...currentCustomData,
      waitlist_interests: updatedWaitlist,
    };

    // Update the profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ custom_data: updatedCustomData })
      .eq("id", userId);

    if (updateError) {
      console.error("Failed to update profile:", updateError);
      return NextResponse.json(
        { error: "Failed to join waitlist" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully joined waitlist",
      feature,
    });
  } catch (error) {
    console.error("Waitlist API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
