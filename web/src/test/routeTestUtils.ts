/**
 * Utilities for testing Next.js API routes
 */

export async function callRoute(
  handler: (req: Request, ctx?: any) => Promise<Response>,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  url = 'http://localhost/test',
  init?: RequestInit,
  ctx?: any
) {
  const req = new Request(url, { method, ...(init || {}) });
  const res = await handler(req as any, ctx);
  const clone = res.clone();
  const json = await safeJson(clone);
  return { res, json, status: res.status };
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Mock Next.js app router APIs for route testing
 */
export const mockNextRouter = {
  cookies: vi.fn(() => ({
    get: vi.fn((name: string) => ({ name, value: 'test-cookie' })),
    set: vi.fn(),
    delete: vi.fn(),
  })),
  headers: vi.fn(() => new Map([['x-test', '1']])),
  redirect: vi.fn(),
};

/**
 * Create a mock Request with auth headers
 */
export function createAuthRequest(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  url = 'http://localhost/test',
  body?: any
) {
  const headers = new Headers({
    'Authorization': 'Bearer test-token',
    'Content-Type': 'application/json',
  });

  const init: RequestInit = {
    method,
    headers,
  };

  if (body) {
    init.body = JSON.stringify(body);
  }

  return new Request(url, init);
}

/**
 * Create a mock Request without auth
 */
export function createUnauthRequest(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  url = 'http://localhost/test',
  body?: any
) {
  const headers = new Headers({
    'Content-Type': 'application/json',
  });

  const init: RequestInit = {
    method,
    headers,
  };

  if (body) {
    init.body = JSON.stringify(body);
  }

  return new Request(url, init);
}
