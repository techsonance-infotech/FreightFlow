'use client';
 
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PalletReceiptTemplate } from '@/components/orders/PalletReceiptTemplate';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { PalletInvoiceDownloader } from '@/components/orders/PalletInvoiceDownloader';
import { toast } from 'sonner';

export default function PalletPrintPage() {
  const { id } = useParams();
  const router = useRouter();
  const [pallet, setPallet] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    async function fetchData() {
      try {
        const [palletRes, companyRes] = await Promise.all([
          fetch(`/api/v1/pallets/${id}`),
          fetch('/api/v1/companies/branding')
        ]);
        
        if (!palletRes.ok) throw new Error('Pallet not found');
        const palletData = await palletRes.json();
        const companyData = await companyRes.json();
        
        setPallet(palletData);
        setCompany(companyData.data);
      } catch (err) {
        toast.error('Failed to load data');
        router.push('/dashboard/pallets');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, router]);
 
  if (loading) return <div className="h-screen flex items-center justify-center animate-pulse font-black text-slate-400">LOADING MANIFEST...</div>;
  if (!pallet) return null;
 
  return (
    <div className="min-h-screen bg-slate-50 p-8 print:p-0 print:bg-white">
      {/* Action Bar */}
      <div className="max-w-5xl mx-auto flex items-center justify-between mb-8 no-print">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/pallets"
            className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all border border-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Manifest Preview</h1>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">LR #{pallet.lrNo} - {pallet.companyName}</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <PalletInvoiceDownloader 
            palletId={id as string} 
            lrNo={pallet.lrNo} 
            variant="receipt"
            label="Download Receipt"
            className="h-14 px-8 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-3 border-none"
          />
          <PalletInvoiceDownloader 
            palletId={id as string} 
            lrNo={pallet.lrNo} 
            variant="invoice"
            label="Download Invoice"
            className="h-14 px-8 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-3 border-none"
          />
        </div>
      </div>
 
      {/* Main Print Container */}
      <div className="max-w-5xl mx-auto space-y-12 print:space-y-0 print:max-w-none print:p-0">
        <div className="shadow-2xl bg-white print:shadow-none print:bg-transparent">
          <PalletReceiptTemplate 
            data={pallet} 
            company={company} 
            copyType="CONSIGNEE COPY" 
          />
        </div>
        
        <div className="border-t-2 border-dashed border-slate-200 my-12 print:my-0 print:border-slate-400 print:h-0" />
        
        <div className="shadow-2xl bg-white print:shadow-none print:bg-transparent">
          <PalletReceiptTemplate 
            data={pallet} 
            company={company} 
            copyType="OFFICE/DRIVER COPY" 
          />
        </div>
      </div>
    </div>
  );
}
