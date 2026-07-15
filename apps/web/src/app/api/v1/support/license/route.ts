import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { z } from 'zod';

const CreateLicenseSchema = z.object({
  planType: z.enum(['basic', 'pro', 'enterprise']),
});

// GET /api/v1/support/license - Get the active license request and message thread
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const request = await prisma.licenseRequest.findFirst({
      where: { tenantId: session.user.tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: { select: { name: true, role: true } },
            admin: { select: { email: true, role: true } }
          }
        }
      }
    });

    return NextResponse.json({ data: request });
  } catch (error) {
    console.error('[API_LICENSE_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/v1/support/license - Create a new license request
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const body = await request.json();
    const validatedData = CreateLicenseSchema.parse(body);

    const licenseReq = await prisma.$transaction(async (tx) => {
      const existing = await tx.licenseRequest.findFirst({
        where: { tenantId: user.tenantId, status: 'pending' }
      });
      if (existing) {
        throw Object.assign(new Error('DUPLICATE_PENDING'), { code: 'DUPLICATE_PENDING' });
      }
      
      const req = await tx.licenseRequest.create({
        data: {
          tenantId: user.tenantId,
          userId: user.id,
          planType: validatedData.planType,
          status: 'pending'
        }
      });
      
      await tx.supportMessage.create({
        data: {
          requestId: req.id,
          message: `License upgrade requested for ${validatedData.planType.toUpperCase()} plan. An admin will connect with you shortly.`,
          isAction: true,
        }
      });
      
      return req;
    });

    return NextResponse.json(licenseReq, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error.code === 'DUPLICATE_PENDING') {
      return NextResponse.json({ error: 'You already have a pending license request.' }, { status: 400 });
    }
    console.error('[API_LICENSE_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
