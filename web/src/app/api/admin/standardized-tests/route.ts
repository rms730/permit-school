import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const adminSupabase = getSupabaseAdmin();
    
    // Get standardized tests with section counts
    const { data: tests, error: testsError } = await adminSupabase
      .from('standardized_tests')
      .select(`
        id,
        code,
        name,
        description,
        active,
        program_id,
        created_at,
        updated_at
      `)
      .order('code');

    if (testsError) {
      console.error('Error fetching standardized tests:', testsError);
      return NextResponse.json(
        { error: 'Failed to fetch standardized tests' },
        { status: 500 }
      );
    }

    // Get section counts for each test
    const { data: sectionCounts, error: sectionCountsError } = await adminSupabase
      .from('test_sections')
      .select('test_id')
      .eq('active', true);

    if (sectionCountsError) {
      console.error('Error fetching section counts:', sectionCountsError);
    }

    // Add section counts to tests
    const testsWithCounts = tests?.map(test => ({
      ...test,
      sections_count: sectionCounts?.filter(s => s.test_id === test.id).length || 0,
    }));

    return NextResponse.json({
      tests: testsWithCounts || [],
    });
  } catch (error) {
    console.error('Error in standardized-tests GET:', error);
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
    
    const { code, name, description, active = true, program_id } = body;

    // Validate required fields
    if (!code || !name || !program_id) {
      return NextResponse.json(
        { error: 'Missing required fields: code, name, and program_id are required' },
        { status: 400 }
      );
    }

    // Validate that the program exists and is a test_prep program
    const { data: program, error: programError } = await adminSupabase
      .from('programs')
      .select('id, kind')
      .eq('id', program_id)
      .single();

    if (programError) {
      console.error('Error checking program:', programError);
      return NextResponse.json(
        { error: 'Invalid program_id' },
        { status: 400 }
      );
    }

    if (program.kind !== 'test_prep') {
      return NextResponse.json(
        { error: 'Standardized tests can only be associated with test_prep programs' },
        { status: 400 }
      );
    }

    // Check if test code already exists
    const { data: existingTest, error: checkError } = await adminSupabase
      .from('standardized_tests')
      .select('id')
      .eq('code', code)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing test:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing test' },
        { status: 500 }
      );
    }

    if (existingTest) {
      return NextResponse.json(
        { error: 'Test code already exists' },
        { status: 409 }
      );
    }

    // Create the test
    const { data: newTest, error: createError } = await adminSupabase
      .from('standardized_tests')
      .insert({
        code,
        name,
        description,
        active,
        program_id,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating test:', createError);
      return NextResponse.json(
        { error: 'Failed to create test' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Test created successfully',
      test: newTest,
    });
  } catch (error) {
    console.error('Error in standardized-tests POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
