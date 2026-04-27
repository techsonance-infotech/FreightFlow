'use server';

import { getSession, setSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// ─── SAVE COMPANY DETAILS (Step 1) ─────────────────────────
export async function saveCompanyDetails(_prevState: unknown, formData: FormData) {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    return { error: 'Not authenticated. Please log in.' };
  }

  const companyName = (formData.get('companyName') as string)?.trim();
  const address = (formData.get('address') as string)?.trim();
  const city = (formData.get('city') as string)?.trim();
  const state = (formData.get('state') as string)?.trim();
  const pincode = (formData.get('pincode') as string)?.trim();
  const email = (formData.get('companyEmail') as string)?.trim();
  const phone = (formData.get('companyPhone') as string)?.trim();

  // 1. Mandatory Field Validation
  if (!companyName || companyName.length < 3) return { error: 'Company Name is required (min 3 chars).' };
  if (!address || address.length < 5) return { error: 'Business Address is required.' };
  if (!city) return { error: 'City is required.' };
  if (!state) return { error: 'State is required.' };
  
  // 2. Format Validation
  if (!pincode || !/^\d{6}$/.test(pincode)) {
    return { error: 'Please enter a valid 6-digit Pincode.' };
  }
  
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Please enter a valid company email address.' };
  }
  
  if (!phone || !/^\d{10}$/.test(phone)) {
    return { error: 'Please enter a valid 10-digit phone number.' };
  }

  try {
    const appUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { company: true }
    });

    if (!appUser) return { error: 'User record not found.' };

    // 3. Resilient Uniqueness Check
    // We check if a company with this email/phone exists.
    // If it exists but belongs to a DIFFERENT tenant, we block it (platform-wide uniqueness).
    // If it exists within the SAME tenant, we allow it (the user might be re-linking or completing setup).

    const existingEmail = await prisma.company.findFirst({
      where: { email }
    });
    if (existingEmail && existingEmail.tenantId !== appUser.tenantId) {
      return { error: 'This company email is already registered by another organization.' };
    }

    const existingPhone = await prisma.company.findFirst({
      where: { phone }
    });
    if (existingPhone && existingPhone.tenantId !== appUser.tenantId) {
      return { error: 'This company phone number is already registered by another organization.' };
    }

    // Determine which ID to use for the update/create
    // Priority: 1. User's current companyId, 2. Existing company in same tenant
    const targetCompanyId = appUser.companyId || existingEmail?.id || existingPhone?.id;

    let companyId: string;

    if (targetCompanyId) {
      // Update existing
      await prisma.company.update({
        where: { id: targetCompanyId },
        data: {
          name: companyName,
          address,
          city,
          state,
          pincode,
          email,
          phone,
        },
      });
      companyId = targetCompanyId;
    } else {
      // Create new
      const company = await prisma.company.create({
        data: {
          tenantId: appUser.tenantId,
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
      companyId = company.id;

      // Link user to company
      await prisma.user.update({
        where: { id: appUser.id },
        data: { companyId },
      });

      // Update session
      await setSession({
        ...user,
        companyId,
      });
    }

    return { success: true, companyId };
  } catch (error: unknown) {
    console.error('[Onboarding] Company save error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

// ─── SAVE COMPLIANCE DOCUMENTS (Step 2) ────────────────────
export async function saveComplianceDetails(_prevState: unknown, formData: FormData) {
  const session = await getSession();
  const user = session?.user;

  if (!user) return { error: 'Not authenticated. Please log in.' };

  const complianceType = formData.get('complianceType') as string; // 'gst' or 'pan'
  const gstNumber = (formData.get('gstNumber') as string)?.trim()?.toUpperCase();
  const panNumber = (formData.get('panNumber') as string)?.trim()?.toUpperCase();

  const regFile = formData.get('regDoc') as File | null;
  const gstFile = formData.get('gstDoc') as File | null;
  const panFile = formData.get('panDoc') as File | null;

  // 1. Logic Validation
  if (complianceType === 'gst') {
    if (!gstNumber || !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(gstNumber)) {
      return { error: 'Please enter a valid 15-character GSTIN.' };
    }
    if (!gstFile || gstFile.size === 0) return { error: 'GST Certificate is mandatory for GST registered businesses.' };
  }
  
  if (!panNumber || !/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(panNumber)) {
    return { error: 'Please enter a valid 10-character PAN number.' };
  }

  // registration and pan are ALWAYS mandatory in this flow
  if (!regFile || regFile.size === 0) return { error: 'Company Registration Certificate is mandatory.' };
  if (!panFile || panFile.size === 0) return { error: 'PAN Card document is mandatory.' };

  try {
    const appUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { company: true },
    });

    if (!appUser?.companyId) return { error: 'Please complete Step 1 first.' };

    const supabase = await createAdminClient();
    const uploads: Record<string, string> = {};
    const filesToUpload = [
      { key: 'registration_certificate', file: regFile, dbField: 'registrationCertificateUrl' },
      { key: 'pan_card', file: panFile, dbField: 'panCardUrl' },
    ];

    if (complianceType === 'gst' && gstFile) {
      filesToUpload.push({ key: 'gst_certificate', file: gstFile, dbField: 'gstCertificateUrl' });
    }

    for (const item of filesToUpload) {
      if (!item.file || item.file.size === 0) continue;

      // Type & Size Check
      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(item.file.type)) return { error: `Invalid type for ${item.key}. Use PDF, PNG or JPG.` };
      if (item.file.size > 2 * 1024 * 1024) return { error: `${item.key} exceeds 2MB limit.` };

      const fileExt = item.file.name.split('.').pop();
      const filePath = `${appUser.tenantId}/${appUser.companyId}/${item.key}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('compliance_documents')
        .upload(filePath, item.file, { upsert: true });

      if (uploadError) {
        console.error(`[Supabase Upload Error] ${item.key}:`, uploadError);
        throw new Error(`Upload failed for ${item.key}: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage.from('compliance_documents').getPublicUrl(filePath);
      uploads[item.dbField] = urlData.publicUrl;
    }

    // 2. Persistence
    await prisma.company.update({
      where: { id: appUser.companyId },
      data: {
        gstin: complianceType === 'gst' ? gstNumber : null,
        pan: panNumber,
        ...uploads
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error('[Onboarding] Compliance error:', error);
    return { error: error.message || 'An unexpected error occurred.' };
  }
}

// ─── SKIP ONBOARDING ───────────────────────────────────────
export async function skipOnboarding() {
  const cookieStore = await cookies();
  cookieStore.set('onboarding_skipped', 'true', { maxAge: 60 * 60 * 24 * 7 }); // 1 week
  revalidatePath('/dashboard');
  redirect('/dashboard');
}

// ─── COMPLETE ONBOARDING ────────────────────────────────────
export async function completeOnboarding() {
  const cookieStore = await cookies();
  cookieStore.set('onboarding_finished', 'true', { maxAge: 60 * 60 * 24 * 365 });
  cookieStore.delete('onboarding_skipped');
  
  revalidatePath('/dashboard');
  redirect('/dashboard');
}
