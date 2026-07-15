import { NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import bcrypt from 'bcryptjs';
import { encrypt } from '@/lib/auth-utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json({ error: 'Please enter both email and password.' }, { status: 400 });
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // Check verification status
    if (!user.isEmailVerified) {
      return NextResponse.json({
        error: 'Your email address is not verified. Please check your inbox for the verification link.',
        isUnverified: true,
        email: user.email
      }, { status: 403 });
    }

    // Check active status
    if (!user.isActive) {
      return NextResponse.json({ error: 'Your account has been deactivated. Please contact support.' }, { status: 403 });
    }

    // Check company active status
    if (user.company && !user.company.isActive) {
      return NextResponse.json({ error: 'Your organization has been suspended. Please contact your administrator.' }, { status: 403 });
    }

    // Create session payload
    const userPayload = {
      id: user.id,
      tenantId: user.tenantId,
      companyId: user.companyId,
      email: user.email,
      role: user.role,
      name: user.name,
      permissions: user.permissions,
    };

    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days expiration for mobile session
    const token = await encrypt({ user: userPayload, expires, rememberMe: true }, '7d');

    return NextResponse.json({
      success: true,
      token,
      user: userPayload
    });
  } catch (error: any) {
    console.error('[API_AUTH_LOGIN]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
