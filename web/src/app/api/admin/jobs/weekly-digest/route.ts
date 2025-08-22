import { NextRequest, NextResponse } from 'next/server';

import { notifyStudent } from '@/lib/notify';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    // Environment guard - return 404 if not enabled
    if (process.env.WEEKLY_DIGEST_ENABLED !== 'true') {
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
      operation: 'weekly_digest_job',
      timestamp: new Date().toISOString(),
      user_agent: request.headers.get('user-agent')
    }));

    // Get all guardians with active students
    const { data: guardianStudents, error: guardianError } = await supabase
      .from('v_guardian_children')
      .select('guardian_id, student_id, first_name, last_name');

    if (guardianError) {
      console.error('Error fetching guardian students:', guardianError);
      return NextResponse.json({ 
        error: 'Failed to fetch guardian data',
        details: guardianError 
      }, { status: 500 });
    }

    if (!guardianStudents || guardianStudents.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No guardians found',
        processed: 0
      });
    }

    // Group by guardian
    const guardianMap = new Map<string, any[]>();
    guardianStudents.forEach(gs => {
      if (!guardianMap.has(gs.guardian_id)) {
        guardianMap.set(gs.guardian_id, []);
      }
      guardianMap.get(gs.guardian_id)!.push(gs);
    });

    let processedCount = 0;

    // Process each guardian
    for (const [guardianId, students] of guardianMap) {
      try {
        // Get course progress for all students of this guardian
        const { data: courseProgress, error: progressError } = await supabase
          .from('v_guardian_student_course')
          .select('*')
          .eq('guardian_id', guardianId);

        if (progressError) {
          console.error(`Error fetching progress for guardian ${guardianId}:`, progressError);
          continue;
        }

        // Create weekly digest notification for guardian
        await notifyStudent(guardianId, 'weekly_digest', {
          students: students.map(s => ({
            id: s.student_id,
            name: `${s.first_name} ${s.last_name}`
          })),
          courses: courseProgress || [],
          week_ending: new Date().toISOString()
        });

        processedCount++;
      } catch (error) {
        console.error(`Error processing guardian ${guardianId}:`, error);
        // Continue with other guardians
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
      total_guardians: guardianMap.size,
      message: 'Weekly digest notifications sent successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Weekly digest job error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during weekly digest generation' 
    }, { status: 500 });
  }
}
