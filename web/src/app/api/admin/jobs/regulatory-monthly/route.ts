import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { generateReport } from '@/lib/regulatory/generateReport';

export async function POST(request: NextRequest) {
  try {
    // Environment guard - return 404 if not enabled
    if (process.env.REGULATORY_MONTHLY_ENABLED !== 'true') {
      return new NextResponse('Not Found', { status: 404 });
    }

    // HMAC validation (reuse existing pattern)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.ADMIN_JOB_TOKEN;
    
    if (!authHeader || !expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    
    // Log the operation
    console.info(JSON.stringify({
      operation: 'regulatory_monthly_job',
      timestamp: new Date().toISOString(),
      user_agent: request.headers.get('user-agent')
    }));

    // Calculate last calendar month
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const periodStart = lastMonth.toISOString().split('T')[0]; // YYYY-MM-01
    const periodEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]; // YYYY-MM-DD (last day of month)

    // Get all active CA courses
    const { data: activeCourses, error: coursesError } = await supabase
      .from('courses')
      .select(`
        id,
        code,
        title,
        jurisdictions!inner(code)
      `)
      .eq('active', true)
      .eq('jurisdictions.code', 'CA');

    if (coursesError) {
      console.error('Error fetching active CA courses:', coursesError);
      return NextResponse.json({ 
        error: 'Failed to fetch active courses',
        details: coursesError 
      }, { status: 500 });
    }

    if (!activeCourses || activeCourses.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active CA courses found',
        processed: 0
      });
    }

    let processedCount = 0;
    const results: any[] = [];

    // Process each active course
    for (const course of activeCourses) {
      try {
        console.info(`Processing regulatory report for course ${course.code} (${periodStart} to ${periodEnd})`);

        const result = await generateReport({
          jCode: course.jurisdictions.code,
          courseId: course.id,
          periodStart,
          periodEnd,
          initiatedByUserId: 'system' // Use system user for automated jobs
        });

        results.push({
          course_code: course.code,
          run_id: result.runId,
          summary: result.summary
        });

        processedCount++;
      } catch (error) {
        console.error(`Error processing course ${course.code}:`, error);
        results.push({
          course_code: course.code,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        // Continue with other courses
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
      total_courses: activeCourses.length,
      period: {
        start: periodStart,
        end: periodEnd
      },
      results,
      message: 'Monthly regulatory reports generated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Monthly regulatory job error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during monthly regulatory report generation' 
    }, { status: 500 });
  }
}
