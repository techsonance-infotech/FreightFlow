'use server';

import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { recordAuditLog } from '@/lib/audit';

export async function inviteUser(data: any) {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) throw new Error('Unauthorized');

  const { name, email, role, branchId, password } = data;

  if (!email || !role) throw new Error('Email and Role are required');

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('A user with this email already exists.');

  const hashedPassword = await bcrypt.hash(password || 'FF@User2024', 10);

  const newUser = await prisma.user.create({
    data: {
      tenantId: session.user.tenantId,
      companyId: session.user.companyId,
      name,
      email,
      role,
      branchId: branchId === 'all' ? null : branchId,
      passwordHash: hashedPassword,
      isActive: true,
    },
  });

  await recordAuditLog({
    action: 'user.created',
    entityType: 'User',
    entityId: newUser.id,
    changes: { name, email, role, branchId },
  });

  revalidatePath('/dashboard/settings/users');
  return { success: true };
}

export async function updateUserRole(userId: string, role: string) {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) throw new Error('Unauthorized');

  // Prevent changing own role if owner
  if (userId === session.user.id && session.user.role === 'owner') {
    throw new Error('Owner role cannot be changed by oneself.');
  }

  const before = await prisma.user.findUnique({ where: { id: userId }, select: { role: true, name: true, email: true } });

  await prisma.user.update({
    where: { 
      id: userId,
      companyId: session.user.companyId 
    },
    data: { role },
  });

  await recordAuditLog({
    action: 'user.role_changed',
    entityType: 'User',
    entityId: userId,
    changes: { 
      previousRole: before?.role, 
      newRole: role,
      targetUser: { name: before?.name, email: before?.email },
    },
  });

  revalidatePath('/dashboard/settings/users');
}

export async function toggleUserStatus(userId: string, isActive: boolean) {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) throw new Error('Unauthorized');

  if (userId === session.user.id) throw new Error('Cannot deactivate your own account.');

  const before = await prisma.user.findUnique({ where: { id: userId }, select: { isActive: true, name: true, email: true } });

  await prisma.user.update({
    where: { 
      id: userId,
      companyId: session.user.companyId 
    },
    data: { isActive },
  });

  await recordAuditLog({
    action: 'user.status_toggled',
    entityType: 'User',
    entityId: userId,
    changes: { 
      previousStatus: before?.isActive ? 'active' : 'suspended',
      newStatus: isActive ? 'active' : 'suspended',
      targetUser: { name: before?.name, email: before?.email },
    },
  });

  revalidatePath('/dashboard/settings/users');
}

export async function updateUserPermissions(userId: string, permissions: any) {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) throw new Error('Unauthorized');

  const before = await prisma.user.findUnique({ where: { id: userId }, select: { permissions: true, name: true, email: true } });

  await prisma.user.update({
    where: { 
      id: userId,
      companyId: session.user.companyId 
    },
    data: { permissions },
  });

  await recordAuditLog({
    action: 'user.permissions_updated',
    entityType: 'User',
    entityId: userId,
    changes: { 
      previousPermissions: before?.permissions,
      newPermissions: permissions,
      targetUser: { name: before?.name, email: before?.email },
    },
  });

  revalidatePath('/dashboard/settings/users');
}

export async function resendWelcomeEmail(userId: string) {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) throw new Error('Unauthorized');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.email) throw new Error('User not found');

  const tempPassword = Math.random().toString(36).slice(-10) + '!';
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hashedPassword }
  });

  const { sendEmail, getEmployeeWelcomeEmailTemplate } = await import('@/lib/email');
  
  const html = getEmployeeWelcomeEmailTemplate({
    name: user.name,
    email: user.email,
    password: tempPassword,
    role: user.role
  });

  await sendEmail({
    to: user.email,
    subject: 'FreightFlow - Your Account Credentials (Updated)',
    html
  });

  await recordAuditLog({
    action: 'user.credentials_resent',
    entityType: 'User',
    entityId: userId,
    changes: { 
      targetUser: { name: user.name, email: user.email },
      note: 'Password reset and credentials resent via email',
    },
  });

  return { success: true };
}
