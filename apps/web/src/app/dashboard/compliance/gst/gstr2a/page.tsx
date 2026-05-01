'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Calculator, AlertCircle, FileText, 
  TrendingUp, BarChart3, Clock, Zap, Landmark,
  ChevronRight, ArrowRight, Download, RefreshCcw,
  CheckCircle2, AlertTriangle, XCircle, Search, Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function GSTR2AReconPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState(new Date().toISOString().substring(0, 7));
  const [filter, setFilter] = useState('all');

  const startReconciliation = async (portalData: any[] = []) => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/compliance/gst/recon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period, portalData })
      });
      const json = await res.json();
      if (json.data) {
        setData(json.data);
        toast.success('Ledger vs Portal reconciliation complete');
      }
    } catch (err) {
      toast.error('Reconciliation engine failure');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startReconciliation();
  }, [period]);

  const formatCurrency = (paise: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0 
    }).format(paise / 100);
  };

  const filteredResults = data?.results.filter((r: any) => {
    if (filter === 'all') return true;
    return r.matchStatus === filter;
  }) || [];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-6 w-6 rounded-lg bg-accent-600 flex items-center justify-center">
              <ShieldCheck className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[10px] font-black text-accent-600 uppercase tracking-[0.2em]">ITC Audit Center</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">GSTR-2A Reconciliation</h1>
          <p className="text-sm font-medium text-neutral-500 mt-1">Match Purchase Ledger ITC against GST Portal records</p>
        </div>

        <div className="flex items-center gap-3">
          <input 
            type="month" 
            value={period} 
            onChange={e => setPeriod(e.target.value)}
            className="h-12 px-4 rounded-2xl border border-neutral-200 text-xs font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all bg-white shadow-sm"
          />
          <Button variant="outline" className="h-12 px-6 rounded-2xl border-neutral-200 font-black text-xs uppercase tracking-widest bg-white shadow-sm hover:bg-neutral-50">
            <Upload className="h-4 w-4 mr-2" /> Upload JSON
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCardSmall 
            label="Matched Records" 
            value={data?.summary?.totalMatched || 0} 
            icon={<CheckCircle2 className="text-emerald-500" />} 
          />
          <StatCardSmall 
            label="Mismatches" 
            value={data?.summary?.totalMismatched || 0} 
            icon={<AlertTriangle className="text-amber-500" />} 
          />
          <StatCardSmall 
            label="Missing in Portal" 
            value={data?.summary?.missingInPortal || 0} 
            icon={<XCircle className="text-rose-500" />} 
          />
          <StatCardSmall 
            label="Portal Tax Pool" 
            value={formatCurrency(data?.summary?.totalPortalTax || 0)} 
            icon={<Landmark className="text-accent-500" />} 
          />
        </div>
      )}

      {/* Main Analysis Section */}
      <div className="bg-white rounded-[40px] border border-neutral-100 shadow-sm overflow-hidden">
        <div className="px-10 py-8 border-b border-neutral-50 flex items-center justify-between bg-neutral-50/30">
          <div className="flex items-center gap-8">
             <button onClick={() => setFilter('all')} className={cn("text-[10px] font-black uppercase tracking-widest transition-all", filter === 'all' ? "text-accent-600" : "text-neutral-400 hover:text-neutral-600")}>All Entries</button>
             <button onClick={() => setFilter('mismatch')} className={cn("text-[10px] font-black uppercase tracking-widest transition-all", filter === 'mismatch' ? "text-amber-600" : "text-neutral-400 hover:text-neutral-600")}>Mismatches</button>
             <button onClick={() => setFilter('missing_in_ledger')} className={cn("text-[10px] font-black uppercase tracking-widest transition-all", filter === 'missing_in_ledger' ? "text-rose-600" : "text-neutral-400 hover:text-neutral-600")}>Missing in Books</button>
          </div>
          <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            Last Sync: Just Now
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50/20 border-none">
              <TableHead className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-neutral-400">Reconciliation Status</TableHead>
              <TableHead className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-neutral-400">Ledger Record (Books)</TableHead>
              <TableHead className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-neutral-400">Portal Record (GSTR-2A)</TableHead>
              <TableHead className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-neutral-400 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResults.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-96 text-center">
                  <div className="flex flex-col items-center justify-center text-neutral-300">
                    <Search className="h-12 w-12 mb-4 opacity-20" />
                    <p className="text-sm font-black uppercase tracking-widest">No reconciliation gaps found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredResults.map((row: any, idx: number) => (
                <TableRow key={idx} className="group hover:bg-neutral-50/50 transition-colors border-b border-neutral-50 last:border-none">
                  <TableCell className="px-10 py-8">
                    <Badge className={cn(
                      "font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-lg border-none shadow-sm",
                      row.matchStatus === 'matched' ? "bg-emerald-50 text-emerald-600" :
                      row.matchStatus === 'mismatch' ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                    )}>
                      {row.matchStatus.replace(/_/g, ' ')}
                    </Badge>
                    {row.discrepancies.length > 0 && (
                      <p className="text-[9px] font-bold text-rose-500 mt-2 max-w-[150px] leading-relaxed italic">{row.discrepancies[0]}</p>
                    )}
                  </TableCell>
                  <TableCell className="px-10 py-8">
                    {row.ledgerEntry ? (
                      <div className="space-y-1">
                        <p className="text-sm font-black text-neutral-900 tracking-tight">{row.ledgerEntry.invoiceNo}</p>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{formatCurrency(row.ledgerEntry.totalTax)} Tax</p>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-neutral-300 uppercase italic">Not in Books</span>
                    )}
                  </TableCell>
                  <TableCell className="px-10 py-8">
                    {row.portalEntry ? (
                      <div className="space-y-1">
                        <p className="text-sm font-black text-neutral-900 tracking-tight">{row.portalEntry.invoiceNo}</p>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{row.portalEntry.vendorName}</p>
                        <p className="text-[10px] font-black text-accent-600 uppercase tracking-widest">{formatCurrency(row.portalEntry.cgst + row.portalEntry.sgst + row.portalEntry.igst)} Tax</p>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-neutral-300 uppercase italic">Not in Portal</span>
                    )}
                  </TableCell>
                  <TableCell className="px-10 py-8 text-right">
                    {row.matchStatus === 'missing_in_ledger' && (
                      <Button className="h-9 px-4 rounded-xl bg-neutral-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all">
                        Post to Books
                      </Button>
                    )}
                    {row.matchStatus === 'mismatch' && (
                      <Button variant="outline" className="h-9 px-4 rounded-xl border-neutral-200 text-[9px] font-black uppercase tracking-widest hover:bg-neutral-50 transition-all">
                        Adjust Ledger
                      </Button>
                    )}
                    {row.matchStatus === 'matched' && (
                      <div className="flex justify-end">
                        <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function StatCardSmall({ label, value, icon }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all group">
      <div>
        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-neutral-900 tracking-tighter">{value}</p>
      </div>
      <div className="h-10 w-10 rounded-2xl bg-neutral-50 flex items-center justify-center group-hover:scale-110 transition-transform">
        {React.cloneElement(icon, { className: "h-5 w-5" })}
      </div>
    </div>
  );
}
