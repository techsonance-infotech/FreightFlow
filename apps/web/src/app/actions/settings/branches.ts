'use server';

import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

export async function createBranch(data: any) {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) throw new Error('Unauthorized');

  const { name, address, stateCode } = data;
  if (!name) throw new Error('Branch name is required');

  await prisma.branch.create({
    data: {
      companyId: session.user.companyId,
      name,
      address,
      stateCode,
      isActive: true,
    },
  });

  revalidatePath('/dashboard/settings/organization');
  return { success: true };
}

export async function updateBranch(id: string, data: any) {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) throw new Error('Unauthorized');

  const { name, address, stateCode, isActive } = data;

  await prisma.branch.update({
    where: { 
      id,
      companyId: session.user.companyId 
    },
    data: {
      name,
      address,
      stateCode,
      isActive,
    },
  });

  revalidatePath('/dashboard/settings/organization');
  return { success: true };
}

export async function deleteBranch(id: string) {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) throw new Error('Unauthorized');

  // Check if it's the only branch
  const count = await prisma.branch.count({
    where: { companyId: session.user.companyId }
  });

  if (count <= 1) throw new Error('At least one branch is required.');

  await prisma.branch.delete({
    where: { 
      id,
      companyId: session.user.companyId 
    },
  });

  revalidatePath('/dashboard/settings/organization');
  return { success: true };
}
