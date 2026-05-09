'use server';

import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

export async function updateOrganization(data: any) {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) {
    throw new Error('Unauthorized');
  }

  const {
    name,
    gstin,
    pan,
    address,
    city,
    state,
    pincode,
    phone,
    email,
    whatsappNo,
    bankName,
    accountNo,
    ifscCode,
    branchName,
    registrationCertificateUrl,
    gstCertificateUrl,
    panCardUrl,
  } = data;

  if (!name) throw new Error('Company name is required');

  await prisma.company.update({
    where: { 
      id: session.user.companyId,
      tenantId: session.user.tenantId
    },
    data: {
      name,
      gstin,
      pan,
      address,
      city,
      state,
      pincode,
      phone,
      email,
      whatsappNo,
      bankName,
      accountNo,
      ifscCode,
      branchName,
      registrationCertificateUrl,
      gstCertificateUrl,
      panCardUrl,
    },
  });

  revalidatePath('/dashboard/settings/organization');
  return { success: true };
}
