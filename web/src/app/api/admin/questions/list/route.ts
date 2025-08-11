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
    const q = searchParams.get("q");
    const status = searchParams.get("status");
    const tag = searchParams.get("tag");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sort = searchParams.get("sort") || "created_at";

    if (!courseId) {
      return NextResponse.json({ error: "course_id is required" }, { status: 400 });
    }

    // Build query
    let query = supabase
      .from("question_bank")
      .select(`
        id,
        skill,
        difficulty,
        stem,
        status,
        tags,
        version,
        published_at,
        created_at,
        updated_at,
        v_item_stats!left(attempts, correct_count, p_correct, last_seen_at)
      `)
      .eq("course_id", courseId);

    // Apply filters
    if (q) {
      query = query.or(`stem.ilike.%${q}%,explanation.ilike.%${q}%`);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (tag) {
      query = query.contains("tags", [tag]);
    }

    // Apply sorting
    if (sort === "p_correct") {
      query = query.order("v_item_stats.p_correct", { ascending: false });
    } else if (sort === "attempts") {
      query = query.order("v_item_stats.attempts", { ascending: false });
    } else if (sort === "last_seen") {
      query = query.order("v_item_stats.last_seen_at", { ascending: false });
    } else {
      query = query.order(sort, { ascending: false });
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: questions, error, count } = await query;

    if (error) {
      console.error("Error fetching questions:", error);
      return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
    }

    // Transform data to flatten stats
    const transformedQuestions = questions?.map(q => ({
      ...q,
      attempts: (q.v_item_stats as any)?.attempts || 0,
      correct_count: (q.v_item_stats as any)?.correct_count || 0,
      p_correct: (q.v_item_stats as any)?.p_correct || 0,
      last_seen_at: (q.v_item_stats as any)?.last_seen_at || null,
      v_item_stats: undefined // Remove nested object
    }));

    return NextResponse.json({
      questions: transformedQuestions,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error("Error in questions list API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
