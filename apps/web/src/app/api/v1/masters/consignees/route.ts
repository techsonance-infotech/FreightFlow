import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { ConsigneeSchema } from '@freightflow/shared';
import { z } from 'zod';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    const where: any = { 
      tenantId: session.user.tenantId, 
      companyId: session.user.companyId, 
      deletedAt: null 
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { gstin: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.consignee.findMany({ 
        where, 
        skip, 
        take: limit, 
        orderBy: { updatedAt: 'desc' } 
      }),
      prisma.consignee.count({ where }),
    ]);

    return NextResponse.json({ 
      data: items, 
      meta: { 
        total, 
        page, 
        limit, 
        totalPages: Math.ceil(total / limit) 
      } 
    });
  } catch (error) {
    console.error('Consignee GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const validatedData = ConsigneeSchema.parse(body);

    const item = await prisma.consignee.create({
      data: { 
        ...validatedData, 
        tenantId: session.user.tenantId, 
        companyId: session.user.companyId! 
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Consignee POST Error:', error);
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
