import { NextResponse } from "next/server";

import { getLocaleFromRequest } from '@/lib/i18n/server';
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
    const body = await req.json();
    const { courseId, attemptKind = 'mock' } = body;

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

    // Get course and verify it's a test prep course
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select(`
        id,
        code,
        title,
        programs!inner(
          id,
          code,
          kind
        )
      `)
      .eq("id", courseId)
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { error: "Course not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    if (course.programs[0]?.kind !== 'test_prep') {
      return NextResponse.json(
        { error: "Course is not a test prep course", code: "INVALID_COURSE_TYPE" },
        { status: 400 },
      );
    }

    // Get active blueprint for this course
    const { data: activeBlueprint, error: blueprintError } = await supabase
      .from("exam_blueprints")
      .select(`
        id,
        total_questions,
        test_id,
        time_limit_sec,
        exam_blueprint_rules(
          rule_no,
          skill,
          count,
          min_difficulty,
          max_difficulty,
          include_tags,
          exclude_tags,
          section_id,
          tags_any
        )
      `)
      .eq("course_id", courseId)
      .eq("is_active", true)
      .single();

    if (blueprintError || !activeBlueprint) {
      return NextResponse.json(
        { error: "No active blueprint found for course", code: "NO_BLUEPRINT" },
        { status: 404 },
      );
    }

    // Get test sections if this is a standardized test
    let testSections: any[] = [];
    if (activeBlueprint.test_id) {
      const { data: sections, error: sectionsError } = await supabase
        .from("test_sections")
        .select("id, code, name, order_no, time_limit_sec")
        .eq("test_id", activeBlueprint.test_id)
        .order("order_no");

      if (sectionsError) {
        console.error("Error fetching test sections:", sectionsError);
        return NextResponse.json(
          { error: "Failed to fetch test sections", code: "SECTIONS_ERROR" },
          { status: 500 },
        );
      }
      testSections = sections || [];
    }

    // Create attempt
    const { data: attempt, error: attemptError } = await supabase
      .from("attempts")
      .insert({
        student_id: user.id,
        course_id: courseId,
        mode: attemptKind === 'diagnostic' ? 'quiz' : 'mock',
        kind: attemptKind,
        test_id: activeBlueprint.test_id,
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

    // Group rules by section
    const rulesBySection = new Map();
    const rulesWithoutSection: any[] = [];

    activeBlueprint.exam_blueprint_rules?.forEach((rule: any) => {
      if (rule.section_id) {
        if (!rulesBySection.has(rule.section_id)) {
          rulesBySection.set(rule.section_id, []);
        }
        rulesBySection.get(rule.section_id).push(rule);
      } else {
        rulesWithoutSection.push(rule);
      }
    });

    // Create attempt sections and select questions
    const attemptSections: any[] = [];
    const allAttemptItems: any[] = [];
    let globalItemNo = 1;

    // Handle sectioned tests (ACT, SAT)
    if (testSections.length > 0) {
      for (const section of testSections) {
        const sectionRules = rulesBySection.get(section.id) || [];
        
        // Create attempt section
        const { data: attemptSection, error: sectionError } = await supabase
          .from("attempt_sections")
          .insert({
            attempt_id: attempt.id,
            section_id: section.id,
            order_no: section.order_no,
            time_limit_sec: section.time_limit_sec,
          })
          .select("id")
          .single();

        if (sectionError || !attemptSection) {
          console.error("Attempt section creation error:", sectionError);
          return NextResponse.json(
            { error: "Failed to create attempt section", code: "DATABASE_ERROR" },
            { status: 500 },
          );
        }

        attemptSections.push(attemptSection);

        // Select questions for this section
        const sectionQuestions = await selectQuestionsForRules(
          supabase,
          courseId,
          sectionRules,
          locale
        );

        // Create attempt items for this section
        const sectionItems = sectionQuestions.map((q: any, index: number) => ({
          attempt_id: attempt.id,
          attempt_section_id: attemptSection.id,
          item_no: globalItemNo++,
          skill: q.skill,
          stem: q.stem,
          choices: q.choices,
          answer: q.answer,
          explanation: q.explanation,
          correct: null,
        }));

        allAttemptItems.push(...sectionItems);
      }
    } else {
      // Handle non-sectioned tests (fallback)
      const questions = await selectQuestionsForRules(
        supabase,
        courseId,
        rulesWithoutSection,
        locale
      );

      const items = questions.map((q: any, index: number) => ({
        attempt_id: attempt.id,
        item_no: index + 1,
        skill: q.skill,
        stem: q.stem,
        choices: q.choices,
        answer: q.answer,
        explanation: q.explanation,
        correct: null,
      }));

      allAttemptItems.push(...items);
    }

    // Insert all attempt items
    if (allAttemptItems.length > 0) {
      const { error: itemsError } = await supabase
        .from("attempt_items")
        .insert(allAttemptItems);

      if (itemsError) {
        console.error("Attempt items insert error:", itemsError);
        return NextResponse.json(
          { error: "Failed to create exam items", code: "DATABASE_ERROR" },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({
      attemptId: attempt.id,
      sections: attemptSections.map(s => ({
        id: s.id,
        orderNo: s.order_no,
        timeLimitSec: s.time_limit_sec,
      })),
      totalQuestions: allAttemptItems.length,
    });
  } catch (err: any) {
    console.error("Prep attempt create API error:", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}

async function selectQuestionsForRules(
  supabase: any,
  courseId: string,
  rules: any[],
  locale: string
): Promise<any[]> {
  const selectedQuestions: any[] = [];

  for (const rule of rules) {
    // Build query for this rule
    let ruleQuery = supabase
      .from("question_bank")
      .select("id, skill, stem, stem_i18n, choices, answer, explanation, explanation_i18n")
      .eq("course_id", courseId)
      .eq("status", "approved")
      .eq("skill", rule.skill)
      .eq("locale", locale);

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
    if (rule.tags_any && rule.tags_any.length > 0) {
      ruleQuery = ruleQuery.overlaps("tags", rule.tags_any);
    }

    // Get questions for this rule
    const { data: ruleQuestions, error: ruleError } = await ruleQuery;

    if (ruleError) {
      console.error("Error fetching questions for rule:", ruleError);
      throw new Error("Failed to fetch questions for blueprint rule");
    }

    // Randomly select the required number of questions
    const shuffled = ruleQuestions?.sort(() => 0.5 - Math.random()) || [];
    const selected = shuffled.slice(0, rule.count);

    if (selected.length < rule.count) {
      throw new Error(`Insufficient questions available for rule ${rule.rule_no}`);
    }

    // Apply translations
    const translatedQuestions = selected.map((q: any) => ({
      ...q,
      stem: q.stem_i18n?.[locale] || q.stem,
      explanation: q.explanation_i18n?.[locale] || q.explanation,
    }));

    selectedQuestions.push(...translatedQuestions);
  }

  return selectedQuestions;
}
