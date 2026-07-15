import { SignJWT, jwtVerify } from 'jose';
import { cookies, headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-for-development-do-not-use-in-production'
);

export async function encrypt(payload: any, expiration: string = '1h') {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiration)
    .sign(secret);
}

export async function decrypt(input: string): Promise<any> {
  if (!input) return null;
  try {
    const { payload } = await jwtVerify(input, secret, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error: any) {
    console.error(`[Auth] Decrypt failed: ${error.message}`);
    return null;
  }
}

export async function setSession(
  user: { 
    id: string; 
    tenantId: string; 
    companyId?: string | null;
    email: string | null; 
    role: string; 
    name: string; 
    permissions?: any;
  },
  rememberMe: boolean = false
) {
  // Default to 1 hour, or 7 days if rememberMe is true
  const duration = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 1 * 60 * 60 * 1000;
  const expires = new Date(Date.now() + duration);
  
  const session = await encrypt({ user, expires, rememberMe }, rememberMe ? '7d' : '1h');

  // Save the session in a cookie
  (await cookies()).set('session', session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/', // Explicitly set path to root
  });
}

import { cache } from 'react';

export const getSession = cache(async () => {
  const cookieStore = await cookies();
  let session = cookieStore.get('session')?.value;

  if (!session) {
    try {
      const headersList = await headers();
      const authHeader = headersList.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        session = authHeader.substring(7);
      }
    } catch (e) {
      // Ignore if headers() fails in static render routes
    }
  }

  if (!session) return null;
  const decoded = await decrypt(session);
  return decoded;
});

export async function deleteSession() {
  (await cookies()).delete('session');
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  if (!session) return null;

  // Refresh the session only if it's nearing expiration (e.g., less than 50% time left)
  const parsed = await decrypt(session);
  if (!parsed) return null;

  const now = Date.now();
  const expiry = new Date(parsed.expires).getTime();
  const duration = parsed.rememberMe ? 7 * 24 * 60 * 60 * 1000 : 1 * 60 * 60 * 1000;
  
  // Only refresh if less than half the duration remains
  if (expiry - now > duration / 2) {
    return NextResponse.next();
  }

  const newExpires = new Date(now + duration);
  parsed.expires = newExpires;
  
  const res = NextResponse.next();
  res.cookies.set({
    name: 'session',
    value: await encrypt(parsed, parsed.rememberMe ? '7d' : '1h'),
    httpOnly: true,
    expires: newExpires,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  return res;
}
