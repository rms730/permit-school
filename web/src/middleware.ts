import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  // Refresh the session if necessary
  const supabase = createMiddlewareClient({ req, res });
  await supabase.auth.getSession();
  return res;
}

// Optionally limit matcher to pages that need session hydration
export const config = {
  matcher: ['/', '/signin', '/signout', '/admin/:path*'],
};
