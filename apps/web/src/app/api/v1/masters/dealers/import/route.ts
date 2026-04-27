import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    const text = await file.text();
    const rows = text.split('\n').slice(1); // Skip header

    const dealersToCreate = [];
    for (const row of rows) {
      if (!row.trim()) continue;
      const [name, personName, phone, gstin] = row.split(',');
      
      dealersToCreate.push({
        name: name.trim().replace(/"/g, ''),
        personName: personName.trim().replace(/"/g, ''),
        phone: phone.trim().replace(/"/g, ''),
        gstin: gstin.trim().replace(/"/g, ''),
        tenantId: session.user.tenantId,
        companyId: session.user.companyId!,
      });
    }

    if (dealersToCreate.length > 0) {
      await prisma.dealer.createMany({
        data: dealersToCreate,
        skipDuplicates: true,
      });
    }

    return NextResponse.json({ success: true, count: dealersToCreate.length });
  } catch (error) {
    console.error('[IMPORT_DEALERS]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
