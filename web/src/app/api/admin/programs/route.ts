import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const adminSupabase = getSupabaseAdmin();
    
    // Get programs with counts
    const { data: programs, error: programsError } = await adminSupabase
      .from('programs')
      .select(`
        id,
        code,
        kind,
        title,
        title_i18n,
        active,
        created_at,
        updated_at
      `)
      .order('code');

    if (programsError) {
      console.error('Error fetching programs:', programsError);
      return NextResponse.json(
        { error: 'Failed to fetch programs' },
        { status: 500 }
      );
    }

    // Get course counts for each program
    const { data: courseCounts, error: courseCountsError } = await adminSupabase
      .from('courses')
      .select('program_id')
      .eq('active', true);

    if (courseCountsError) {
      console.error('Error fetching course counts:', courseCountsError);
    }

    // Get test counts for each program
    const { data: testCounts, error: testCountsError } = await adminSupabase
      .from('standardized_tests')
      .select('program_id')
      .eq('active', true);

    if (testCountsError) {
      console.error('Error fetching test counts:', testCountsError);
    }

    // Add counts to programs
    const programsWithCounts = programs?.map(program => ({
      ...program,
      courses_count: courseCounts?.filter(c => c.program_id === program.id).length || 0,
      tests_count: testCounts?.filter(t => t.program_id === program.id).length || 0,
    }));

    return NextResponse.json({
      programs: programsWithCounts || [],
    });
  } catch (error) {
    console.error('Error in programs GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const body = await request.json();
    
    const { code, kind, title_i18n, active = true } = body;

    // Validate required fields
    if (!code || !kind || !title_i18n?.en) {
      return NextResponse.json(
        { error: 'Missing required fields: code, kind, and title_i18n.en are required' },
        { status: 400 }
      );
    }

    // Validate kind
    if (!['permit', 'test_prep'].includes(kind)) {
      return NextResponse.json(
        { error: 'Invalid kind: must be "permit" or "test_prep"' },
        { status: 400 }
      );
    }

    // Check if program code already exists
    const { data: existingProgram, error: checkError } = await adminSupabase
      .from('programs')
      .select('id')
      .eq('code', code)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing program:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing program' },
        { status: 500 }
      );
    }

    if (existingProgram) {
      return NextResponse.json(
        { error: 'Program code already exists' },
        { status: 409 }
      );
    }

    // Create the program
    const { data: newProgram, error: createError } = await adminSupabase
      .from('programs')
      .insert({
        code,
        kind,
        title: title_i18n.en, // Use English title as primary title
        title_i18n,
        active,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating program:', createError);
      return NextResponse.json(
        { error: 'Failed to create program' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Program created successfully',
      program: newProgram,
    });
  } catch (error) {
    console.error('Error in programs POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
