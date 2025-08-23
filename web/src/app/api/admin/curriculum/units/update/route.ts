import { NextResponse } from "next/server";

import { getServerClient } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  try {
    const supabase = await getServerClient();

    // Get user from session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { unitId, title, minutes_required, objectives, is_published } = body;

    if (!unitId || !title || !minutes_required) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (minutes_required < 5 || minutes_required > 240) {
      return NextResponse.json({ error: "Minutes must be between 5 and 240" }, { status: 400 });
    }

    // Update the unit
    const { data, error } = await supabase
      .from("course_units")
      .update({
        title,
        minutes_required,
        objectives: objectives || null,
        is_published: is_published || false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", unitId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to update unit" }, { status: 500 });
    }

    return NextResponse.json({ unit: data });
  } catch (error) {
    console.error("Unit update API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
