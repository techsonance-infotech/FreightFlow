import React from 'react';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { redirect } from 'next/navigation';
import { BrandingSettingsForm } from '@/components/dashboard/branding-settings';

export default async function BrandingSettingsPage() {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) redirect('/dashboard');

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
  });

  if (!company) return <div>Company not found</div>;

  return (
    <div className="bg-white min-h-screen">
      <BrandingSettingsForm initialData={{
        id: company.id,
        name: company.name,
        gstin: company.gstin,
        pan: company.pan,
        address: company.address,
        logoUrl: company.logoUrl,
        signatureUrl: company.signatureUrl,
        printHeader: company.printHeader,
        printFooter: company.printFooter,
        printTerms: company.printTerms,
        bankName: company.bankName,
        accountNo: company.accountNo,
        ifscCode: company.ifscCode,
        branchName: company.branchName,
        primaryColor: company.primaryColor,
        whatsappNo: company.whatsappNo,
        enableQrCode: company.enableQrCode,
        enableWatermark: company.enableWatermark,
        watermarkText: company.watermarkText,
      }} />
    </div>
  );
}
