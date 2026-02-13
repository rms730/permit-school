import { describe, it, expect, vi } from 'vitest';

import { GET } from '../route';

// Mock Supabase admin
vi.mock('@/lib/supabaseAdmin', () => ({
  getSupabaseAdmin: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        limit: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ error: null }),
        })),
      })),
    })),
  })),
}));

// Mock version
vi.mock('@/lib/version', () => ({
  BUILD: 'test-build-123',
}));

describe('/api/health', () => {
  it('returns system status when healthy', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('time');
    expect(data).toHaveProperty('responseTime');
    expect(data).toHaveProperty('supabase');
    expect(data).toHaveProperty('build');
    expect(data).toHaveProperty('services');
    expect(data.status).toBe('ok');
  });

  it('includes required health check fields', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data).toHaveProperty('time');
    expect(data).toHaveProperty('responseTime');
    expect(data).toHaveProperty('build');
    expect(typeof data.time).toBe('string');
    expect(typeof data.responseTime).toBe('string');
    expect(data.build).toBe('test-build-123');
  });

  it('returns proper content type', async () => {
    const response = await GET();
    
    expect(response.headers.get('content-type')).toBe('application/json');
  });

  it('handles database errors gracefully', async () => {
    // Mock Supabase to return an error
    const { getSupabaseAdmin } = await import('@/lib/supabaseAdmin');
    vi.mocked(getSupabaseAdmin).mockImplementationOnce(() => ({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          limit: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ error: new Error('Database error') }),
          })),
        })),
      })),
    }));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.supabase).toBe('error');
  });

  it('handles exceptions gracefully', async () => {
    // Mock Supabase to throw an exception
    const { getSupabaseAdmin } = await import('@/lib/supabaseAdmin');
    vi.mocked(getSupabaseAdmin).mockImplementationOnce(() => {
      throw new Error('Connection failed');
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.status).toBe('error');
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Connection failed');
  });
});
