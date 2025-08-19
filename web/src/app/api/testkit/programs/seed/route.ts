import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const adminSupabase = getSupabaseAdmin();

    // Seed programs
    const programs = [
      {
        code: 'PERMIT',
        kind: 'permit',
        title: 'Driver Permits',
        title_i18n: {
          en: 'Driver Permits',
          es: 'Permisos de Conducir'
        },
        is_active: true
      },
      {
        code: 'ACT',
        kind: 'test_prep',
        title: 'ACT Test Prep',
        title_i18n: {
          en: 'ACT Test Prep',
          es: 'Preparación para ACT'
        },
        is_active: true
      },
      {
        code: 'SAT',
        kind: 'test_prep',
        title: 'SAT Test Prep',
        title_i18n: {
          en: 'SAT Test Prep',
          es: 'Preparación para SAT'
        },
        is_active: true
      }
    ];

    const { data: seededPrograms, error: programsError } = await adminSupabase
      .from('programs')
      .upsert(programs, { onConflict: 'code' })
      .select('id, code, kind');

    if (programsError) {
      console.error('Error seeding programs:', programsError);
      return NextResponse.json(
        { error: 'Failed to seed programs', code: 'DATABASE_ERROR' },
        { status: 500 }
      );
    }

    // Get a jurisdiction (use the first one available)
    const { data: jurisdictions, error: jurisdictionError } = await adminSupabase
      .from('jurisdictions')
      .select('id, code')
      .limit(1);

    if (jurisdictionError || !jurisdictions || jurisdictions.length === 0) {
      console.error('Error getting jurisdictions:', jurisdictionError);
      return NextResponse.json(
        { error: 'No jurisdictions available', code: 'DATABASE_ERROR' },
        { status: 500 }
      );
    }

    const jurisdiction = jurisdictions[0];

    // Create test prep courses
    const testPrepCourses = [
      {
        code: 'ACT-PREP-101',
        title: 'ACT Complete Preparation',
        price_cents: 2999,
        hours_required_minutes: null,
        active: true,
        locale: 'en'
      },
      {
        code: 'SAT-PREP-101',
        title: 'SAT Complete Preparation',
        price_cents: 2999,
        hours_required_minutes: null,
        active: true,
        locale: 'en'
      }
    ];

    // Get program IDs
    const actProgram = seededPrograms?.find(p => p.code === 'ACT');
    const satProgram = seededPrograms?.find(p => p.code === 'SAT');

    if (actProgram && satProgram) {
      const courses = [
        {
          ...testPrepCourses[0],
          jurisdiction_id: jurisdiction.id,
          program_id: actProgram.id
        },
        {
          ...testPrepCourses[1],
          jurisdiction_id: jurisdiction.id,
          program_id: satProgram.id
        }
      ];

      const { data: seededCourses, error: coursesError } = await adminSupabase
        .from('courses')
        .upsert(courses, { onConflict: 'jurisdiction_id,program_id,code' })
        .select('id, code, title, program_id');

      if (coursesError) {
        console.error('Error seeding test prep courses:', coursesError);
        return NextResponse.json(
          { error: 'Failed to seed test prep courses', code: 'DATABASE_ERROR' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Programs and test prep courses seeded successfully',
        programs: seededPrograms,
        courses: seededCourses
      });
    }

    return NextResponse.json({
      message: 'Programs seeded successfully',
      programs: seededPrograms
    });

  } catch (error) {
    console.error('Programs seed error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
