import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const adminSupabase = getSupabaseAdmin();

    // Get test prep courses
    const { data: courses, error: coursesError } = await adminSupabase
      .from('courses')
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
      .eq('programs.kind', 'test_prep');

    if (coursesError || !courses) {
      console.error('Error fetching test prep courses:', coursesError);
      return NextResponse.json(
        { error: 'Failed to fetch test prep courses', code: 'DATABASE_ERROR' },
        { status: 500 }
      );
    }

    // Get standardized tests and sections
    const { data: tests, error: testsError } = await adminSupabase
      .from('standardized_tests')
      .select(`
        id,
        code,
        test_sections(
          id,
          code,
          name,
          order_no,
          time_limit_sec
        )
      `)
      .in('code', ['ACT', 'SAT']);

    if (testsError || !tests) {
      console.error('Error fetching standardized tests:', testsError);
      return NextResponse.json(
        { error: 'Failed to fetch standardized tests', code: 'DATABASE_ERROR' },
        { status: 500 }
      );
    }

    const blueprints = [];
    const blueprintRules = [];

    for (const course of courses) {
      const test = tests.find(t => t.code === course.code.split('-')[0]);
      
      if (!test) continue;

      // Create blueprint for this course
      const blueprint = {
        course_id: course.id,
        name: `${course.code} Mock Test`,
        total_questions: test.test_sections?.reduce((sum, section) => sum + 20, 0) || 40, // 20 questions per section
        test_id: test.id,
        time_limit_sec: test.test_sections?.reduce((sum, section) => sum + section.time_limit_sec, 0) || 7200,
        is_active: false
      };

      blueprints.push(blueprint);
    }

    // Insert blueprints
    const { data: seededBlueprints, error: blueprintsError } = await adminSupabase
      .from('exam_blueprints')
      .insert(blueprints)
      .select('id, course_id, name, test_id');

    if (blueprintsError || !seededBlueprints) {
      console.error('Error seeding blueprints:', blueprintsError);
      return NextResponse.json(
        { error: 'Failed to seed blueprints', code: 'DATABASE_ERROR' },
        { status: 500 }
      );
    }

    // Create blueprint rules for each section
    for (const blueprint of seededBlueprints) {
      const test = tests.find(t => t.id === blueprint.test_id);
      if (!test?.test_sections) continue;

      let ruleNo = 1;
      for (const section of test.test_sections) {
        // Create rules for each section
        const sectionRules = [
          {
            blueprint_id: blueprint.id,
            rule_no: ruleNo,
            rule_order: ruleNo++,
            skill: 'grammar',
            count: 5,
            min_difficulty: 1,
            max_difficulty: 5,
            section_id: section.id,
            tags_any: ['grammar', 'punctuation', 'syntax']
          },
          {
            blueprint_id: blueprint.id,
            rule_no: ruleNo,
            rule_order: ruleNo++,
            skill: 'comprehension',
            count: 5,
            min_difficulty: 1,
            max_difficulty: 5,
            section_id: section.id,
            tags_any: ['reading', 'comprehension', 'analysis']
          },
          {
            blueprint_id: blueprint.id,
            rule_no: ruleNo,
            rule_order: ruleNo++,
            skill: 'problem_solving',
            count: 5,
            min_difficulty: 1,
            max_difficulty: 5,
            section_id: section.id,
            tags_any: ['problem_solving', 'critical_thinking']
          },
          {
            blueprint_id: blueprint.id,
            rule_no: ruleNo,
            rule_order: ruleNo++,
            skill: 'vocabulary',
            count: 5,
            min_difficulty: 1,
            max_difficulty: 5,
            section_id: section.id,
            tags_any: ['vocabulary', 'word_meaning', 'context']
          }
        ];

        blueprintRules.push(...sectionRules);
      }
    }

    // Insert blueprint rules
    const { data: seededRules, error: rulesError } = await adminSupabase
      .from('exam_blueprint_rules')
      .upsert(blueprintRules, { onConflict: 'blueprint_id,rule_no' })
      .select('blueprint_id, rule_no, skill, count, section_id');

    if (rulesError) {
      console.error('Error seeding blueprint rules:', rulesError);
      return NextResponse.json(
        { error: 'Failed to seed blueprint rules', code: 'DATABASE_ERROR' },
        { status: 500 }
      );
    }

    // Create sample questions for test prep courses
    const sampleQuestions = [];

    for (const course of courses) {
      const test = tests.find(t => t.code === course.code.split('-')[0]);
      if (!test?.test_sections) continue;

      for (const section of test.test_sections) {
        // Create sample questions for each section
        const skills = ['grammar', 'comprehension', 'problem_solving', 'vocabulary'];
        
        for (let i = 0; i < 20; i++) {
          const skill = skills[i % skills.length];
          const difficulty = Math.floor(Math.random() * 5) + 1;
          
          sampleQuestions.push({
            course_id: course.id,
            skill: skill,
            difficulty: difficulty,
            stem: `Sample ${section.name} question ${i + 1} for ${skill}`,
            stem_i18n: {
              en: `Sample ${section.name} question ${i + 1} for ${skill}`,
              es: `Pregunta de muestra ${i + 1} de ${section.name} para ${skill}`
            },
            choices: {
              A: 'Option A',
              B: 'Option B', 
              C: 'Option C',
              D: 'Option D'
            },
            answer: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
            explanation: `This is a sample explanation for question ${i + 1}`,
            explanation_i18n: {
              en: `This is a sample explanation for question ${i + 1}`,
              es: `Esta es una explicación de muestra para la pregunta ${i + 1}`
            },
            source_sections: [section.code],
            locale: 'en',
            status: 'approved',
            tags: [skill, section.code.toLowerCase()]
          });
        }
      }
    }

    // Insert sample questions
    const { data: seededQuestions, error: questionsError } = await adminSupabase
      .from('question_bank')
      .insert(sampleQuestions)
      .select('id, course_id, skill, difficulty');

    if (questionsError) {
      console.error('Error seeding sample questions:', questionsError);
      return NextResponse.json(
        { error: 'Failed to seed sample questions', code: 'DATABASE_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Test prep blueprints, rules, and sample questions seeded successfully',
      blueprints: seededBlueprints,
      rules: seededRules,
      questionsCount: seededQuestions?.length || 0
    });

  } catch (error) {
    console.error('Prep blueprints seed error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
