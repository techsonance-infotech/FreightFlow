import React from 'react';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { redirect } from 'next/navigation';
import { BrandingSettingsForm } from '@/components/dashboard/branding-settings';
import Link from 'next/link';
import { ArrowLeft, Maximize2 } from 'lucide-react';

export default async function BrandingStudioPage() {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) redirect('/dashboard');

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
  });

  if (!company) return <div>Company not found</div>;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Top Header for Studio Mode */}
      <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/settings/branding"
            className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">Branding Studio</h1>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1.5">Full Canvas Configuration</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Studio Mode Active</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <BrandingSettingsForm isStudioMode initialData={{
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
    </div>
  );
}
