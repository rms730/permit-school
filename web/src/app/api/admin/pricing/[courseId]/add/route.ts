import { NextRequest, NextResponse } from "next/server";

import { getRouteClient } from "@/lib/supabaseRoute";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const supabase = await getRouteClient();
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
    const { stripe_price_id } = body;

    if (!stripe_price_id) {
      return NextResponse.json({ error: "Missing stripe_price_id" }, { status: 400 });
    }

    // Add new price
    const { data: price, error: priceError } = await supabase
      .from("billing_prices")
      .insert({
        course_id: courseId,
        stripe_price_id,
        active: true,
      })
      .select()
      .single();

    if (priceError) {
      console.error("Price insert error:", priceError);
      return NextResponse.json({ error: "Failed to add price" }, { status: 500 });
    }

    return NextResponse.json({ price });
  } catch (error) {
    console.error("Pricing add error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
