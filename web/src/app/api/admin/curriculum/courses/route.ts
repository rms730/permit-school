import { NextResponse } from "next/server";

import { getServerClient } from "@/lib/supabaseServer";

export async function GET() {
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

    // Get courses with jurisdiction info
    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select(`
        id,
        code,
        title,
        active,
        hours_required_minutes,
        jurisdictions(name, code)
      `)
      .order("code", { ascending: true });

    if (coursesError) {
      return NextResponse.json({ error: "Failed to load courses" }, { status: 500 });
    }

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("Courses API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
