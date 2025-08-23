import { NextResponse } from "next/server";

import { getLocaleFromRequest } from '@/lib/i18n/server';
import { getJurisdictionConfig } from "@/lib/jurisdictionConfig";
import { rateLimit, getRateLimitHeaders, getRateLimitKey } from '@/lib/ratelimit';
import { getRouteClient } from "@/lib/supabaseRoute";

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
    const supabase = await getRouteClient();

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

    // Check if there's an active blueprint for this course
    const { data: activeBlueprint, error: blueprintError } = await supabase
      .from("exam_blueprints")
      .select(`
        id,
        total_questions,
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
      .eq("course_id", course.id)
      .eq("is_active", true)
      .single();

    let questions: any[] = [];

    if (activeBlueprint && !blueprintError) {
      // Use blueprint to select questions
      const rules = activeBlueprint.exam_blueprint_rules || [];
      const selectedQuestions: any[] = [];

      for (const rule of rules) {
        // Build query for this rule
        let ruleQuery = supabase
          .from("question_bank")
          .select("id, skill, stem, choices, answer, explanation")
          .eq("course_id", course.id)
          .eq("status", "approved")
          .eq("skill", rule.skill);

        // Apply difficulty filters
        if (rule.min_difficulty) {
          ruleQuery = ruleQuery.gte("difficulty", rule.min_difficulty);
        }
        if (rule.max_difficulty) {
          ruleQuery = ruleQuery.lte("difficulty", rule.max_difficulty);
        }

        // Apply tag filters
        if (rule.include_tags && rule.include_tags.length > 0) {
          ruleQuery = ruleQuery.overlaps("tags", rule.include_tags);
        }
        if (rule.exclude_tags && rule.exclude_tags.length > 0) {
          ruleQuery = ruleQuery.not("tags", "overlaps", rule.exclude_tags);
        }

        // Get questions for this rule
        const { data: ruleQuestions, error: ruleError } = await ruleQuery;

        if (ruleError) {
          console.error("Error fetching questions for rule:", ruleError);
          return NextResponse.json(
            { error: "Failed to fetch questions for blueprint rule", code: "BLUEPRINT_ERROR" },
            { status: 500 },
          );
        }

        // Randomly select the required number of questions
        const shuffled = ruleQuestions?.sort(() => 0.5 - Math.random()) || [];
        const selected = shuffled.slice(0, rule.count);

        if (selected.length < rule.count) {
          return NextResponse.json(
            { 
              error: "Insufficient questions available for blueprint rule", 
              code: "INSUFFICIENT_QUESTIONS",
              missing: [{
                rule_no: rule.rule_no,
                needed: rule.count,
                available: selected.length
              }]
            },
            { status: 409 },
          );
        }

        selectedQuestions.push(...selected);
      }

      questions = selectedQuestions;
    } else {
      // Fallback to existing behavior
      const { data: fallbackQuestions, error: questionsError } = await supabase
        .from("question_bank")
        .select("id, skill, stem, choices, answer, explanation")
        .eq("course_id", course.id)
        .limit(config.final_exam_questions);

      if (questionsError || !fallbackQuestions || fallbackQuestions.length === 0) {
        console.error("Questions query error:", questionsError);
        return NextResponse.json(
          { error: "No questions available", code: "NO_QUESTIONS" },
          { status: 500 },
        );
      }

      questions = fallbackQuestions;
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
