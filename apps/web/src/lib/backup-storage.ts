/**
 * Backup Storage Service
 * Uses Supabase Storage for backup file management.
 */

import { createAdminClient } from '@/lib/supabase/server';

const BACKUP_BUCKET = 'backups';

// ─── Ensure Bucket Exists ───────────────────────────────────
async function ensureBucket() {
  const supabase = await createAdminClient();
  
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BACKUP_BUCKET);

  if (!exists) {
    await supabase.storage.createBucket(BACKUP_BUCKET, {
      public: false,
      fileSizeLimit: 500 * 1024 * 1024, // 500MB max
    });
  }
}

// ─── Upload ─────────────────────────────────────────────────
export async function uploadBackup(
  path: string,
  data: Buffer,
  contentType: string = 'application/octet-stream'
): Promise<string> {
  await ensureBucket();
  const supabase = await createAdminClient();

  const { error } = await supabase.storage
    .from(BACKUP_BUCKET)
    .upload(path, data, {
      contentType,
      upsert: false,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);
  return path;
}

// ─── Download ───────────────────────────────────────────────
export async function downloadBackup(path: string): Promise<Buffer> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase.storage
    .from(BACKUP_BUCKET)
    .download(path);

  if (error || !data) throw new Error(`Download failed: ${error?.message || 'No data'}`);
  
  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ─── Delete ─────────────────────────────────────────────────
export async function deleteBackupFile(path: string): Promise<void> {
  const supabase = await createAdminClient();

  const { error } = await supabase.storage
    .from(BACKUP_BUCKET)
    .remove([path]);

  if (error) throw new Error(`Delete failed: ${error.message}`);
}

// ─── Signed Download URL ────────────────────────────────────
export async function getSignedDownloadUrl(
  path: string,
  expiresInSeconds: number = 300 // 5 minutes
): Promise<string> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase.storage
    .from(BACKUP_BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to generate download URL: ${error?.message || 'Unknown error'}`);
  }

  return data.signedUrl;
}

// ─── Storage Usage ──────────────────────────────────────────
export async function getStorageUsage(tenantId: string): Promise<number> {
  const supabase = await createAdminClient();
  const prefix = `${tenantId}/`;

  const { data, error } = await supabase.storage
    .from(BACKUP_BUCKET)
    .list(prefix, { limit: 1000 });

  if (error || !data) return 0;

  // Sum up file sizes
  let totalBytes = 0;
  for (const file of data) {
    if (file.metadata?.size) {
      totalBytes += Number(file.metadata.size);
    }
  }

  return totalBytes;
}
