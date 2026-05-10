import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
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
  const session = cookieStore.get('session')?.value;
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

  // Refresh the session so it doesn't expire
  const parsed = await decrypt(session);
  if (!parsed) return null;

  // If session has a rememberMe flag, refresh for 7 days, else 1 hour
  const duration = parsed.rememberMe ? 7 * 24 * 60 * 60 * 1000 : 1 * 60 * 60 * 1000;
  parsed.expires = new Date(Date.now() + duration);
  
  const res = NextResponse.next();
  res.cookies.set({
    name: 'session',
    value: await encrypt(parsed, parsed.rememberMe ? '7d' : '1h'),
    httpOnly: true,
    expires: parsed.expires,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  return res;
}
