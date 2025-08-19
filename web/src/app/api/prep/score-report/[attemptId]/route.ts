import { NextResponse } from "next/server";
import { getRouteClient } from "@/lib/supabaseRoute";

export async function GET(
  req: Request,
  { params }: { params: { attemptId: string } }
) {
  try {
    const supabase = getRouteClient();
    const { attemptId } = params;

    // Get user from session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHENTICATED" },
        { status: 401 },
      );
    }

    // Get the score report outcome
    const { data: outcome, error: outcomeError } = await supabase
      .from("outcomes")
      .select(`
        id,
        payload,
        created_at,
        attempts!inner(
          id,
          student_id,
          course_id,
          test_id,
          completed_at,
          scaled_score,
          raw_score,
          courses!inner(
            id,
            code,
            title,
            programs!inner(
              id,
              code,
              kind
            )
          ),
          standardized_tests(
            id,
            code,
            name
          )
        )
      `)
      .eq("attempt_id", attemptId)
      .eq("kind", "score_report")
      .single();

    if (outcomeError || !outcome) {
      return NextResponse.json(
        { error: "Score report not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    // Verify ownership
    if (outcome.attempts[0]?.student_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 403 },
      );
    }

    // Verify this is a test prep course
    if (outcome.attempts[0]?.courses[0]?.programs[0]?.kind !== 'test_prep') {
      return NextResponse.json(
        { error: "Invalid course type", code: "INVALID_COURSE_TYPE" },
        { status: 400 },
      );
    }

    // Get attempt sections for additional details
    const { data: attemptSections, error: sectionsError } = await supabase
      .from("attempt_sections")
      .select(`
        id,
        order_no,
        started_at,
        ended_at,
        time_limit_sec,
        raw_score,
        scaled_score,
        test_sections!inner(
          id,
          code,
          name
        )
      `)
      .eq("attempt_id", attemptId)
      .order("order_no");

    if (sectionsError) {
      console.error("Error fetching attempt sections:", sectionsError);
    }

    // Calculate timing statistics
    const timingStats = attemptSections?.map(section => {
      const startTime = new Date(section.started_at || outcome.attempts[0]?.completed_at);
      const endTime = new Date(section.ended_at || outcome.attempts[0]?.completed_at);
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationSec = Math.round(durationMs / 1000);
      
      return {
        sectionCode: section.test_sections[0]?.code,
        sectionName: section.test_sections[0]?.name,
        timeLimitSec: section.time_limit_sec,
        actualTimeSec: durationSec,
        timeRemainingSec: Math.max(0, section.time_limit_sec - durationSec),
        efficiency: section.time_limit_sec > 0 ? 
          Math.round((durationSec / section.time_limit_sec) * 100) : null,
      };
    }) || [];

    // Get question-level details for analysis
    const { data: attemptItems, error: itemsError } = await supabase
      .from("attempt_items")
      .select(`
        id,
        item_no,
        skill,
        correct,
        attempt_section_id
      `)
      .eq("attempt_id", attemptId)
      .order("item_no");

    if (itemsError) {
      console.error("Error fetching attempt items:", itemsError);
    }

    // Calculate skill breakdown
    const skillBreakdown = new Map();
    attemptItems?.forEach(item => {
      if (!skillBreakdown.has(item.skill)) {
        skillBreakdown.set(item.skill, { correct: 0, total: 0 });
      }
      const skill = skillBreakdown.get(item.skill);
      skill.total++;
      if (item.correct) skill.correct++;
    });

    const skillAnalysis = Array.from(skillBreakdown.entries()).map(([skill, stats]) => ({
      skill,
      correct: stats.correct,
      total: stats.total,
      accuracy: Math.round((stats.correct / stats.total) * 100),
    }));

    // Build comprehensive score report
    const scoreReport = {
      attemptId,
      testCode: outcome.attempts[0]?.standardized_tests[0]?.code,
      testName: outcome.attempts[0]?.standardized_tests[0]?.name,
              courseCode: outcome.attempts[0]?.courses[0]?.code,
        courseTitle: outcome.attempts[0]?.courses[0]?.title,
              completedAt: outcome.attempts[0]?.completed_at,
              overall: {
          rawScore: outcome.attempts[0]?.raw_score,
          scaledScore: outcome.attempts[0]?.scaled_score,
        },
      sections: outcome.payload.sections || [],
      timing: timingStats,
      skills: skillAnalysis,
      metadata: {
        totalQuestions: attemptItems?.length || 0,
        totalSections: attemptSections?.length || 0,
        reportGeneratedAt: outcome.created_at,
      },
    };

    return NextResponse.json(scoreReport);
  } catch (err: any) {
    console.error("Score report API error:", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
