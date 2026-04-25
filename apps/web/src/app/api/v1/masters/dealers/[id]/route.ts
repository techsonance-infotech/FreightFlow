import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { DealerSchema } from '@freightflow/shared';
import { z } from 'zod';

// GET /api/v1/masters/dealers/[id] - Get a single dealer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const { id } = await params;

    const dealer = await prisma.dealer.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
        companyId: user.companyId,
        deletedAt: null,
      },
    });

    if (!dealer) {
      return NextResponse.json({ error: 'Dealer not found' }, { status: 404 });
    }

    return NextResponse.json(dealer);
  } catch (error) {
    console.error('[DEALER_GET_ID]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/v1/masters/dealers/[id] - Update a dealer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const { id } = await params;
    const body = await request.json();

    // Validate partial update
    const validatedData = DealerSchema.partial().parse(body);

    // Verify ownership
    const existing = await prisma.dealer.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
        companyId: user.companyId,
        deletedAt: null,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Dealer not found' }, { status: 404 });
    }

    // Check for GSTIN duplicate if updated
    if (validatedData.gstin && validatedData.gstin !== existing.gstin) {
      const duplicate = await prisma.dealer.findFirst({
        where: {
          companyId: user.companyId,
          gstin: validatedData.gstin,
          deletedAt: null,
          id: { not: id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: 'A dealer with this GSTIN already exists' },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.dealer.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('[DEALER_PUT]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/v1/masters/dealers/[id] - Soft delete a dealer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const { id } = await params;

    // Verify ownership and perform soft delete
    const existing = await prisma.dealer.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
        companyId: user.companyId,
        deletedAt: null,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Dealer not found' }, { status: 404 });
    }

    await prisma.dealer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[DEALER_DELETE]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
