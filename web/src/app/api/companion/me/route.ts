import { NextResponse } from 'next/server';

import { authenticateCompanionRequest } from '@/lib/companionAuth';

export async function GET(req: Request) {
  const auth = await authenticateCompanionRequest(req);
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHENTICATED' }, { status: 401 });
  }

  return NextResponse.json({
    user_id: auth.userId,
    scopes: auth.scopes,
  });
}

