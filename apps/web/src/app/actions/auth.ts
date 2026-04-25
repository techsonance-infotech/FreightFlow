'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@freightflow/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendEmail, getVerificationEmailTemplate, getConfirmationEmailTemplate, getOtpEmailTemplate, getResetSuccessEmailTemplate } from '@/lib/email';
import { setSession, deleteSession } from '@/lib/auth-utils';

// ─── LOGIN ──────────────────────────────────────────────────
export async function login(_prevState: unknown, formData: FormData) {
  const email = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Please enter both email and password.' };
  }

  // Find user in application database
  const user = await prisma.user.findUnique({
    where: { email },
    include: { company: true },
  });

  if (!user || !user.passwordHash) {
    return { error: 'Invalid email or password.' };
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return { error: 'Invalid email or password.' };
  }

  // Check verification status
  if (!user.isEmailVerified) {
    return { 
      error: 'Your email address is not verified. Please check your inbox for the verification link.',
      isUnverified: true,
      email: user.email
    };
  }

  // Check active status
  if (!user.isActive) {
    return { error: 'Your account has been deactivated. Please contact support.' };
  }

  // Extract remember me
  const rememberMe = formData.get('remember_me') === 'on';

  // Set session cookie
  await setSession({
    id: user.id,
    tenantId: user.tenantId,
    companyId: user.companyId,
    email: user.email,
    role: user.role,
    name: user.name,
  }, rememberMe);

  // If no company is set up, redirect to onboarding
  if (!user.companyId) {
    redirect('/onboarding');
  }

  redirect('/dashboard');
}

// ─── REGISTER ───────────────────────────────────────────────
export async function register(_prevState: unknown, formData: FormData) {
  const firstName = (formData.get('firstName') as string)?.trim();
  const lastName = (formData.get('lastName') as string)?.trim();
  const username = (formData.get('username') as string)?.trim();
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const phone = (formData.get('phone') as string)?.trim();
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  // ── Validation ──
  if (!firstName || !lastName || !username || !email || !phone || !password || !confirmPassword) {
    return { error: 'All fields are mandatory.' };
  }

  if (firstName.length < 2 || lastName.length < 2) {
    return { error: 'Name must be at least 2 characters.' };
  }

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return { error: 'Username must be 3-20 characters (letters, numbers, underscores).' };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Please enter a valid email address.' };
  }

  if (!/^\d{10}$/.test(phone)) {
    return { error: 'Phone number must be exactly 10 digits.' };
  }

  if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { error: 'Password must be 8+ chars with uppercase, lowercase, number, and symbol.' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  // ── Unique Checks ──
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { name: username },
        { email: email },
        { phone: phone }
      ]
    },
  });

  if (existingUser) {
    if (existingUser.name === username) return { error: 'Username is already taken.' };
    if (existingUser.email === email) return { error: 'Email is already registered.' };
    if (existingUser.phone === phone) return { error: 'Phone number is already registered.' };
  }

  // ── Provision Tenant + User ──
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const placeholderTenantName = `${firstName}'s Workspace`;
    const slug = firstName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const uniqueSlug = `${slug}-${Date.now().toString(36)}`;

    // 7-day trial period
    const trialExpiresAt = new Date();
    trialExpiresAt.setDate(trialExpiresAt.getDate() + 7);

    await prisma.$transaction(async (tx) => {
      // 1. Create Tenant
      const tenant = await tx.tenant.create({
        data: {
          name: placeholderTenantName,
          slug: uniqueSlug,
          plan: 'trial',
          status: 'active',
          licenseExpiresAt: trialExpiresAt,
        },
      });

      // 2. Create User
      await tx.user.create({
        data: {
          tenantId: tenant.id,
          name: `${firstName} ${lastName}`,
          email: email,
          phone: phone,
          passwordHash,
          role: 'tenant_owner',
          isActive: true,
          isEmailVerified: false,
          verificationToken,
        },
      });

      // 3. Seed default modules
      const defaultModules = [
        'mod_core_accounting',
        'mod_lr_management',
        'mod_pallet_management',
        'mod_trip_management',
      ];

      await tx.tenantModule.createMany({
        data: defaultModules.map((moduleKey) => ({
          tenantId: tenant.id,
          moduleKey,
          isEnabled: true,
        })),
      });
    });

    // 4. Send Verification Email
    await sendEmail({
      to: email,
      subject: 'Verify your FreightFlow account',
      html: getVerificationEmailTemplate(`${firstName} ${lastName}`, verificationToken),
    });

    return {
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
    };
  } catch (error) {
    console.error('[Register] Error:', error);
    return { error: 'Registration failed. Please try again.' };
  }
}

// ─── VERIFY EMAIL ───────────────────────────────────────────
export async function verifyEmail(token: string) {
  if (!token) return { error: 'Invalid verification link.' };

  try {
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      return { error: 'Invalid or expired verification link.' };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verificationToken: null,
      },
    });

    // Send confirmation email
    await sendEmail({
      to: user.email!,
      subject: 'Account Verified — Welcome to FreightFlow',
      html: getConfirmationEmailTemplate(user.name),
    });

    return { success: true, message: 'Your email has been verified successfully.' };
  } catch (error) {
    console.error('[VerifyEmail] Error:', error);
    return { error: 'Verification failed. Please try again.' };
  }
}

// ─── FORGOT PASSWORD (OTP) ──────────────────────────────────
export async function forgotPassword(_prevState: unknown, formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase();

  if (!email) return { error: 'Please enter your email address.' };

  console.log(`[ForgotPassword] Request for: ${email}`);

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    console.log(`[ForgotPassword] User found: ${user.id}`);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: otp,
        otpExpires: expires,
      },
    });

    try {
      await sendEmail({
        to: email,
        subject: 'Your Password Reset OTP',
        html: getOtpEmailTemplate(otp),
      });
      console.log(`[ForgotPassword] OTP Email sent to ${email}`);
    } catch (err: any) {
      console.error(`[ForgotPassword] Failed to send email: ${err.message}`);
    }
  } else {
    console.warn(`[ForgotPassword] No user found with email: ${email}`);
  }

  // Always return success for security
  return {
    success: true,
    message: 'If an account exists, a 6-digit OTP has been sent to your email.',
  };
}


// ─── VERIFY OTP ─────────────────────────────────────────────
export async function verifyOtp(email: string, otp: string) {
  if (!email || !otp) return { error: 'Email and OTP are required.' };

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.otpCode !== otp || !user.otpExpires || user.otpExpires < new Date()) {
    return { error: 'Invalid or expired OTP.' };
  }

  return { success: true, message: 'OTP verified successfully.' };
}

// ─── RESET PASSWORD ─────────────────────────────────────────
export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string;
  const otp = formData.get('otp') as string;
  const newPassword = formData.get('password') as string;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.otpCode !== otp || !user.otpExpires || user.otpExpires < new Date()) {
    return { error: 'Invalid or expired OTP.' };
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      otpCode: null,
      otpExpires: null,
    },
  });

  // Send success confirmation email
  await sendEmail({
    to: email,
    subject: 'Password Reset Successful — FreightFlow',
    html: getResetSuccessEmailTemplate(user.name),
  });

  return { success: true, message: 'Password reset successful. Please log in.' };
}

// ─── LOGOUT ─────────────────────────────────────────────────
export async function logout() {
  await deleteSession();
  redirect('/login');
}
// ─── RESEND VERIFICATION ────────────────────────────────────
export async function resendVerification(email: string) {
  if (!email) return { error: 'Email is required.' };

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: 'User not found.' };
    }

    if (user.isEmailVerified) {
      return { error: 'Email is already verified.' };
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken },
    });

    await sendEmail({
      to: email,
      subject: 'Verify your FreightFlow account (Resend)',
      html: getVerificationEmailTemplate(user.name, verificationToken),
    });

    return { success: true, message: 'A new verification link has been sent to your email.' };
  } catch (error) {
    console.error('[ResendVerification] Error:', error);
    return { error: 'Failed to resend verification email.' };
  }
}
