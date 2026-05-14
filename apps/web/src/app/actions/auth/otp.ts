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

  // 3. Store OTP in database
  const verification = await prisma.otpVerification.create({
    data: {
      userId: session.user.id,
      type: 'company_switch',
      otp,
      targetId: targetCompanyId,
      expiresAt,
    },
  });

  // 4. Send email
  if (session.user.email) {
    await sendEmail({
      to: session.user.email,
      subject: 'Security Code: Verify Company Switch',
      html: getCompanySwitchOtpTemplate(otp, company.name),
    });
  }

  return { success: true, verificationId: verification.id };
}

/**
 * Verifies the OTP and performs the company switch.
 */
export async function verifyCompanySwitchOtp(targetCompanyId: string, otp: string) {
  const session = await getSession();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  // 1. Find and validate OTP
  const verification = await prisma.otpVerification.findFirst({
    where: {
      userId: session.user.id,
      type: 'company_switch',
      otp,
      targetId: targetCompanyId,
      isUsed: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!verification) {
    throw new Error('Invalid or expired verification code');
  }

  // 2. Mark OTP as used
  await prisma.otpVerification.update({
    where: { id: verification.id },
    data: { isUsed: true },
  });

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
