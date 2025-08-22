import { NextRequest, NextResponse } from 'next/server';

import { rateLimit, getRateLimitKey, getRateLimitHeaders } from '@/lib/ratelimit';
import { generateReport } from '@/lib/regulatory/generateReport';
import { getRouteClient } from '@/lib/supabaseRoute';

export async function POST(request: NextRequest) {
  try {
    const supabase = getRouteClient();
    
    // Rate limiting
    const rateLimitEnabled = process.env.RATE_LIMIT_ON === 'true';
    if (rateLimitEnabled) {
      const key = getRateLimitKey(request);
      const windowMs = 3600000; // 1 hour
      const max = 10; // 10 requests per hour
      
      const result = rateLimit(key, windowMs, max);
      const headers = getRateLimitHeaders(result);
      
      if (!result.ok) {
        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          { status: 429, headers }
        );
      }
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = user.app_metadata?.role === 'admin';
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { jCode, courseId, periodStart, periodEnd, dryRun = false } = body;

    // Validate required fields
    if (!jCode || !courseId || !periodStart || !periodEnd) {
      return NextResponse.json({ 
        error: "Missing required fields: jCode, courseId, periodStart, periodEnd" 
      }, { status: 400 });
    }

    // Validate period window (max 45 days)
    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 45) {
      return NextResponse.json({ 
        error: "Period window cannot exceed 45 days" 
      }, { status: 400 });
    }

    if (startDate > endDate) {
      return NextResponse.json({ 
        error: "Period start must be before period end" 
      }, { status: 400 });
    }

    // Validate course belongs to jurisdiction
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select(`
        id,
        jurisdictions!inner(code)
      `)
      .eq('id', courseId)
      .eq('jurisdictions.code', jCode)
      .single();

    if (courseError || !course) {
      return NextResponse.json({ 
        error: "Course not found or does not belong to specified jurisdiction" 
      }, { status: 400 });
    }

    if (dryRun) {
      // Dry run: just get counts
      const { data: rosterCount } = await supabase
        .from('v_reg_roster')
        .select('*', { count: 'exact', head: true })
        .eq('j_code', jCode)
        .eq('course_id', courseId)
        .gte('first_enroll_at', periodStart)
        .lte('first_enroll_at', periodEnd);

      const { data: examsCount } = await supabase
        .from('v_reg_exams')
        .select('*', { count: 'exact', head: true })
        .eq('j_code', jCode)
        .eq('course_id', courseId)
        .gte('completed_at', periodStart)
        .lte('completed_at', periodEnd);

      const { data: certsCount } = await supabase
        .from('v_reg_certs')
        .select('*', { count: 'exact', head: true })
        .eq('j_code', jCode)
        .eq('course_id', courseId)
        .gte('issued_at', periodStart)
        .lte('issued_at', periodEnd);

      const { data: seatTimeCount } = await supabase
        .from('v_reg_seat_time_rollup')
        .select('*', { count: 'exact', head: true })
        .eq('j_code', jCode)
        .eq('course_id', courseId);

      return NextResponse.json({
        success: true,
        dryRun: true,
        summary: {
          roster: rosterCount || 0,
          exams: examsCount || 0,
          certs: certsCount || 0,
          seatTime: seatTimeCount || 0
        },
        period: {
          start: periodStart,
          end: periodEnd,
          days: daysDiff
        }
      });
    }

    // Generate actual report
    const result = await generateReport({
      jCode,
      courseId,
      periodStart,
      periodEnd,
      initiatedByUserId: user.id
    });

    return NextResponse.json({
      success: true,
      runId: result.runId,
      summary: result.summary,
      artifacts: result.artifacts.length
    });

  } catch (error) {
    console.error('Regulatory run error:', error);
    return NextResponse.json({ 
      error: "Failed to generate regulatory report",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
