import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("course_id");

    if (!courseId) {
      return NextResponse.json({ error: "course_id is required" }, { status: 400 });
    }

    // Get all blueprints for the course with their rules
    const { data: blueprints, error: blueprintsError } = await supabase
      .from("exam_blueprints")
      .select(`
        id,
        name,
        total_questions,
        is_active,
        created_at,
        updated_at,
        exam_blueprint_rules(
          rule_no,
          skill,
          count,
          min_difficulty,
          max_difficulty,
          include_tags,
          exclude_tags
        )
      `)
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });

    if (blueprintsError) {
      console.error("Error fetching blueprints:", blueprintsError);
      return NextResponse.json({ error: "Failed to fetch blueprints" }, { status: 500 });
    }

    return NextResponse.json({ blueprints });

  } catch (error) {
    console.error("Error in blueprints API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
