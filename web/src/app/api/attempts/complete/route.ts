import { NextResponse } from "next/server";

import { getRouteClient } from "@/lib/supabaseRoute";

export async function POST(req: Request) {
  try {
    const { attemptId } = await req.json();

    // Validate input
    if (!attemptId || typeof attemptId !== "string") {
      return NextResponse.json(
        { error: "Missing attemptId", code: "BAD_BODY" },
        { status: 400 },
      );
    }

    const supabase = getRouteClient();

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

    // Validate ownership of attempt
    const { data: attempt, error: attemptError } = await supabase
      .from("attempts")
      .select("id, student_id, course_id")
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
        { error: "Not your attempt", code: "FORBIDDEN" },
        { status: 403 },
      );
    }

    // Get all attempt items to compute score
    const { data: items, error: itemsError } = await supabase
      .from("attempt_items")
      .select("correct, skill")
      .eq("attempt_id", attemptId);

    if (itemsError || !items || items.length === 0) {
      console.error("Attempt items query error:", itemsError);
      return NextResponse.json(
        { error: "No quiz items found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    // Compute final score
    const correctCount = items.filter((item) => item.correct === true).length;
    const score = correctCount / items.length;

    // Update attempt with completion
    const { error: updateError } = await supabase
      .from("attempts")
      .update({
        completed_at: new Date().toISOString(),
        score: score,
      })
      .eq("id", attemptId);

    if (updateError) {
      console.error("Attempt update error:", updateError);
      return NextResponse.json(
        { error: "Failed to complete attempt", code: "DATABASE_ERROR" },
        { status: 500 },
      );
    }

    // Update skill mastery via simple EWMA (α = 0.3)
    const alpha = 0.3;
    const skillResults = items.reduce(
      (acc, item) => {
        if (!acc[item.skill]) {
          acc[item.skill] = { correct: 0, total: 0 };
        }
        acc[item.skill].total++;
        if (item.correct) acc[item.skill].correct++;
        return acc;
      },
      {} as Record<string, { correct: number; total: number }>,
    );

    // Upsert skill mastery for each skill
    for (const [skill, result] of Object.entries(skillResults)) {
      const skillScore = result.correct / result.total;

      // Get current mastery
      const { data: currentMastery } = await supabase
        .from("skill_mastery")
        .select("mastery")
        .eq("student_id", user.id)
        .eq("skill", skill)
        .single();

      const currentMasteryValue = currentMastery?.mastery || 0.5; // Default to 0.5
      const newMastery = currentMasteryValue * (1 - alpha) + skillScore * alpha;

      const { error: masteryError } = await supabase
        .from("skill_mastery")
        .upsert({
          student_id: user.id,
          skill,
          mastery: newMastery,
        });

      if (masteryError) {
        console.error("Skill mastery update error:", masteryError);
        // Continue with other skills even if one fails
      }
    }

    return NextResponse.json({ score });
  } catch (err: any) {
    console.error("Attempt complete API error:", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
