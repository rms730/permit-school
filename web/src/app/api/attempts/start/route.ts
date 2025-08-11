import { NextResponse } from "next/server";
import { getRouteClient } from "@/lib/supabaseRoute";
import { getLocaleFromRequest } from '@/lib/i18n/server';

export async function POST(req: Request) {
  try {
    const { unitId } = await req.json();

    // Validate input
    if (!unitId || typeof unitId !== "string") {
      return NextResponse.json(
        { error: "Missing unitId", code: "BAD_BODY" },
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

    // Join to fetch course_id, unit_no, minutes_required
    const { data: unit, error: unitError } = await supabase
      .from("course_units")
      .select("course_id, unit_no, minutes_required")
      .eq("id", unitId)
      .single();

    if (unitError || !unit) {
      return NextResponse.json(
        { error: "Unit not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    // Compute accrued seat time
    const { data: progress, error: progressError } = await supabase
      .from("unit_progress")
      .select("time_ms")
      .eq("student_id", user.id)
      .eq("course_id", unit.course_id)
      .eq("unit_no", unit.unit_no)
      .single();

    const { data: recentEvents, error: eventsError } = await supabase
      .from("seat_time_events")
      .select("ms_delta")
      .eq("student_id", user.id)
      .eq("unit_id", unitId)
      .gte(
        "created_at",
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      ); // Last 24 hours

    if (progressError || eventsError) {
      console.error(
        "Progress/events query error:",
        progressError || eventsError,
      );
      return NextResponse.json(
        { error: "Failed to check progress", code: "DATABASE_ERROR" },
        { status: 500 },
      );
    }

    const progressTimeMs = progress?.time_ms || 0;
    const recentTimeMs = (recentEvents || []).reduce(
      (sum, event) => sum + event.ms_delta,
      0,
    );
    const totalTimeMs = progressTimeMs + recentTimeMs;
    const requiredTimeMs = unit.minutes_required * 60000;

    if (totalTimeMs < requiredTimeMs) {
      return NextResponse.json(
        {
          error: "Not enough seat time",
          code: "NOT_ENOUGH_TIME",
          required: unit.minutes_required,
          accrued: Math.floor(totalTimeMs / 60000),
        },
        { status: 400 },
      );
    }

    // Create attempts row
    const { data: attempt, error: attemptError } = await supabase
      .from("attempts")
      .insert({
        student_id: user.id,
        course_id: unit.course_id,
        mode: "quiz",
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (attemptError || !attempt) {
      console.error("Attempt creation error:", attemptError);
      return NextResponse.json(
        { error: "Failed to create attempt", code: "DATABASE_ERROR" },
        { status: 500 },
      );
    }

    // Get user's locale
    const locale = await getLocaleFromRequest();

    // Select questions from question_bank (simplified - select 10 random questions)
    const { data: questions, error: questionsError } = await supabase
      .from("question_bank")
      .select("id, skill, stem, choices, answer, explanation")
      .eq("j_code", "CA")
      .limit(10);

    if (questionsError || !questions || questions.length === 0) {
      console.error("Questions query error:", questionsError);
      return NextResponse.json(
        { error: "No questions available", code: "NO_QUESTIONS" },
        { status: 500 },
      );
    }

    // Get translations for questions
    const questionIds = questions.map(q => q.id);
    const { data: translations } = await supabase
      .from("question_translations")
      .select("question_id, stem, choices, explanation")
      .in("question_id", questionIds)
      .eq("lang", locale);

    // Create translation lookup
    const translationMap = new Map();
    translations?.forEach(t => {
      translationMap.set(t.question_id, t);
    });

    // Insert attempt_items with translations
    const attemptItems = questions.map((q, index) => {
      const translation = translationMap.get(q.id);
      return {
        attempt_id: attempt.id,
        item_no: index + 1,
        skill: q.skill,
        stem: translation?.stem || q.stem,
        choices: translation?.choices || q.choices,
        answer: q.answer, // Answer key remains the same
        explanation: translation?.explanation || q.explanation,
        correct: null,
      };
    });

    const { error: itemsError } = await supabase
      .from("attempt_items")
      .insert(attemptItems);

    if (itemsError) {
      console.error("Attempt items insert error:", itemsError);
      return NextResponse.json(
        { error: "Failed to create quiz items", code: "DATABASE_ERROR" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      attemptId: attempt.id,
      count: questions.length,
    });
  } catch (err: any) {
    console.error("Attempt start API error:", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
