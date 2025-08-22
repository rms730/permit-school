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
    const questionId = searchParams.get("id");

    if (!questionId) {
      return NextResponse.json({ error: "Question id is required" }, { status: 400 });
    }

    // Get question details
    const { data: question, error: questionError } = await supabase
      .from("question_bank")
      .select(`
        id,
        skill,
        difficulty,
        stem,
        choices,
        answer,
        explanation,
        status,
        tags,
        version,
        published_at,
        created_at
      `)
      .eq("id", questionId)
      .single();

    if (questionError || !question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Get overall stats from v_item_stats
    const { data: overallStats, error: statsError } = await supabase
      .from("v_item_stats")
      .select("*")
      .eq("question_id", questionId)
      .single();

    if (statsError && statsError.code !== "PGRST116") {
      console.error("Error fetching stats:", statsError);
      return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }

    // Get breakdown by difficulty (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: difficultyStats, error: difficultyError } = await supabase
      .from("attempt_items")
      .select(`
        correct,
        attempts!inner(completed_at, score)
      `)
      .eq("stem", question.stem)
      .eq("choices", question.choices)
      .eq("answer", question.answer)
      .gte("attempts.completed_at", thirtyDaysAgo.toISOString())
      .not("attempts.completed_at", "is", null);

    if (difficultyError) {
      console.error("Error fetching difficulty stats:", difficultyError);
    }

    // Calculate difficulty breakdown
    const difficultyBreakdown = {
      total: difficultyStats?.length || 0,
      correct: difficultyStats?.filter(item => item.correct).length || 0,
      p_correct: difficultyStats?.length ? 
        (difficultyStats.filter(item => item.correct).length / difficultyStats.length) : 0
    };

    // Get recent usage (last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: recentUsage, error: usageError } = await supabase
      .from("attempt_items")
      .select(`
        attempts!inner(completed_at)
      `)
      .eq("stem", question.stem)
      .eq("choices", question.choices)
      .eq("answer", question.answer)
      .gte("attempts.completed_at", ninetyDaysAgo.toISOString())
      .not("attempts.completed_at", "is", null)
      .order("attempts.completed_at", { ascending: false })
      .limit(10);

    if (usageError) {
      console.error("Error fetching recent usage:", usageError);
    }

    return NextResponse.json({
      question,
      stats: {
        overall: overallStats || {
          attempts: 0,
          correct_count: 0,
          p_correct: 0,
          avg_attempt_score: 0,
          last_seen_at: null
        },
        last_30d: difficultyBreakdown,
        last_90d: {
          total_attempts: recentUsage?.length || 0,
          recent_attempts: recentUsage?.map(item => (item.attempts as any).completed_at) || []
        }
      }
    });

  } catch (error) {
    console.error("Error in questions stats API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
