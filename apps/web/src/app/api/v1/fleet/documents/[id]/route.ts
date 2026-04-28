import { NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';
import { createAdminClient } from '@/lib/supabase/server';

async function deleteFromStorage(fileUrl: string | null) {
  if (!fileUrl) return;
  try {
    const supabase = await createAdminClient();
    const parts = fileUrl.split('/compliance/');
    if (parts.length < 2) return;
    const filePath = parts[1];
    await supabase.storage.from('compliance').remove([filePath]);
  } catch (err) {
    console.error('[Storage Delete Error]:', err);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    
    // Get existing to check if file changed
    const existing = await prisma.vehicleDocument.findUnique({
      where: { id, tenantId: session.user.tenantId }
    });

    if (!existing) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

    // If fileUrl changed, delete old one
    if (data.fileUrl && existing.fileUrl && data.fileUrl !== existing.fileUrl) {
      await deleteFromStorage(existing.fileUrl);
    }

    const doc = await prisma.vehicleDocument.update({
      where: { id },
      data: {
        vehicleId: data.vehicleId,
        docType: data.docType,
        docNo: data.docNo,
        issueDate: new Date(data.issueDate),
        expiryDate: new Date(data.expiryDate),
        fileUrl: data.fileUrl,
      }
    });

    return NextResponse.json(doc);
  } catch (error: any) {
    console.error('Fleet Document PATCH Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const existing = await prisma.vehicleDocument.findUnique({
      where: { id, tenantId: session.user.tenantId }
    });

    if (existing?.fileUrl) {
      await deleteFromStorage(existing.fileUrl);
    }

    await prisma.vehicleDocument.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Fleet Document DELETE Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
