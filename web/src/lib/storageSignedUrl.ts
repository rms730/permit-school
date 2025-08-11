import { createClient } from '@supabase/supabase-js';

/**
 * Create a short-lived signed URL for downloading a file from storage
 * @param bucket - the storage bucket name
 * @param path - the file path within the bucket
 * @param expiresIn - expiration time in seconds (default: 3600 = 1 hour)
 * @returns signed URL or null if error
 */
export async function createSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error creating signed URL:', error);
    return null;
  }
}

/**
 * Create a signed URL for uploading a file to storage
 * @param bucket - the storage bucket name
 * @param path - the file path within the bucket
 * @param expiresIn - expiration time in seconds (default: 3600 = 1 hour)
 * @returns signed URL or null if error
 */
export async function createSignedUploadUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

          const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUploadUrl(path);

    if (error) {
      console.error('Error creating signed upload URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error creating signed upload URL:', error);
    return null;
  }
}
