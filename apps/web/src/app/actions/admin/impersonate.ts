'use server';

import { prisma } from '@freightflow/db';
import { getAdminSession } from './auth';
import { cookies } from 'next/headers';
import { encrypt } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';

export async function impersonateTenant(tenantId: string) {
  const adminSession = await getAdminSession();
  
  if (!adminSession || adminSession.role !== 'super_admin') {
    throw new Error('Unauthorized: Only Super Admins can initiate shadow sessions.');
  }

  // Find the primary owner or first user of the tenant to impersonate
  const targetUser = await prisma.user.findFirst({
    where: { 
      tenantId,
      role: 'owner',
      isActive: true
    }
  }) || await prisma.user.findFirst({
    where: { 
      tenantId,
      isActive: true
    }
  });

  if (!targetUser) {
    throw new Error('Tenant has no active users to shadow.');
  }

  // Generate a standard user session token using the global encryption utility
  // This ensures the secret matches the one used by the dashboard's decrypt logic
  const expires = new Date(Date.now() + 60 * 60 * 2 * 1000);
  const token = await encrypt({
    user: {
      id: targetUser.id,
      email: targetUser.email,
      tenantId: targetUser.tenantId,
      role: targetUser.role,
      name: targetUser.name,
    },
    expires,
    isImpersonated: true,
    impersonatorId: adminSession.id
  }, '2h');

  // Set the standard session cookie
  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 2 // 2 hours
  });

  // Audit log the impersonation
  await prisma.auditLogPlatform.create({
    data: {
      adminId: adminSession.id,
      action: 'SHADOW_MODE_LAUNCH',
      targetTenantId: tenantId,
      payload: {
        targetUserId: targetUser.id,
        timestamp: new Date().toISOString()
      }
    }
  });

  return { success: true, redirectUrl: '/dashboard' };
}
