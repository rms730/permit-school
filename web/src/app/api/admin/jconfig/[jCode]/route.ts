import { NextRequest, NextResponse } from "next/server";
import { getRouteClient } from "@/lib/supabaseRoute";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  request: NextRequest,
  { params }: { params: { jCode: string } }
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

    // Get jurisdiction config
    const { data: config, error: configError } = await supabase
      .from("jurisdiction_configs")
      .select("*")
      .eq("jurisdictions.code", params.jCode)
      .single();

    if (configError && configError.code !== "PGRST116") {
      return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
    }

    return NextResponse.json({ config });
  } catch (error) {
    console.error("Jurisdiction config GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { jCode: string } }
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
    const {
      final_exam_questions,
      final_exam_pass_pct,
      seat_time_required_minutes,
      certificate_prefix,
      disclaimer,
      support_email,
      terms_url,
      privacy_url,
    } = body;

    // Validate required fields
    if (!final_exam_questions || !final_exam_pass_pct || !seat_time_required_minutes || !certificate_prefix) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate pass percentage
    if (final_exam_pass_pct <= 0 || final_exam_pass_pct > 1) {
      return NextResponse.json({ error: "Pass percentage must be between 0 and 1" }, { status: 400 });
    }

    // Validate seat time
    if (seat_time_required_minutes <= 0) {
      return NextResponse.json({ error: "Seat time must be greater than 0" }, { status: 400 });
    }

    // Get jurisdiction ID
    const { data: jurisdiction, error: jurisdictionError } = await supabase
      .from("jurisdictions")
      .select("id")
      .eq("code", params.jCode)
      .single();

    if (jurisdictionError || !jurisdiction) {
      return NextResponse.json({ error: "Jurisdiction not found" }, { status: 404 });
    }

    // Upsert config
    const { data: config, error: configError } = await supabase
      .from("jurisdiction_configs")
      .upsert({
        jurisdiction_id: jurisdiction.id,
        final_exam_questions,
        final_exam_pass_pct,
        seat_time_required_minutes,
        certificate_prefix,
        disclaimer,
        support_email,
        terms_url,
        privacy_url,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (configError) {
      console.error("Config upsert error:", configError);
      return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
    }

    return NextResponse.json({ config });
  } catch (error) {
    console.error("Jurisdiction config POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
