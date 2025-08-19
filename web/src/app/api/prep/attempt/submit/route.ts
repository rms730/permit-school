import { NextResponse } from "next/server";
import { getRouteClient } from "@/lib/supabaseRoute";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const supabase = getRouteClient();
    const body = await req.json();
    const { attemptId, answers } = body;

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

    // Get attempt and verify ownership
    const { data: attempt, error: attemptError } = await supabase
      .from("attempts")
      .select(`
        id,
        student_id,
        course_id,
        test_id,
        completed_at,
        courses!inner(
          id,
          code,
          programs!inner(
            id,
            code,
            kind
          )
        )
      `)
      .eq("id", attemptId)
      .single();

    if (attemptError || !attempt) {
      return NextResponse.json(
        { error: "Attempt not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    if (attempt.student_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 403 },
      );
    }

    if (attempt.completed_at) {
      return NextResponse.json(
        { error: "Attempt already completed", code: "ALREADY_COMPLETED" },
        { status: 400 },
      );
    }

    if (attempt.courses.programs.kind !== 'test_prep') {
      return NextResponse.json(
        { error: "Attempt is not for a test prep course", code: "INVALID_COURSE_TYPE" },
        { status: 400 },
      );
    }

    // Get attempt items
    const { data: attemptItems, error: itemsError } = await supabase
      .from("attempt_items")
      .select(`
        id,
        item_no,
        answer,
        attempt_section_id
      `)
      .eq("attempt_id", attemptId)
      .order("item_no");

    if (itemsError || !attemptItems) {
      console.error("Error fetching attempt items:", itemsError);
      return NextResponse.json(
        { error: "Failed to fetch attempt items", code: "DATABASE_ERROR" },
        { status: 500 },
      );
    }

    // Get attempt sections if this is a sectioned test
    const { data: attemptSections, error: sectionsError } = await supabase
      .from("attempt_sections")
      .select(`
        id,
        section_id,
        order_no,
        time_limit_sec,
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
      return NextResponse.json(
        { error: "Failed to fetch attempt sections", code: "DATABASE_ERROR" },
        { status: 500 },
      );
    }

    // Grade answers and update attempt items
    const adminSupabase = getSupabaseAdmin();
    const gradedItems = [];
    const sectionScores = new Map();

    for (const item of attemptItems) {
      const userAnswer = answers[item.item_no];
      const isCorrect = userAnswer === item.answer;
      
      gradedItems.push({
        id: item.id,
        correct: isCorrect,
      });

      // Track scores by section
      if (item.attempt_section_id) {
        const currentScore = sectionScores.get(item.attempt_section_id) || 0;
        sectionScores.set(item.attempt_section_id, currentScore + (isCorrect ? 1 : 0));
      }
    }

    // Update attempt items with grades
    const { error: updateError } = await adminSupabase
      .from("attempt_items")
      .upsert(gradedItems, { onConflict: "id" });

    if (updateError) {
      console.error("Error updating attempt items:", updateError);
      return NextResponse.json(
        { error: "Failed to grade attempt", code: "DATABASE_ERROR" },
        { status: 500 },
      );
    }

    // Calculate section scores and scaled scores
    const sectionResults = [];
    let totalRawScore = 0;
    let totalScaledScore = 0;
    let sectionCount = 0;

    for (const section of attemptSections || []) {
      const rawScore = sectionScores.get(section.id) || 0;
      totalRawScore += rawScore;

      // Get scaled score for this section
      let scaledScore = null;
      if (attempt.test_id) {
        const { data: scaleData } = await adminSupabase
          .from("score_scales")
          .select("scaled_score")
          .eq("test_id", attempt.test_id)
          .eq("section_id", section.section_id)
          .eq("raw_score", rawScore)
          .single();

        scaledScore = scaleData?.scaled_score || null;
        if (scaledScore !== null) {
          totalScaledScore += scaledScore;
          sectionCount++;
        }
      }

      // Update attempt section
      await adminSupabase
        .from("attempt_sections")
        .update({
          raw_score: rawScore,
          scaled_score: scaledScore,
          ended_at: new Date().toISOString(),
        })
        .eq("id", section.id);

      sectionResults.push({
        sectionCode: section.test_sections.code,
        sectionName: section.test_sections.name,
        rawScore,
        scaledScore,
        timeLimitSec: section.time_limit_sec,
      });
    }

    // Calculate overall scaled score
    let overallScaledScore = null;
    if (attempt.test_id && sectionCount > 0) {
      if (attempt.test_id) {
        // Try to get overall scale first
        const { data: overallScale } = await adminSupabase
          .from("score_scales")
          .select("scaled_score")
          .eq("test_id", attempt.test_id)
          .is("section_id", null)
          .eq("raw_score", totalRawScore)
          .single();

        if (overallScale) {
          overallScaledScore = overallScale.scaled_score;
        } else {
          // Calculate composite (e.g., ACT average, SAT sum)
          const { data: testData } = await adminSupabase
            .from("standardized_tests")
            .select("code")
            .eq("id", attempt.test_id)
            .single();

          if (testData?.code === 'ACT') {
            // ACT: average of section scores
            overallScaledScore = Math.round(totalScaledScore / sectionCount);
          } else if (testData?.code === 'SAT') {
            // SAT: sum of section scores
            overallScaledScore = totalScaledScore;
          }
        }
      }
    }

    // Complete the attempt
    const { error: completeError } = await adminSupabase
      .from("attempts")
      .update({
        completed_at: new Date().toISOString(),
        raw_score: totalRawScore,
        scaled_score: overallScaledScore,
        score: overallScaledScore || totalRawScore,
      })
      .eq("id", attemptId);

    if (completeError) {
      console.error("Error completing attempt:", completeError);
      return NextResponse.json(
        { error: "Failed to complete attempt", code: "DATABASE_ERROR" },
        { status: 500 },
      );
    }

    // Create score report outcome
    const scoreReportPayload = {
      sections: sectionResults,
      overall: {
        rawScore: totalRawScore,
        scaledScore: overallScaledScore,
      },
      testCode: attempt.test_id ? (await adminSupabase
        .from("standardized_tests")
        .select("code")
        .eq("id", attempt.test_id)
        .single()).data?.code : null,
      completedAt: new Date().toISOString(),
    };

    const { error: outcomeError } = await adminSupabase
      .from("outcomes")
      .insert({
        kind: 'score_report',
        user_id: user.id,
        attempt_id: attemptId,
        course_id: attempt.course_id,
        payload: scoreReportPayload,
      });

    if (outcomeError) {
      console.error("Error creating score report outcome:", outcomeError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      attemptId,
      scoreReport: scoreReportPayload,
    });
  } catch (err: any) {
    console.error("Prep attempt submit API error:", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
