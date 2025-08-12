import { supabase } from '@/lib/supabaseClient';

export interface SignedUrlResult {
  url: string;
  expiresAt: Date;
}

/**
 * Creates a signed URL for avatar access
 * @param avatarPath - The storage path (e.g., 'avatars/user-id/timestamp.jpg')
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Promise with signed URL and expiry
 */
export async function createAvatarSignedUrl(
  avatarPath: string,
  expiresIn: number = 3600
): Promise<SignedUrlResult> {
  try {
    const { data, error } = await supabase.storage
      .from('avatars')
      .createSignedUrl(avatarPath, expiresIn);

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    if (!data?.signedUrl) {
      throw new Error('No signed URL returned');
    }

    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    return {
      url: data.signedUrl,
      expiresAt,
    };
  } catch (error) {
    console.error('Error creating signed URL:', error);
    throw error;
  }
}

/**
 * Extracts the file path from a full avatar URL
 * @param avatarUrl - Full avatar URL or storage path
 * @returns The storage path for the avatar
 */
export function extractAvatarPath(avatarUrl: string): string {
  // If it's already a storage path (doesn't start with http), return as is
  if (!avatarUrl.startsWith('http')) {
    return avatarUrl;
  }

  // Extract path from Supabase storage URL
  const url = new URL(avatarUrl);
  const pathParts = url.pathname.split('/');
  
  // Find the index after 'storage/v1/object/public/avatars/'
  const avatarsIndex = pathParts.findIndex(part => part === 'avatars');
  if (avatarsIndex !== -1 && avatarsIndex + 1 < pathParts.length) {
    return pathParts.slice(avatarsIndex + 1).join('/');
  }

  // Fallback: return the full path after 'avatars/'
  const avatarsMatch = url.pathname.match(/\/avatars\/(.+)/);
  return avatarsMatch ? avatarsMatch[1] : avatarUrl;
}

/**
 * Checks if a signed URL is expired
 * @param expiresAt - Expiration date
 * @returns True if expired
 */
export function isSignedUrlExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

/**
 * Refreshes a signed URL if it's expired or about to expire
 * @param avatarPath - The storage path
 * @param currentExpiresAt - Current expiration date
 * @param bufferMinutes - Buffer time in minutes before considering expired (default: 5)
 * @returns Promise with new signed URL or null if not needed
 */
export async function refreshSignedUrlIfNeeded(
  avatarPath: string,
  currentExpiresAt: Date,
  bufferMinutes: number = 5
): Promise<SignedUrlResult | null> {
  const bufferMs = bufferMinutes * 60 * 1000;
  const shouldRefresh = new Date() > new Date(currentExpiresAt.getTime() - bufferMs);

  if (shouldRefresh) {
    return await createAvatarSignedUrl(avatarPath);
  }

  return null;
}
