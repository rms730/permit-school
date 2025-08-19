import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

interface ExamBlueprintOptions {
  code: string;
  course_code: string;
  num_questions?: number; // Default from jurisdiction config
}

export async function POST(request: NextRequest) {
  // Environment guard - return 404 if testkit is not enabled
  if (process.env.TESTKIT_ON !== 'true') {
    return new NextResponse('Not Found', { status: 404 });
  }

  // Token validation
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.TESTKIT_TOKEN;
  
  if (!authHeader || !expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body: ExamBlueprintOptions = await request.json();
    const { code, course_code, num_questions } = body;
    
    const supabase = getSupabaseAdmin();
    
    // Log the operation
    console.info(JSON.stringify({
      operation: 'testkit_exam_blueprint',
      timestamp: new Date().toISOString(),
      code,
      course_code,
      num_questions,
      user_agent: request.headers.get('user-agent')
    }));

    // Get course ID by looking up jurisdiction first, then course
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('code', course_code)
      .eq('jurisdiction_id', (await supabase
        .from('jurisdictions')
        .select('id')
        .eq('code', code)
        .single()).data?.id)
      .single();

    if (courseError || !courseData) {
      console.error('Course lookup error:', courseError);
      return NextResponse.json({ 
        error: 'Course not found',
        details: courseError 
      }, { status: 404 });
    }

    // Get jurisdiction config for default question count
    const { data: jConfig } = await supabase
      .from('jurisdiction_configs')
      .select(`
        final_exam_questions,
        jurisdictions!inner(code)
      `)
      .eq('jurisdictions.code', code)
      .single();

    const questionCount = num_questions || jConfig?.final_exam_questions || 30;

    // Check if active blueprint exists
    const { data: existingBlueprint } = await supabase
      .from('exam_blueprints')
      .select('id, total_questions')
      .eq('course_id', courseData.id)
      .eq('is_active', true)
      .single();

    if (existingBlueprint) {
      // Update existing blueprint if question count differs
      if (existingBlueprint.total_questions !== questionCount) {
        const { data: updatedBlueprint, error: updateError } = await supabase
          .from('exam_blueprints')
          .update({ 
            total_questions: questionCount,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingBlueprint.id)
          .select()
          .single();

        if (updateError) {
          console.error('Blueprint update error:', updateError);
          return NextResponse.json({ 
            error: 'Failed to update blueprint',
            details: updateError 
          }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          blueprint: updatedBlueprint,
          message: 'Blueprint updated successfully',
          timestamp: new Date().toISOString()
        });
      }

      return NextResponse.json({
        success: true,
        blueprint: existingBlueprint,
        message: 'Active blueprint already exists',
        timestamp: new Date().toISOString()
      });
    }

    // Create new active blueprint
    const { data: newBlueprint, error: blueprintError } = await supabase
      .from('exam_blueprints')
      .insert({
        course_id: courseData.id,
        name: `Test Blueprint for ${course_code}`,
        total_questions: questionCount,
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (blueprintError) {
      console.error('Blueprint creation error:', blueprintError);
      return NextResponse.json({ 
        error: 'Failed to create blueprint',
        details: blueprintError 
      }, { status: 500 });
    }

    // Create a simple rule that covers all questions
    const { error: ruleError } = await supabase
      .from('exam_blueprint_rules')
      .insert({
        blueprint_id: newBlueprint.id,
        skill: 'General',
        count: questionCount,
        min_difficulty: 1,
        max_difficulty: 5,
        rule_order: 1
      });

    if (ruleError) {
      console.error('Blueprint rule creation error:', ruleError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      success: true,
      blueprint: newBlueprint,
      message: 'Blueprint created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Testkit exam blueprint error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during blueprint creation' 
    }, { status: 500 });
  }
}
