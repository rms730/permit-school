import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const body = await request.json();
    
    const { code, kind, title_i18n, active } = body;
    const programId = params.id;

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

    // Check if program exists
    const { data: existingProgram, error: checkError } = await adminSupabase
      .from('programs')
      .select('id, code')
      .eq('id', programId)
      .single();

    if (checkError) {
      console.error('Error checking existing program:', checkError);
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }

    // Check if new code conflicts with another program
    if (code !== existingProgram.code) {
      const { data: conflictingProgram, error: conflictError } = await adminSupabase
        .from('programs')
        .select('id')
        .eq('code', code)
        .neq('id', programId)
        .single();

      if (conflictError && conflictError.code !== 'PGRST116') {
        console.error('Error checking for code conflicts:', conflictError);
        return NextResponse.json(
          { error: 'Failed to check for code conflicts' },
          { status: 500 }
        );
      }

      if (conflictingProgram) {
        return NextResponse.json(
          { error: 'Program code already exists' },
          { status: 409 }
        );
      }
    }

    // Update the program
    const { data: updatedProgram, error: updateError } = await adminSupabase
      .from('programs')
      .update({
        code,
        kind,
        title: title_i18n.en, // Use English title as primary title
        title_i18n,
        active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', programId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating program:', updateError);
      return NextResponse.json(
        { error: 'Failed to update program' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Program updated successfully',
      program: updatedProgram,
    });
  } catch (error) {
    console.error('Error in programs PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const programId = params.id;

    // Check if program has associated courses or tests
    const { data: courses, error: coursesError } = await adminSupabase
      .from('courses')
      .select('id')
      .eq('program_id', programId)
      .limit(1);

    if (coursesError) {
      console.error('Error checking courses:', coursesError);
      return NextResponse.json(
        { error: 'Failed to check program dependencies' },
        { status: 500 }
      );
    }

    const { data: tests, error: testsError } = await adminSupabase
      .from('standardized_tests')
      .select('id')
      .eq('program_id', programId)
      .limit(1);

    if (testsError) {
      console.error('Error checking tests:', testsError);
      return NextResponse.json(
        { error: 'Failed to check program dependencies' },
        { status: 500 }
      );
    }

    if (courses && courses.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete program with associated courses' },
        { status: 400 }
      );
    }

    if (tests && tests.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete program with associated tests' },
        { status: 400 }
      );
    }

    // Delete the program
    const { error: deleteError } = await adminSupabase
      .from('programs')
      .delete()
      .eq('id', programId);

    if (deleteError) {
      console.error('Error deleting program:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete program' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Program deleted successfully',
    });
  } catch (error) {
    console.error('Error in programs DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
