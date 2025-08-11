import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

interface SeatTimeOptions {
  user_id: string;
  j_code: string;
  course_code: string;
  unit_id?: string; // Optional: specific unit, otherwise all units
  total_ms: number; // Total milliseconds to add
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
    const body: SeatTimeOptions = await request.json();
    const { user_id, j_code, course_code, unit_id, total_ms } = body;
    
    const supabase = getSupabaseAdmin();
    
    // Log the operation
    console.info(JSON.stringify({
      operation: 'testkit_seat_time',
      timestamp: new Date().toISOString(),
      user_id,
      j_code,
      course_code,
      unit_id,
      total_ms,
      user_agent: request.headers.get('user-agent')
    }));

    // Get course ID
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('j_code', j_code)
      .eq('course_code', course_code)
      .single();

    if (courseError || !courseData) {
      console.error('Course lookup error:', courseError);
      return NextResponse.json({ 
        error: 'Course not found',
        details: courseError 
      }, { status: 404 });
    }

    let unitsToProcess: string[] = [];

    if (unit_id) {
      // Specific unit
      unitsToProcess = [unit_id];
    } else {
      // All units for the course
      const { data: unitsData, error: unitsError } = await supabase
        .from('course_units')
        .select('id')
        .eq('course_id', courseData.id)
        .order('unit_no');

      if (unitsError) {
        console.error('Units lookup error:', unitsError);
        return NextResponse.json({ 
          error: 'Failed to get course units',
          details: unitsError 
        }, { status: 500 });
      }

      unitsToProcess = unitsData.map(unit => unit.id);
    }

    if (unitsToProcess.length === 0) {
      return NextResponse.json({ 
        error: 'No units found for course' 
      }, { status: 404 });
    }

    // Calculate time per unit (distribute evenly)
    const timePerUnit = Math.floor(total_ms / unitsToProcess.length);
    const events: any[] = [];

    // Create seat time events for each unit
    for (const unitId of unitsToProcess) {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + timePerUnit);

      events.push({
        user_id,
        unit_id: unitId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        total_ms: timePerUnit,
        is_active: false, // Mark as completed
        created_at: startTime.toISOString()
      });
    }

    // Insert seat time events
    const { data: seatTimeEvents, error: seatTimeError } = await supabase
      .from('seat_time_events')
      .insert(events)
      .select();

    if (seatTimeError) {
      console.error('Seat time creation error:', seatTimeError);
      return NextResponse.json({ 
        error: 'Failed to create seat time events',
        details: seatTimeError 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      seat_time_events: seatTimeEvents,
      total_ms_added: total_ms,
      units_processed: unitsToProcess.length,
      message: 'Seat time events created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Testkit seat time error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during seat time creation' 
    }, { status: 500 });
  }
}
