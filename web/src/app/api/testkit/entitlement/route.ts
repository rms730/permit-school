import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

interface EntitlementOptions {
  user_id: string;
  j_code: string;
  active: boolean;
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
    const body: EntitlementOptions = await request.json();
    const { user_id, j_code, active } = body;
    
    const supabase = getSupabaseAdmin();
    
    // Log the operation
    console.info(JSON.stringify({
      operation: 'testkit_entitlement',
      timestamp: new Date().toISOString(),
      user_id,
      j_code,
      active,
      user_agent: request.headers.get('user-agent')
    }));

    // Check if entitlement exists
    const { data: existingEntitlement } = await supabase
      .from('entitlements')
      .select('id')
      .eq('user_id', user_id)
      .eq('j_code', j_code)
      .single();

    if (existingEntitlement) {
      // Update existing entitlement
      const { data: updatedEntitlement, error: updateError } = await supabase
        .from('entitlements')
        .update({ 
          active,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingEntitlement.id)
        .select()
        .single();

      if (updateError) {
        console.error('Entitlement update error:', updateError);
        return NextResponse.json({ 
          error: 'Failed to update entitlement',
          details: updateError 
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        entitlement: updatedEntitlement,
        message: 'Entitlement updated successfully',
        timestamp: new Date().toISOString()
      });
    }

    // Create new entitlement
    const { data: entitlement, error: entitlementError } = await supabase
      .from('entitlements')
      .insert({
        user_id,
        j_code,
        active,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (entitlementError) {
      console.error('Entitlement creation error:', entitlementError);
      return NextResponse.json({ 
        error: 'Failed to create entitlement',
        details: entitlementError 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      entitlement,
      message: 'Entitlement created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Testkit entitlement error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during entitlement creation' 
    }, { status: 500 });
  }
}
