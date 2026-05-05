'use server';

import { prisma } from '@freightflow/db';
import { getSession, setSession } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function switchCompany(companyId: string) {
  const session = await getSession();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  // 1. Verify user belongs to the tenant of this company
  const company = await prisma.company.findFirst({
    where: {
      id: companyId,
      tenantId: session.user.tenantId,
      isActive: true,
    },
  });

  if (!company) {
    throw new Error('Company not found or inactive');
  }

  // 2. Update the session with new companyId
  await setSession({
    ...session.user,
    companyId: company.id,
  }, session.rememberMe);

  // 3. Revalidate and redirect to refresh all data
  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function createCompany(formData: FormData) {
  const session = await getSession();
  if (!session || !session.user) throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  const gstin = formData.get('gstin') as string;
  const pan = formData.get('pan') as string;
  const address = formData.get('address') as string;
  const city = formData.get('city') as string;
  const state = formData.get('state') as string;
  const pincode = formData.get('pincode') as string;
  const phone = formData.get('phone') as string;

  if (!name) throw new Error('Company name is required');

  await prisma.company.create({
    data: {
      tenantId: session.user.tenantId,
      name,
      gstin,
      pan,
      address,
      city,
      state,
      pincode,
      phone,
      isActive: true,
    },
  });

  revalidatePath('/dashboard/settings/organizations');
  return { success: true };
}

export async function toggleCompanyStatus(companyId: string, isActive: boolean) {
  const session = await getSession();
  if (!session || !session.user) throw new Error('Unauthorized');

  // Prevent deactivating the only active company
  if (!isActive) {
    const activeCount = await prisma.company.count({
      where: { tenantId: session.user.tenantId, isActive: true }
    });
    if (activeCount <= 1) {
      throw new Error('Cannot deactivate the only active organization.');
    }
  }

  await prisma.company.update({
    where: { 
      id: companyId,
      tenantId: session.user.tenantId 
    },
    data: { isActive },
  });

  revalidatePath('/dashboard/settings/organizations');
}
