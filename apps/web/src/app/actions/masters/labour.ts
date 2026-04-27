'use server';

import { getSession } from '@/lib/auth-utils';
import { createAdminClient } from '@/lib/supabase/server';

export async function uploadMasterDocument(formData: FormData) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return { error: 'Not authenticated' };
    }

    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'aadhar', 'pan', 'product_image', etc.
    const masterId = formData.get('masterId') as string;
    const masterType = formData.get('masterType') as string; // 'labour', 'product'

    if (!file || file.size === 0) return { error: 'No file provided' };

    // Validation
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) return { error: 'Invalid file type. Use PDF, PNG or JPG.' };
    if (file.size > 5 * 1024 * 1024) return { error: 'File exceeds 5MB limit.' };

    const supabase = await createAdminClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${type}_${Date.now()}.${fileExt}`;
    const filePath = `${session.user.tenantId}/${masterType}/${masterId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('compliance')
      .upload(filePath, file, { 
        upsert: true,
        contentType: file.type 
      });

    if (uploadError) {
      console.error('[Supabase Upload Error]:', uploadError);
      return { error: `Upload failed: ${uploadError.message}` };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('compliance')
      .getPublicUrl(filePath);

    return { success: true, publicUrl };
  } catch (error: any) {
    console.error('[Document Upload Action Error]:', error);
    return { error: 'Internal Server Error' };
  }
}
