import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { PalletMasterSchema } from '@freightflow/shared';
import { z } from 'zod';

// Triggering re-generation of Prisma client context

// GET /api/v1/masters/pallets - List all pallets for the current tenant/company
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    // Build filters
    const where: any = {
      tenantId: user.tenantId,
      companyId: user.companyId,
    };

    if (search) {
      where.OR = [
        { palletId: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const pallets = await prisma.palletMaster.findMany({
      where,
      orderBy: { palletId: 'asc' },
    });

    return NextResponse.json({
      data: pallets,
    });
  } catch (error) {
    console.error('[PALLETS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/v1/masters/pallets - Create a new pallet
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const body = await request.json();

    // Validate request body
    const validatedData = PalletMasterSchema.parse(body);

    // Check for duplicate Pallet ID within the same company
    const existing = await prisma.palletMaster.findFirst({
      where: {
        companyId: user.companyId,
        palletId: validatedData.palletId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A pallet with this ID already exists' },
        { status: 400 }
      );
    }

    const pallet = await prisma.palletMaster.create({
      data: {
        ...validatedData,
        tenantId: user.tenantId,
        companyId: user.companyId!,
      },
    });

    return NextResponse.json(pallet, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('[PALLETS_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
