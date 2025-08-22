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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("course_id");

    if (!courseId) {
      return NextResponse.json({ error: "course_id is required" }, { status: 400 });
    }

    // Get all unique tags for the course
    const { data: questions, error: questionsError } = await supabase
      .from("question_bank")
      .select("tags")
      .eq("course_id", courseId)
      .not("tags", "is", null);

    if (questionsError) {
      console.error("Error fetching questions for tags:", questionsError);
      return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
    }

    // Extract and deduplicate tags
    const allTags = new Set<string>();
    questions?.forEach(question => {
      if (question.tags && Array.isArray(question.tags)) {
        question.tags.forEach(tag => allTags.add(tag));
      }
    });

    const tags = Array.from(allTags).sort();

    return NextResponse.json({ tags });

  } catch (error) {
    console.error("Error in questions tags API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
