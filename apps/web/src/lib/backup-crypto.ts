/**
 * Backup Crypto Utilities
 * AES-256-GCM encryption/decryption and SHA-256 checksums.
 * Encryption key is auto-generated and stored as an environment variable.
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

// ─── Key Management ─────────────────────────────────────────

/**
 * Get or auto-generate the backup encryption key.
 * Uses BACKUP_ENCRYPTION_KEY env var if available, otherwise generates one.
 */
function getEncryptionKey(): Buffer {
  let keyHex = process.env.BACKUP_ENCRYPTION_KEY;

  if (!keyHex) {
    // Auto-generate and log it (should be persisted to env in production)
    keyHex = crypto.randomBytes(KEY_LENGTH).toString('hex');
    console.warn(
      '[Backup Crypto] No BACKUP_ENCRYPTION_KEY found. Auto-generated key:',
      keyHex,
      '\nPlease set this in your environment variables for persistence.'
    );
    // Cache in process env for the current session
    process.env.BACKUP_ENCRYPTION_KEY = keyHex;
  }

  return Buffer.from(keyHex, 'hex');
}

// ─── Encryption ─────────────────────────────────────────────

/**
 * Encrypt a buffer using AES-256-GCM.
 * Returns: IV (16 bytes) + Auth Tag (16 bytes) + Ciphertext
 */
export function encryptBuffer(data: Buffer): Buffer {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Pack: IV + Auth Tag + Ciphertext
  return Buffer.concat([iv, authTag, encrypted]);
}

/**
 * Decrypt a buffer that was encrypted with encryptBuffer.
 * Expects: IV (16 bytes) + Auth Tag (16 bytes) + Ciphertext
 */
export function decryptBuffer(encryptedData: Buffer): Buffer {
  const key = getEncryptionKey();

  const iv = encryptedData.subarray(0, IV_LENGTH);
  const authTag = encryptedData.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = encryptedData.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

// ─── Checksum ───────────────────────────────────────────────

/**
 * Compute SHA-256 hash of a buffer.
 */
export function computeChecksum(data: Buffer): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Verify SHA-256 checksum of a buffer.
 */
export function verifyChecksum(data: Buffer, expectedHash: string): boolean {
  const actualHash = computeChecksum(data);
  return crypto.timingSafeEqual(
    Buffer.from(actualHash, 'hex'),
    Buffer.from(expectedHash, 'hex')
  );
}
