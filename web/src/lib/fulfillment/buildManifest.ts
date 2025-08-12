import crypto from 'crypto';

export interface ManifestData {
  batchId: string;
  jCode: string;
  counts: {
    queued: number;
    exported: number;
    mailed: number;
    void: number;
    reprint: number;
  };
  csv: {
    filename: string;
    sha256: string;
  };
  createdAt: string;
}

export interface Manifest {
  batchId: string;
  j_code: string;
  counts: {
    queued: number;
    exported: number;
    mailed: number;
    void: number;
    reprint: number;
  };
  csv: {
    filename: string;
    sha256: string;
  };
  createdAt: string;
  hmac: string;
}

/**
 * Build manifest JSON with HMAC-SHA256 signature
 */
export function buildManifest(
  data: ManifestData,
  hmacSecret: string
): Manifest {
  const manifest: Omit<Manifest, 'hmac'> = {
    batchId: data.batchId,
    j_code: data.jCode,
    counts: data.counts,
    csv: data.csv,
    createdAt: data.createdAt
  };

  // Create HMAC signature
  const manifestString = JSON.stringify(manifest, Object.keys(manifest).sort());
  const hmac = crypto
    .createHmac('sha256', hmacSecret)
    .update(manifestString)
    .digest('hex');

  return {
    ...manifest,
    hmac
  };
}

/**
 * Verify manifest HMAC signature
 */
export function verifyManifest(manifest: Manifest, hmacSecret: string): boolean {
  const { hmac, ...manifestWithoutHmac } = manifest;
  const manifestString = JSON.stringify(manifestWithoutHmac, Object.keys(manifestWithoutHmac).sort());
  const expectedHmac = crypto
    .createHmac('sha256', hmacSecret)
    .update(manifestString)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(hmac, 'hex'),
    Buffer.from(expectedHmac, 'hex')
  );
}

/**
 * Calculate SHA256 hash of CSV content
 */
export function calculateCsvHash(csvContent: string): string {
  return crypto.createHash('sha256').update(csvContent, 'utf8').digest('hex');
}
