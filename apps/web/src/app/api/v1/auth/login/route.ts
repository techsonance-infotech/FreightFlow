import { NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import bcrypt from 'bcryptjs';
import { encrypt } from '@/lib/auth-utils';
import { z } from 'zod';
import { redis } from '@/lib/redis';

const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Please enter both a valid email and password.' }, { status: 400 });
    }
    const { email, password, rememberMe } = parsed.data;

    // Basic rate limiting
    if (redis) {
      const ip = request.headers.get('x-forwarded-for') || 'unknown';
      const rateLimitKey = `ratelimit:login:${ip}:${email}`;
      const attempts = await redis.incr(rateLimitKey);
      if (attempts === 1) {
        await redis.expire(rateLimitKey, 60 * 15); // 15 minutes window
      }
      if (attempts > 10) {
        return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 });
      }
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

    const expires = new Date(Date.now() + (rememberMe ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000));
    const token = await encrypt({ user: userPayload, expires, rememberMe }, rememberMe ? '7d' : '1h');

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
