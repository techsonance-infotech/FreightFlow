'use server';

/**
 * Backup OTP Service
 * Reuses the existing otp_verifications table and existing email infrastructure.
 * Adds rate limiting and attempt tracking via the same table pattern.
 */

import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';
import { sendEmail } from '@/lib/email';
import { encrypt, decrypt } from '@/lib/auth-utils';
import crypto from 'crypto';

// ─── Constants ──────────────────────────────────────────────
const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const MAX_OTP_REQUESTS_PER_WINDOW = 3;
const OTP_RATE_WINDOW_MINUTES = 15;

export type BackupOtpPurpose =
  | 'BACKUP_CREATE'
  | 'BACKUP_DELETE'
  | 'BACKUP_DOWNLOAD'
  | 'BACKUP_RESTORE'
  | 'BACKUP_SCHEDULE_CHANGE';

const PURPOSE_LABELS: Record<BackupOtpPurpose, string> = {
  BACKUP_CREATE: 'Create Backup',
  BACKUP_DELETE: 'Delete Backup',
  BACKUP_DOWNLOAD: 'Download Backup',
  BACKUP_RESTORE: 'Restore Backup',
  BACKUP_SCHEDULE_CHANGE: 'Change Backup Schedule',
};

// ─── Generate Cryptographically Secure OTP ──────────────────
function generateSecureOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// ─── OTP Email Template ─────────────────────────────────────
function getBackupOtpEmailTemplate(name: string, otp: string, operation: string): string {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
      <div style="background-color: #0f172a; padding: 48px 32px; text-align: center;">
        <div style="display: inline-block; padding: 12px; background: rgba(59, 130, 246, 0.1); border-radius: 16px; margin-bottom: 24px;">
          <span style="color: #3b82f6; font-size: 24px; font-weight: 800; letter-spacing: -0.05em;">FF</span>
        </div>
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">Backup & Restore Verification Code</h1>
        <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Security Verification</p>
      </div>
      
      <div style="padding: 40px; background-color: #ffffff;">
        <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin-bottom: 8px;">
          Hello ${name},
        </p>
        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          A request has been made to <strong>${operation}</strong>. To ensure the security of your data, please use the following verification code:
        </p>
        
        <div style="background: linear-gradient(to bottom, #f8fafc, #f1f5f9); border: 1px solid #e2e8f0; border-radius: 20px; padding: 40px 20px; text-align: center; margin-bottom: 32px;">
          <p style="color: #64748b; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2em; margin: 0 0 16px 0;">Your Verification Code</p>
          <div style="display: inline-block;">
            <span style="font-size: 48px; font-weight: 900; color: #0f172a; letter-spacing: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">${otp}</span>
          </div>
        </div>
        
        <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 16px 20px; border-radius: 8px; margin-bottom: 32px;">
          <p style="color: #9a3412; font-size: 13px; font-weight: 600; margin: 0;">
            ⏱️ This code expires in ${OTP_EXPIRY_MINUTES} minutes.
          </p>
        </div>
        
        <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
          If you didn't request this operation, please ignore this email and ensure your account credentials are secure.
        </p>
      </div>
      
      <div style="background-color: #f8fafc; padding: 32px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="color: #94a3b8; font-size: 11px; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.05em;">FreightFlow Security</p>
        <p style="color: #cbd5e1; font-size: 10px; margin: 0;">&copy; 2026 FreightFlow. All rights reserved.</p>
      </div>
    </div>
  `;
}

// ─── Request Backup OTP ─────────────────────────────────────
export async function requestBackupOTP(purpose: BackupOtpPurpose) {
  const session = await getSession();
  if (!session?.user) throw new Error('Unauthorized');

  const { id: userId, tenantId, email, name, role } = session.user;

  // RBAC check
  if (!['tenant_owner', 'super_admin'].includes(role)) {
    throw new Error('Insufficient permissions');
  }

  if (!email) throw new Error('No email address configured for your account');

  // Rate limiting: check how many OTPs were requested in the last window
  const windowStart = new Date(Date.now() - OTP_RATE_WINDOW_MINUTES * 60 * 1000);
  const recentRequests = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT COUNT(*) as count FROM otp_verifications 
     WHERE user_id = $1::uuid AND type LIKE 'backup_%' AND created_at > $2`,
    userId,
    windowStart
  );

  const requestCount = Number(recentRequests[0]?.count || 0);
  if (requestCount >= MAX_OTP_REQUESTS_PER_WINDOW) {
    throw new Error(`Too many OTP requests. Please wait ${OTP_RATE_WINDOW_MINUTES} minutes before trying again.`);
  }

  // Check lockout: count recent failed verifications for this purpose
  const lockoutCheck = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT COUNT(*) as count FROM otp_verifications 
     WHERE user_id = $1::uuid AND type = $2 AND is_used = true 
     AND created_at > $3`,
    userId,
    `backup_${purpose.toLowerCase()}`,
    new Date(Date.now() - LOCKOUT_MINUTES * 60 * 1000)
  );

  const failedCount = Number(lockoutCheck[0]?.count || 0);
  if (failedCount >= MAX_OTP_ATTEMPTS) {
    throw new Error(`Too many failed attempts. Please wait ${LOCKOUT_MINUTES} minutes before trying again.`);
  }

  // Generate secure OTP
  const otp = generateSecureOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  const verificationId = crypto.randomUUID();

  // Store OTP in existing otp_verifications table
  await prisma.$executeRawUnsafe(
    `INSERT INTO otp_verifications (id, user_id, type, otp, target_id, expires_at, is_used, created_at)
     VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, NOW())`,
    verificationId,
    userId,
    `backup_${purpose.toLowerCase()}`,
    otp,
    tenantId, // store tenantId as target_id for tenant isolation
    expiresAt,
    false
  );

  // Send email using existing email infrastructure
  await sendEmail({
    to: email,
    subject: 'Backup & Restore Verification Code',
    html: getBackupOtpEmailTemplate(name, otp, PURPOSE_LABELS[purpose]),
  });

  return { success: true, verificationId };
}

// ─── Verify Backup OTP ──────────────────────────────────────
export async function verifyBackupOTP(purpose: BackupOtpPurpose, otpCode: string) {
  const session = await getSession();
  if (!session?.user) throw new Error('Unauthorized');

  const { id: userId, tenantId, role } = session.user;

  // RBAC check
  if (!['tenant_owner', 'super_admin'].includes(role)) {
    throw new Error('Insufficient permissions');
  }

  if (!otpCode || otpCode.length !== 6) {
    throw new Error('Please enter a valid 6-digit verification code.');
  }

  const otpType = `backup_${purpose.toLowerCase()}`;

  // Find the latest unused OTP for this user/purpose
  const results = await prisma.$queryRawUnsafe<any[]>(
    `SELECT id, otp FROM otp_verifications 
     WHERE user_id = $1::uuid AND type = $2 AND target_id = $3 AND is_used = false AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    userId,
    otpType,
    tenantId
  );

  const verification = results[0];

  if (!verification) {
    throw new Error('No valid verification code found. Please request a new one.');
  }

  // Check recent failed attempts (used OTPs for this purpose within lockout window)
  const recentFails = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT COUNT(*) as count FROM otp_verifications 
     WHERE user_id = $1::uuid AND type = $2 AND is_used = true 
     AND created_at > $3`,
    userId,
    otpType,
    new Date(Date.now() - LOCKOUT_MINUTES * 60 * 1000)
  );
  const failedAttempts = Number(recentFails[0]?.count || 0);

  if (failedAttempts >= MAX_OTP_ATTEMPTS) {
    throw new Error(`Too many failed attempts. Please wait ${LOCKOUT_MINUTES} minutes and request a new code.`);
  }

  // Verify OTP
  if (verification.otp !== otpCode) {
    // Mark this OTP as used (consumed by a failed attempt)
    await prisma.$executeRawUnsafe(
      `UPDATE otp_verifications SET is_used = true WHERE id = $1::uuid`,
      verification.id
    );

    const remaining = MAX_OTP_ATTEMPTS - (failedAttempts + 1);
    if (remaining <= 0) {
      throw new Error(`Too many failed attempts. Your verification has been locked for ${LOCKOUT_MINUTES} minutes.`);
    }
    throw new Error(`Invalid verification code. ${remaining} attempt(s) remaining.`);
  }

  // OTP is valid — mark as used
  await prisma.$executeRawUnsafe(
    `UPDATE otp_verifications SET is_used = true WHERE id = $1::uuid`,
    verification.id
  );

  // Create a temporary authorization token (5-minute validity)
  const authToken = await encrypt(
    { userId, tenantId, purpose, verified: true },
    '5m'
  );

  return { success: true, authToken };
}

// ─── Validate Authorization Token ───────────────────────────
export async function validateBackupAuthToken(token: string, expectedPurpose: BackupOtpPurpose) {
  try {
    const payload = await decrypt(token);
    if (!payload || !payload.verified || payload.purpose !== expectedPurpose) {
      return null;
    }
    return { userId: payload.userId, tenantId: payload.tenantId };
  } catch {
    return null;
  }
}
