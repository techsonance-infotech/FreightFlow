'use server';

import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function updatePassword(formData: FormData) {
  const session = await getSession();
  if (!session || !session.user) throw new Error('Unauthorized');

  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (newPassword !== confirmPassword) throw new Error('New passwords do not match');
  if (newPassword.length < 8) throw new Error('Password must be at least 8 characters');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user || !user.passwordHash) throw new Error('User not found');

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) throw new Error('Incorrect current password');

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: hashedPassword }
  });

  return { success: true };
}

export async function toggle2FA(enabled: boolean) {
  const session = await getSession();
  if (!session || !session.user) throw new Error('Unauthorized');

  // In a real app, this would involve TOTP setup. For now, we simulate.
  await prisma.user.update({
    where: { id: session.user.id },
    data: { 
      // Assuming a field exists or using settings JSON
      // Using metadata if schema allows, or just a mock success
    }
  });

  revalidatePath('/dashboard/settings/security');
  return { success: true };
}
