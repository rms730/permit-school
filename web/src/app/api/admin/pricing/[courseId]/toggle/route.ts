import { NextRequest, NextResponse } from "next/server";

import { getRouteClient } from "@/lib/supabaseRoute";

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const supabase = getRouteClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { price_id } = body;

    if (!price_id) {
      return NextResponse.json({ error: "Missing price_id" }, { status: 400 });
    }

    // Get current price status
    const { data: currentPrice, error: currentError } = await supabase
      .from("billing_prices")
      .select("active")
      .eq("id", price_id)
      .eq("course_id", params.courseId)
      .single();

    if (currentError || !currentPrice) {
      return NextResponse.json({ error: "Price not found" }, { status: 404 });
    }

    // Toggle active status
    const { data: price, error: priceError } = await supabase
      .from("billing_prices")
      .update({ active: !currentPrice.active })
      .eq("id", price_id)
      .select()
      .single();

    if (priceError) {
      console.error("Price toggle error:", priceError);
      return NextResponse.json({ error: "Failed to toggle price" }, { status: 500 });
    }

    return NextResponse.json({ price });
  } catch (error) {
    console.error("Pricing toggle error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
