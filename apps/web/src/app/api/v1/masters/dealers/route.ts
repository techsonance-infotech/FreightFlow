import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { DealerSchema } from '@freightflow/shared';
import { z } from 'zod';

// GET /api/v1/masters/dealers - List all dealers for the current tenant/company
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    // Build filters
    const where: any = {
      tenantId: user.tenantId,
      companyId: user.companyId,
      deletedAt: null, // Soft delete check
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { personName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { gstin: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [dealers, total] = await Promise.all([
      prisma.dealer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.dealer.count({ where }),
    ]);

    return NextResponse.json({
      data: dealers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[DEALERS_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/v1/masters/dealers - Create a new dealer
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const body = await request.json();

    // Validate request body
    const validatedData = DealerSchema.parse(body);

    // Check for duplicate GSTIN within the same company
    if (validatedData.gstin) {
      const existing = await prisma.dealer.findFirst({
        where: {
          companyId: user.companyId,
          gstin: validatedData.gstin,
          deletedAt: null,
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'A dealer with this GSTIN already exists' },
          { status: 400 }
        );
      }
    }

    const dealer = await prisma.dealer.create({
      data: {
        ...validatedData,
        tenantId: user.tenantId,
        companyId: user.companyId!,
      },
    });

    return NextResponse.json(dealer, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('[DEALERS_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
