'use server';

import { prisma } from '@freightflow/db';
import { getSession, setSession } from '@/lib/auth-utils';
import { sendEmail, getCompanySwitchOtpTemplate } from '@/lib/email';
import { revalidatePath } from 'next/cache';

/**
 * Generates and sends an OTP for company switching.
 */
export async function requestCompanySwitchOtp(targetCompanyId: string) {
  const session = await getSession();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  // 1. Verify user belongs to the tenant of the target company
  const company = await prisma.company.findFirst({
    where: {
      id: targetCompanyId,
      tenantId: session.user.tenantId,
      isActive: true,
    },
  });

  if (!company) {
    throw new Error('Target company not found or inactive');
  }

  // 2. Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // 3. Store OTP in database using raw SQL as a workaround for Prisma client sync issues
  const verificationId = crypto.randomUUID();
  await prisma.$executeRawUnsafe(
    `INSERT INTO otp_verifications (id, user_id, type, otp, target_id, expires_at, is_used, created_at)
     VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, NOW())`,
    verificationId,
    session.user.id,
    'company_switch',
    otp,
    targetCompanyId,
    expiresAt,
    false
  );

  // 4. Send email
  if (session.user.email) {
    await sendEmail({
      to: session.user.email,
      subject: 'Security Code: Verify Company Switch',
      html: getCompanySwitchOtpTemplate(otp, company.name),
    });
  }

  return { success: true, verificationId };
}

/**
 * Verifies the OTP and performs the company switch.
 */
export async function verifyCompanySwitchOtp(targetCompanyId: string, otp: string) {
  const session = await getSession();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  // 1. Find and validate OTP using raw SQL
  const results = await prisma.$queryRawUnsafe<any[]>(
    `SELECT id FROM otp_verifications 
     WHERE user_id = $1::uuid AND type = $2 AND otp = $3 AND target_id = $4 AND is_used = false AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    session.user.id,
    'company_switch',
    otp,
    targetCompanyId
  );
  
  const verification = results[0];

  if (!verification) {
    throw new Error('Invalid or expired verification code');
  }

  // 2. Mark OTP as used
  await prisma.$executeRawUnsafe(
    `UPDATE otp_verifications SET is_used = true WHERE id = $1::uuid`,
    verification.id
  );

  // 3. Perform the switch logic (reused from organizations.ts)
  const company = await prisma.company.findFirst({
    where: {
      id: targetCompanyId,
      tenantId: session.user.tenantId,
      isActive: true,
    },
  });

  if (!company) {
    throw new Error('Target company no longer available');
  }

  // 4. Update the session
  await setSession({
    ...session.user,
    companyId: company.id,
  }, session.rememberMe);

  // 5. Audit Log the change
  await prisma.auditLog.create({
    data: {
      tenantId: session.user.tenantId,
      companyId: company.id,
      userId: session.user.id,
      action: 'switch_company',
      entityType: 'User',
      entityId: session.user.id,
      changes: {
        from: session.user.companyId,
        to: company.id,
        method: 'otp_verified'
      },
    },
  });

  revalidatePath('/dashboard');
  return { success: true };
}
