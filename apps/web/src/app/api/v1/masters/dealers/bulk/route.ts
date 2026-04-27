import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { DealerSchema } from '@freightflow/shared';
import { z } from 'zod';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const body = await request.json();
    const { data } = body;

    if (!Array.isArray(data)) {
      return NextResponse.json({ error: 'Data must be an array' }, { status: 400 });
    }

    // Process and validate all records
    const dealersToCreate = data.map((item) => {
      // Basic cleanup and schema validation
      const validated = DealerSchema.parse({
        ...item,
        isActive: true,
      });

      return {
        ...validated,
        tenantId: user.tenantId,
        companyId: user.companyId!,
      };
    });

    // Bulk Create
    const result = await prisma.dealer.createMany({
      data: dealersToCreate,
      skipDuplicates: true,
    });

    return NextResponse.json({ 
      success: true, 
      count: result.count,
      message: `Successfully imported ${result.count} dealers`
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed for some records', 
        details: error.errors 
      }, { status: 400 });
    }
    console.error('[DEALERS_BULK_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
