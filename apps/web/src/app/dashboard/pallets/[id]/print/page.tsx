import React from 'react';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { redirect, notFound } from 'next/navigation';
import { PalletReceiptTemplate } from '@/components/orders/PalletReceiptTemplate';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';

export default async function PalletPrintPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) redirect('/dashboard');

  const [pallet, company] = await Promise.all([
    prisma.orderPallet.findUnique({
      where: { id: params.id },
      include: {
        dealer: true,
        vehicle: true,
        palletDetails: true,
      }
    }),
    prisma.company.findUnique({
      where: { id: session.user.companyId }
    })
  ]);

  if (!pallet) notFound();

  return (
    <div className="min-h-screen bg-slate-50 p-8 print:p-0 print:bg-white">
      {/* Action Bar */}
      <div className="max-w-5xl mx-auto flex items-center justify-between mb-8 print:hidden">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/pallets"
            className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all border border-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Manifest Print Preview</h1>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">LR #{pallet.lrNo} - {pallet.companyName}</p>
          </div>
        </div>
        
        <button 
          onClick={() => window.print()}
          className="h-14 px-8 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          <Printer className="h-5 w-5" />
          Generate Hardcopy
        </button>
      </div>

      {/* Main Print Container */}
      <div className="max-w-5xl mx-auto space-y-12 print:space-y-0">
        <div className="shadow-2xl print:shadow-none bg-white">
          <PalletReceiptTemplate 
            data={pallet} 
            company={company} 
            copyType="CONSIGNEE COPY" 
          />
        </div>
        
        <div className="border-t-2 border-dashed border-slate-200 my-12 print:hidden" />
        
        <div className="shadow-2xl print:shadow-none bg-white">
          <PalletReceiptTemplate 
            data={pallet} 
            company={company} 
            copyType="OFFICE/DRIVER COPY" 
          />
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        // In case the user wants immediate print
        // window.print();
      `}} />
    </div>
  );
}
