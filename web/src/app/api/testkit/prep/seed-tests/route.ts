import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const adminSupabase = getSupabaseAdmin();

    // Seed standardized tests
    const tests = [
      {
        code: 'ACT',
        name: 'American College Testing',
        is_active: true,
        metadata: {
          description: 'Standardized test for college admissions',
          scoreRange: '1-36',
          sections: ['English', 'Math', 'Reading', 'Science'],
          disclaimer: 'ACT® is a registered trademark of ACT, Inc.'
        }
      },
      {
        code: 'SAT',
        name: 'Scholastic Assessment Test',
        is_active: true,
        metadata: {
          description: 'Standardized test for college admissions',
          scoreRange: '400-1600',
          sections: ['Reading & Writing', 'Math'],
          disclaimer: 'SAT® is a registered trademark of the College Board'
        }
      }
    ];

    const { data: seededTests, error: testsError } = await adminSupabase
      .from('standardized_tests')
      .upsert(tests, { onConflict: 'code' })
      .select('id, code, name');

    if (testsError) {
      console.error('Error seeding standardized tests:', testsError);
      return NextResponse.json(
        { error: 'Failed to seed standardized tests', code: 'DATABASE_ERROR' },
        { status: 500 }
      );
    }

    // Seed test sections
    const actTest = seededTests?.find(t => t.code === 'ACT');
    const satTest = seededTests?.find(t => t.code === 'SAT');

    const sections = [];

    if (actTest) {
      sections.push(
        {
          test_id: actTest.id,
          code: 'ENGLISH',
          name: 'English',
          order_no: 1,
          time_limit_sec: 2700 // 45 minutes
        },
        {
          test_id: actTest.id,
          code: 'MATH',
          name: 'Mathematics',
          order_no: 2,
          time_limit_sec: 3600 // 60 minutes
        },
        {
          test_id: actTest.id,
          code: 'READING',
          name: 'Reading',
          order_no: 3,
          time_limit_sec: 2100 // 35 minutes
        },
        {
          test_id: actTest.id,
          code: 'SCIENCE',
          name: 'Science',
          order_no: 4,
          time_limit_sec: 2100 // 35 minutes
        }
      );
    }

    if (satTest) {
      sections.push(
        {
          test_id: satTest.id,
          code: 'READING_WRITING',
          name: 'Reading & Writing',
          order_no: 1,
          time_limit_sec: 3600 // 60 minutes
        },
        {
          test_id: satTest.id,
          code: 'MATH',
          name: 'Mathematics',
          order_no: 2,
          time_limit_sec: 3600 // 60 minutes
        }
      );
    }

    const { data: seededSections, error: sectionsError } = await adminSupabase
      .from('test_sections')
      .upsert(sections, { onConflict: 'test_id,code' })
      .select('id, test_id, code, name, time_limit_sec');

    if (sectionsError) {
      console.error('Error seeding test sections:', sectionsError);
      return NextResponse.json(
        { error: 'Failed to seed test sections', code: 'DATABASE_ERROR' },
        { status: 500 }
      );
    }

    // Seed sample score scales (fictional for demonstration)
    const scoreScales = [];

    // ACT section scales (fictional sample)
    if (actTest) {
      const actSections = seededSections?.filter(s => s.test_id === actTest.id) || [];
      
      for (const section of actSections) {
        // Generate sample raw to scaled mappings
        for (let raw = 0; raw <= 40; raw++) {
          // Fictional mapping: raw score to scaled score (1-36)
          let scaled = 1;
          if (raw >= 35) scaled = 36;
          else if (raw >= 30) scaled = 30 + Math.floor((raw - 30) * 1.2);
          else if (raw >= 20) scaled = 20 + Math.floor((raw - 20) * 1.0);
          else if (raw >= 10) scaled = 10 + Math.floor((raw - 10) * 0.8);
          else scaled = 1 + Math.floor(raw * 0.9);

          scoreScales.push({
            test_id: actTest.id,
            section_id: section.id,
            raw_score: raw,
            scaled_score: Math.min(36, Math.max(1, scaled))
          });
        }
      }

      // ACT composite scale (average of sections)
      for (let raw = 0; raw <= 160; raw++) {
        const scaled = Math.round(1 + (raw / 160) * 35);
        scoreScales.push({
          test_id: actTest.id,
          section_id: null, // composite
          raw_score: raw,
          scaled_score: Math.min(36, Math.max(1, scaled))
        });
      }
    }

    // SAT section scales (fictional sample)
    if (satTest) {
      const satSections = seededSections?.filter(s => s.test_id === satTest.id) || [];
      
      for (const section of satSections) {
        // Generate sample raw to scaled mappings
        for (let raw = 0; raw <= 50; raw++) {
          // Fictional mapping: raw score to scaled score (200-800)
          let scaled = 200;
          if (raw >= 45) scaled = 800;
          else if (raw >= 35) scaled = 600 + Math.floor((raw - 35) * 20);
          else if (raw >= 25) scaled = 400 + Math.floor((raw - 25) * 20);
          else if (raw >= 15) scaled = 300 + Math.floor((raw - 15) * 10);
          else scaled = 200 + Math.floor(raw * 6.67);

          scoreScales.push({
            test_id: satTest.id,
            section_id: section.id,
            raw_score: raw,
            scaled_score: Math.min(800, Math.max(200, scaled))
          });
        }
      }

      // SAT total scale (sum of sections)
      for (let raw = 0; raw <= 100; raw++) {
        const scaled = 400 + Math.floor((raw / 100) * 1200);
        scoreScales.push({
          test_id: satTest.id,
          section_id: null, // total
          raw_score: raw,
          scaled_score: Math.min(1600, Math.max(400, scaled))
        });
      }
    }

    const { data: seededScales, error: scalesError } = await adminSupabase
      .from('score_scales')
      .upsert(scoreScales, { onConflict: 'test_id,section_id,raw_score' })
      .select('id, test_id, section_id, raw_score, scaled_score');

    if (scalesError) {
      console.error('Error seeding score scales:', scalesError);
      return NextResponse.json(
        { error: 'Failed to seed score scales', code: 'DATABASE_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Standardized tests, sections, and score scales seeded successfully',
      tests: seededTests,
      sections: seededSections,
      scalesCount: seededScales?.length || 0
    });

  } catch (error) {
    console.error('Prep tests seed error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
