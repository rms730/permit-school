import { NextResponse } from "next/server";
import { getRouteClient } from "@/lib/supabaseRoute";

export async function POST(req: Request) {
  try {
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

    // Check eligibility
    const eligibilityResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/exam/eligibility`, {
      headers: {
        'Cookie': req.headers.get('cookie') || '',
      },
    });

    const eligibility = await eligibilityResponse.json();
    if (!eligibility.eligible) {
      return NextResponse.json(
        { error: "Not eligible for final exam", code: "NOT_ELIGIBLE", reason: eligibility.reason },
        { status: 400 },
      );
    }

    // Get course ID for DE-ONLINE
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id")
      .eq("code", "DE-ONLINE")
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { error: "Course not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    // Create attempts row
    const { data: attempt, error: attemptError } = await supabase
      .from("attempts")
      .insert({
        student_id: user.id,
        course_id: course.id,
        mode: "final",
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

    // Get number of questions from env
    const numQuestions = parseInt(process.env.FINAL_EXAM_NUM_QUESTIONS || '30');

    // Select questions from question_bank across all units
    const { data: questions, error: questionsError } = await supabase
      .from("question_bank")
      .select("id, skill, stem, choices, answer, explanation")
      .eq("course_id", course.id)
      .limit(numQuestions);

    if (questionsError || !questions || questions.length === 0) {
      console.error("Questions query error:", questionsError);
      return NextResponse.json(
        { error: "No questions available", code: "NO_QUESTIONS" },
        { status: 500 },
      );
    }

    // Insert attempt_items
    const attemptItems = questions.map((q, index) => ({
      attempt_id: attempt.id,
      item_no: index + 1,
      skill: q.skill,
      stem: q.stem,
      choices: q.choices,
      answer: q.answer,
      explanation: q.explanation,
      correct: null,
    }));

    const { error: itemsError } = await supabase
      .from("attempt_items")
      .insert(attemptItems);

    if (itemsError) {
      console.error("Attempt items insert error:", itemsError);
      return NextResponse.json(
        { error: "Failed to create exam items", code: "DATABASE_ERROR" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      attemptId: attempt.id,
      count: questions.length,
    });
  } catch (err: any) {
    console.error("Exam start API error:", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
