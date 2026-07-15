import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { z } from 'zod';

const ProofSchema = z.object({
  requestId: z.string().min(1),
  imageUrl: z.string().min(1),
  transactionId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = ProofSchema.parse(body);

    const message = await prisma.supportMessage.create({
      data: {
        requestId: validatedData.requestId,
        senderId: session.user.id,
        message: validatedData.transactionId ? `Payment Proof Submitted (TxID: ${validatedData.transactionId})` : 'Payment Proof Submitted',
        isAction: true,
        type: 'PAYMENT_PROOF',
        attachmentUrl: validatedData.imageUrl,
        payload: { transactionId: validatedData.transactionId } as any
      }
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('[API_LICENSE_PROOF_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
