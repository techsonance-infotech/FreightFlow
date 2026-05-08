import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.user || !session.user.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
    });

    return NextResponse.json({ data: company });
  } catch (error) {
    console.error('Failed to fetch company branding:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user || !session.user.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { 
      name, gstin, pan, address, logoUrl, signatureUrl, 
      printHeader, printFooter, printTerms,
      bankName, accountNo, ifscCode, branchName,
      primaryColor, whatsappNo, enableQrCode, 
      enableWatermark, watermarkText
    } = data;

    const updated = await prisma.company.update({
      where: { id: session.user.companyId },
      data: {
        name,
        gstin,
        pan,
        address,
        logoUrl,
        signatureUrl,
        printHeader,
        printFooter,
        printTerms,
        bankName,
        accountNo,
        ifscCode,
        branchName,
        primaryColor,
        whatsappNo,
        enableQrCode,
        enableWatermark,
        watermarkText,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Failed to update company branding:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
