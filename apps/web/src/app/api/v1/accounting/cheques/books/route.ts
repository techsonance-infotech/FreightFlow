import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.user || !session.user.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const books = await prisma.chequeBook.findMany({
      where: { companyId: session.user.companyId },
      include: {
        bankAccount: true,
        _count: {
          select: { leaves: { where: { status: { not: 'available' } } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedBooks = books.map(b => ({
      ...b,
      usedCount: b._count.leaves
    }));

    return NextResponse.json({ data: formattedBooks });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.user || !session.user.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { bankAccountId, bookNo, startNo, endNo } = body;

    const startNum = parseInt(startNo);
    const endNum = parseInt(endNo);
    const totalLeaves = endNum - startNum + 1;

    if (totalLeaves <= 0) throw new Error('Invalid range');

    const book = await prisma.$transaction(async (tx) => {
      const newBook = await tx.chequeBook.create({
        data: {
          tenantId: session.user.tenantId,
          companyId: session.user.companyId,
          bankAccountId,
          bookNo,
          startNo: startNum,
          endNo: endNum,
          totalLeaves
        }
      });

      // Create leaves
      const leavesData = [];
      for (let i = startNum; i <= endNum; i++) {
        leavesData.push({
          chequeBookId: newBook.id,
          leafNo: i,
          status: 'available'
        });
      }

      await tx.chequeLeaf.createMany({
        data: leavesData
      });

      return newBook;
    });

    return NextResponse.json({ data: book });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
