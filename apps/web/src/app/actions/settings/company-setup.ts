'use server';

import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/server';

export async function getCompanyById(id: string) {
  const session = await getSession();
  if (!session || !session.user) throw new Error('Unauthorized');

  const company = await prisma.company.findUnique({
    where: { id, tenantId: session.user.tenantId }
  });

  if (!company) return null;

  return {
    companyName: company.name,
    address: company.address,
    city: company.city,
    state: company.state,
    pincode: company.pincode,
    companyEmail: company.email,
    phone: company.phone
  };
}

export async function createCompanyInitial(_prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session || !session.user) return { error: 'Unauthorized' };

  const id = formData.get('id') as string | null;
  const companyName = (formData.get('companyName') as string)?.trim();
  const address = (formData.get('address') as string)?.trim();
  const city = (formData.get('city') as string)?.trim();
  const state = (formData.get('state') as string)?.trim();
  const pincode = (formData.get('pincode') as string)?.trim();
  const email = (formData.get('companyEmail') as string)?.trim();
  const phone = (formData.get('phone') as string)?.trim();

  const data = { id, companyName, address, city, state, pincode, companyEmail: email, phone };

  // 1. Specific Field Validation (Regex-based)
  if (!companyName || companyName.length < 3) return { error: 'Company Name must be at least 3 characters.', data };
  if (!address || address.length < 5) return { error: 'Address must be at least 5 characters.', data };
  
  if (!/^[a-zA-Z\s]+$/.test(city || '')) return { error: 'City should only contain alphabets.', data };
  if (!/^[a-zA-Z\s]+$/.test(state || '')) return { error: 'State should only contain alphabets.', data };
  
  if (!/^\d{6}$/.test(pincode || '')) return { error: 'Pincode must be exactly 6 digits.', data };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')) return { error: 'Invalid email pattern.', data };
  if (!/^\d{10}$/.test(phone || '')) return { error: 'Mobile number must be exactly 10 digits.', data };

  try {
    // 2. Duplicate Check: Name + Address uniqueness within tenant
    const duplicate = await prisma.company.findFirst({
      where: { 
        tenantId: session.user.tenantId,
        name: companyName,
        address: address,
        id: id ? { not: id } : undefined
      }
    });

    if (duplicate) {
      return { error: 'An organization with this name and address already exists.', data };
    }

    // 3. Uniqueness Check: Email/Phone
    const existing = await prisma.company.findFirst({
      where: { 
        tenantId: session.user.tenantId,
        id: id ? { not: id } : undefined,
        OR: [{ email }, { phone }]
      }
    });

    if (existing) {
      const field = existing.email === email ? 'email' : 'phone';
      return { error: `A company with this ${field} already exists in your organization.`, data };
    }

    let company;
    if (id) {
      company = await prisma.company.update({
        where: { id, tenantId: session.user.tenantId },
        data: { name: companyName, address, city, state, pincode, email, phone }
      });
    } else {
      company = await prisma.company.create({
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
    }

    revalidatePath('/dashboard/settings/organizations');
    return { success: true, companyId: company.id };
  } catch (error: any) {
    return { error: error.message || 'Failed to process request.', data };
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

  const data = { complianceType, gstNumber, panNumber };

  if (complianceType === 'gst') {
    if (!gstNumber || !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(gstNumber)) {
      return { error: 'Invalid GSTIN format.', data };
    }
  }
  if (!panNumber || !/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(panNumber)) {
    return { error: 'Invalid PAN format.', data };
  }

  try {
    const supabase = await createAdminClient();
    const uploads: Record<string, string> = {};
    const filesToUpload = [
      { key: 'registration_certificate', file: regFile, dbField: 'registrationCertificateUrl', label: 'Registration Doc' },
      { key: 'pan_card', file: panFile, dbField: 'panCardUrl', label: 'PAN Card' },
    ];
    if (complianceType === 'gst' && gstFile && gstFile.size > 0) {
      filesToUpload.push({ key: 'gst_certificate', file: gstFile, dbField: 'gstCertificateUrl', label: 'GST Certificate' });
    }

    const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'application/pdf'];
    const MAX_SIZE = 1 * 1024 * 1024; // 1 MB

    for (const item of filesToUpload) {
      if (!item.file || item.file.size === 0) continue;
      
      // Validation: Type
      if (!ALLOWED_TYPES.includes(item.file.type)) {
        return { error: `${item.label} must be a PNG, JPG, or PDF file.`, data };
      }
      
      // Validation: Size
      if (item.file.size > MAX_SIZE) {
        return { error: `${item.label} exceeds the 1MB size limit.`, data };
      }

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
    return { error: error.message || 'Failed to update compliance.', data };
  }
}
