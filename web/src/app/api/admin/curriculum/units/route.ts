import { NextResponse } from "next/server";

import { getServerClient } from "@/lib/supabaseServer";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("course_id");

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    const supabase = getServerClient();

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

    // Get units for this course
    const { data: units, error: unitsError } = await supabase
      .from("course_units")
      .select(`
        id,
        unit_no,
        title,
        minutes_required,
        objectives,
        is_published,
        updated_at
      `)
      .eq("course_id", courseId)
      .order("unit_no", { ascending: true });

    if (unitsError) {
      return NextResponse.json({ error: "Failed to load units" }, { status: 500 });
    }

    return NextResponse.json({ units });
  } catch (error) {
    console.error("Units API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
