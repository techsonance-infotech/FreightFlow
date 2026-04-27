'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

function LedgerContent() {
  const searchParams = useSearchParams();
  const consignorId = searchParams.get('consignorId');
  const consigneeId = searchParams.get('consigneeId');
  const driverId = searchParams.get('driverId');

  const entityType = consignorId ? 'Consignor' : consigneeId ? 'Consignee' : driverId ? 'Driver' : 'General';
  const entityId = consignorId || consigneeId || driverId || 'N/A';

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Financial Ledger</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
            Statement of Account & Transaction History
          </p>
        </div>
        <Button variant="outline" onClick={() => window.history.back()} className="rounded-xl border-slate-200">
          ← Back to Registry
        </Button>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-12 flex flex-col items-center justify-center text-center space-y-6">
        <div className="h-24 w-24 rounded-full bg-blue-50 flex items-center justify-center text-4xl shadow-inner animate-pulse">
          📊
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Ledger View Coming Soon</h2>
          <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
            The accounting integration for <span className="text-blue-600 font-bold">{entityType}</span> (ID: <span className="font-mono text-xs">{entityId}</span>) is currently being finalized.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl pt-8">
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-left">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Upcoming Feature</p>
            <p className="font-bold text-slate-900">Live Statements</p>
            <p className="text-xs text-slate-500 mt-1">Real-time debit/credit tracking.</p>
          </div>
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-left">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Upcoming Feature</p>
            <p className="font-bold text-slate-900">Aging Analysis</p>
            <p className="text-xs text-slate-500 mt-1">Track pending dues by 30/60/90 days.</p>
          </div>
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-left">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Upcoming Feature</p>
            <p className="font-bold text-slate-900">Auto-Reconcile</p>
            <p className="text-xs text-slate-500 mt-1">Match vouchers with bank entries.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LedgerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading Ledger Module...</div>}>
      <LedgerContent />
    </Suspense>
  );
}
