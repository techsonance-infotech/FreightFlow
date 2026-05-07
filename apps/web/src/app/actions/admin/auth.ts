'use server';

import { prisma } from '@freightflow/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const ADMIN_JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-for-development-do-not-use-in-production');

export async function adminLogin(email: string, password: any) {
  try {
    const admin = await prisma.platformAdmin.findUnique({
      where: { email }
    });

    if (!admin) {
      return { success: false, error: 'Invalid admin credentials' };
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return { success: false, error: 'Invalid admin credentials' };
    }

    // Create Admin Session
    const token = await new SignJWT({ 
      id: admin.id, 
      email: admin.email, 
      role: admin.role,
      isAdmin: true 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('12h')
      .sign(ADMIN_JWT_SECRET);

    const cookieStore = await cookies();
    cookieStore.set('ff_admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12, // 12 hours
    });

    // Update last login
    await prisma.platformAdmin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() }
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Authentication failed' };
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('ff_admin_session')?.value;

  if (!token) return null;

  try {
    const verified = await jwtVerify(token, ADMIN_JWT_SECRET);
    return verified.payload as any;
  } catch (err) {
    return null;
  }
}

export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete('ff_admin_session');
}
