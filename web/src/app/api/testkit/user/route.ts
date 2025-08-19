import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

interface CreateUserOptions {
  minor?: boolean;
  locale?: 'en' | 'es';
  admin?: boolean;
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
    const body: CreateUserOptions = await request.json();
    const { minor = false, locale = 'en', admin = false } = body;
    
    const supabase = getSupabaseAdmin();
    
    // Generate unique test user data
    const timestamp = Date.now();
    const email = `test-${timestamp}@permit-school.test`;
    const password = 'TestPassword123!';
    const firstName = minor ? 'Test' : 'Test';
    const lastName = 'Student';
    const dateOfBirth = minor ? '2010-01-01' : '1990-01-01'; // Minor if born in 2010
    
    // Log the operation
    console.info(JSON.stringify({
      operation: 'testkit_create_user',
      timestamp: new Date().toISOString(),
      email,
      minor,
      locale,
      admin,
      user_agent: request.headers.get('user-agent')
    }));

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { locale }
    });

    if (authError) {
      console.error('Auth user creation error:', authError);
      return NextResponse.json({ 
        error: 'Failed to create auth user',
        details: authError 
      }, { status: 500 });
    }

    const userId = authData.user.id;

    // Create student profile
    const { error: profileError } = await supabase
      .from('student_profiles')
      .insert({
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        dob: dateOfBirth,
        phone: '+15551234567',
        address_line1: '123 Test St',
        address_line2: 'Apt 1',
        city: 'Test City',
        state: 'CA',
        postal_code: '90210',
        guardian_name: minor ? 'Test Guardian' : null,
        guardian_email: minor ? 'guardian@permit-school.test' : null,
        guardian_phone: minor ? '+15551234568' : null
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return NextResponse.json({ 
        error: 'Failed to create student profile',
        details: profileError 
      }, { status: 500 });
    }

    // Set admin role if requested
    if (admin) {
      const { error: roleError } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { role: 'admin', locale }
      });

      if (roleError) {
        console.error('Admin role assignment error:', roleError);
        return NextResponse.json({ 
          error: 'Failed to assign admin role',
          details: roleError 
        }, { status: 500 });
      }
    }

    // Create consent records
    const { error: consentError } = await supabase
      .from('consents')
      .insert([
        {
          user_id: userId,
          consent_type: 'terms',
          granted: true,
          ip_address: '127.0.0.1',
          user_agent: 'Testkit/1.0'
        },
        {
          user_id: userId,
          consent_type: 'privacy',
          granted: true,
          ip_address: '127.0.0.1',
          user_agent: 'Testkit/1.0'
        }
      ]);

    if (consentError) {
      console.error('Consent creation error:', consentError);
      // Don't fail the request for consent errors, just log them
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth,
        minor,
        locale,
        admin,
        guardian_email: minor ? 'guardian@permit-school.test' : null
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Testkit user creation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during user creation' 
    }, { status: 500 });
  }
}
