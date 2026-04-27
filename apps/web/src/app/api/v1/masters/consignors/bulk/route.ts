import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { ConsignorSchema } from '@freightflow/shared';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { data } = await request.json();
    if (!Array.isArray(data)) return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });

    const tenantId = session.user.tenantId;
    const companyId = session.user.companyId!;

    // Basic cleaning and mapping
    const processedData = data.map(item => ({
      name: item.name || item.Name || item['Consignor Name'],
      companyName: item.companyName || item.CompanyName || item['Company Name'] || '',
      address: item.address || item.Address || item['Full Address'] || '',
      phone: String(item.phone || item.Phone || item['Mobile'] || '').replace(/\D/g, ''),
      email: item.email || item.Email || '',
      gstin: item.gstin || item.GSTIN || item['GST Number'] || '',
      pan: item.pan || item.PAN || item['PAN Number'] || '',
      creditLimit: parseFloat(item.creditLimit || item.CreditLimit || item['Limit'] || '0'),
      creditDays: parseInt(item.creditDays || item.CreditDays || item['Days'] || '0'),
      isMsme: !!(item.isMsme || item.IsMsme || item['MSME']),
      msmeRegNo: item.msmeRegNo || item.MSMERegNo || item['MSME Number'] || '',
    }));

    let successCount = 0;
    const errors: string[] = [];

    // Use a transaction for bulk creation
    await prisma.$transaction(async (tx) => {
      for (const item of processedData) {
        try {
          // Validate each item
          const validated = ConsignorSchema.parse(item);
          await tx.consignor.create({
            data: {
              ...validated,
              tenantId,
              companyId
            }
          });
          successCount++;
        } catch (err: any) {
          errors.push(`Row for ${item.name}: ${err.message || 'Validation failed'}`);
        }
      }
    });

    if (successCount === 0 && errors.length > 0) {
      return NextResponse.json({ error: 'Failed to import any records', details: errors }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      count: successCount, 
      errors: errors.length > 0 ? errors : undefined 
    });
  } catch (error) {
    console.error('Consignor Bulk Import Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
