'use server';

import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/server';

export async function createCompanyInitial(_prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session || !session.user) return { error: 'Unauthorized' };

  const companyName = (formData.get('companyName') as string)?.trim();
  const address = (formData.get('address') as string)?.trim();
  const city = (formData.get('city') as string)?.trim();
  const state = (formData.get('state') as string)?.trim();
  const pincode = (formData.get('pincode') as string)?.trim();
  const email = (formData.get('companyEmail') as string)?.trim();
  const phone = (formData.get('companyPhone') as string)?.trim();

  // Validation (Same as onboarding)
  if (!companyName || companyName.length < 3) return { error: 'Company Name is too short.' };
  if (!address || address.length < 5) return { error: 'Business Address is required.' };
  if (!city || !state) return { error: 'City and State are required.' };
  if (!/^\d{6}$/.test(pincode || '')) return { error: 'Invalid 6-digit Pincode.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')) return { error: 'Invalid email address.' };
  if (!/^\d{10}$/.test(phone || '')) return { error: 'Invalid 10-digit phone number.' };

  try {
    // Check uniqueness within tenant
    const existing = await prisma.company.findFirst({
      where: { 
        tenantId: session.user.tenantId,
        OR: [{ email }, { phone }]
      }
    });

    if (existing) return { error: 'A company with this email or phone already exists in your organization.' };

    const company = await prisma.company.create({
      data: {
        tenantId: session.user.tenantId,
        name: companyName,
        address,
        city,
        state,
        pincode,
        email,
        phone,
        isActive: true,
      },
    });

    revalidatePath('/dashboard/settings/organizations');
    return { success: true, companyId: company.id };
  } catch (error: any) {
    return { error: error.message || 'Failed to create company.' };
  }
}

export async function updateCompanyCompliance(companyId: string, _prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session || !session.user) return { error: 'Unauthorized' };

  const complianceType = formData.get('complianceType') as string;
  const gstNumber = (formData.get('gstNumber') as string)?.trim()?.toUpperCase();
  const panNumber = (formData.get('panNumber') as string)?.trim()?.toUpperCase();

  const regFile = formData.get('regDoc') as File | null;
  const gstFile = formData.get('gstDoc') as File | null;
  const panFile = formData.get('panDoc') as File | null;

  if (complianceType === 'gst') {
    if (!gstNumber || !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(gstNumber)) {
      return { error: 'Invalid GSTIN format.' };
    }
  }
  if (!panNumber || !/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(panNumber)) {
    return { error: 'Invalid PAN format.' };
  }

  try {
    const supabase = await createAdminClient();
    const uploads: Record<string, string> = {};
    const filesToUpload = [
      { key: 'registration_certificate', file: regFile, dbField: 'registrationCertificateUrl' },
      { key: 'pan_card', file: panFile, dbField: 'panCardUrl' },
    ];
    if (complianceType === 'gst' && gstFile && gstFile.size > 0) {
      filesToUpload.push({ key: 'gst_certificate', file: gstFile, dbField: 'gstCertificateUrl' });
    }

    for (const item of filesToUpload) {
      if (!item.file || item.file.size === 0) continue;
      
      const fileExt = item.file.name.split('.').pop();
      const filePath = `${session.user.tenantId}/${companyId}/${item.key}.${fileExt}`;

      await supabase.storage
        .from('compliance_documents')
        .upload(filePath, item.file, { upsert: true });

      const { data: urlData } = supabase.storage.from('compliance_documents').getPublicUrl(filePath);
      uploads[item.dbField] = urlData.publicUrl;
    }

    await prisma.company.update({
      where: { id: companyId, tenantId: session.user.tenantId },
      data: {
        gstin: complianceType === 'gst' ? gstNumber : null,
        pan: panNumber,
        ...uploads
      },
    });

    revalidatePath('/dashboard/settings/organizations');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to update compliance.' };
  }
}
