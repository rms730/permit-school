import { NextResponse } from "next/server";
import { getRouteClient } from "@/lib/supabaseRoute";
import { rateLimit, getRateLimitHeaders, getRateLimitKey } from '@/lib/ratelimit';
import { getJurisdictionConfig } from "@/lib/jurisdictionConfig";
import { getLocaleFromRequest } from '@/lib/i18n/server';

export async function POST(req: Request) {
  // Rate limiting
  const rateLimitEnabled = process.env.RATE_LIMIT_ON === 'true';
  if (rateLimitEnabled) {
    const key = getRateLimitKey(req);
    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000');
    const max = parseInt(process.env.RATE_LIMIT_MAX || '60');
    
    const result = rateLimit(key, windowMs, max);
    const headers = getRateLimitHeaders(result);
    
    if (!result.ok) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429, headers }
      );
    }
  }

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

    // Get jurisdiction config
    const config = await getJurisdictionConfig('CA');

    // Get user's locale
    const locale = await getLocaleFromRequest();

    // Select questions from question_bank across all units
    const { data: questions, error: questionsError } = await supabase
      .from("question_bank")
      .select("id, skill, stem, choices, answer, explanation")
      .eq("course_id", course.id)
      .limit(config.final_exam_questions);

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
