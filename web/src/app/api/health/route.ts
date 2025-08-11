import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Test Supabase connection with a simple query
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single();
    
    const supabaseStatus = error ? 'error' : 'ok';
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'ok',
      time: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      supabase: supabaseStatus,
      services: {
        database: supabaseStatus,
        email: process.env.RESEND_API_KEY ? 'configured' : 'disabled',
        monitoring: process.env.SENTRY_DSN ? 'configured' : 'disabled',
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      time: new Date().toISOString(),
      responseTime: `${Date.now() - startTime}ms`,
      supabase: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
