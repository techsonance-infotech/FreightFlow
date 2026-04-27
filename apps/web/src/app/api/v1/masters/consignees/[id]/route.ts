import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { ConsigneeSchema } from '@freightflow/shared';
import { z } from 'zod';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

    const item = await prisma.consignee.findFirst({
      where: { 
        id, 
        tenantId: session.user.tenantId, 
        companyId: session.user.companyId, 
        deletedAt: null 
      },
    });

    if (!item) return NextResponse.json({ error: 'Consignee not found' }, { status: 404 });
    return NextResponse.json(item);
  } catch (error) {
    console.error('Consignee GET [ID] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    
    // Use partial schema for updates
    const validatedData = ConsigneeSchema.partial().parse(body);
    const { id: _, ...updateData } = validatedData;

    const updated = await prisma.consignee.update({
      where: { 
        id, 
        tenantId: session.user.tenantId, 
        companyId: session.user.companyId 
      },
      data: updateData
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Consignee PATCH Error:', error);
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;

    await prisma.consignee.update({
      where: { 
        id, 
        tenantId: session.user.tenantId, 
        companyId: session.user.companyId 
      },
      data: { deletedAt: new Date(), isActive: false }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Consignee DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
