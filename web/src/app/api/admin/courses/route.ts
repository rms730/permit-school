import { NextRequest, NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    
    // Get user from session to check admin role
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
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

    // Get all courses with jurisdiction info
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
      console.error("Error fetching courses:", coursesError);
      return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
    }

    return NextResponse.json({ courses });

  } catch (error) {
    console.error("Error in courses API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
