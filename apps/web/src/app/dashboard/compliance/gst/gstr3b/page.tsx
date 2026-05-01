'use client';

import React, { useState, useEffect } from 'react';
import { 
  ReportContainer, StatCard, ReportSectionHeader, 
  LoadingState, EmptyReportState 
} from '@/components/reports/report-components';
import { 
  Landmark, Globe, Download, RefreshCcw, 
  Calculator, ArrowRight, ShieldCheck, FileText,
  TrendingUp, TrendingDown, Info, Calculator as CalcIcon,
  ChevronRight, ArrowDownRight, ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function GSTR3BPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(format(new Date(), 'yyyy-MM'));

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/compliance/gst/gstr3b?period=${period}`);
      const json = await res.json();
      if (json.data) setData(json.data);
    } catch (err) {
      toast.error('Failed to load GSTR-3B summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  const formatCurrency = (paise: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0 
    }).format(paise / 100);
  };

  if (loading) return <LoadingState rows={10} />;

  return (
    <ReportContainer>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-6 w-6 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Calculator className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Compliance Intelligence</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">GSTR-3B Net Liability</h1>
          <p className="text-sm font-medium text-neutral-500 mt-1">Consolidated summary of Outward Supplies vs. Input Tax Credit (ITC)</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-neutral-100 shadow-sm">
          <input 
            type="month" 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-transparent border-none px-4 py-2 text-xs font-bold outline-none text-neutral-700 cursor-pointer"
          />
          <div className="h-6 w-[1px] bg-neutral-100" />
          <Button 
            onClick={fetchData} 
            variant="ghost" 
            className="h-10 w-10 p-0 rounded-xl hover:bg-neutral-50 text-neutral-400 hover:text-accent-600"
          >
            <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Button className="h-10 px-6 bg-accent-600 hover:bg-accent-700 text-white shadow-lg shadow-accent-600/20 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all">
            <Download className="h-3.5 w-3.5 mr-2" />
            Export Summary
          </Button>
        </div>
      </div>

      {!data ? (
        <EmptyReportState title="No Data Found" description="Try selecting a different period" />
      ) : (
        <div className="space-y-10">
          {/* Top Level Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[40px] border border-neutral-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                <ArrowUpRight className="h-16 w-16 text-rose-500" />
              </div>
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Total Output Liability</p>
              <h2 className="text-3xl font-black text-neutral-900 tracking-tight">{formatCurrency(data.outward.totalTax) || '₹0'}</h2>
              <div className="mt-6 flex items-center gap-2">
                <Badge className="bg-rose-50 text-rose-600 border-rose-100 font-black text-[9px] px-2 py-0.5">COLLECTED</Badge>
                <span className="text-[10px] font-bold text-neutral-400 uppercase">From Sales Invoices</span>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-neutral-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                <ArrowDownRight className="h-16 w-16 text-emerald-500" />
              </div>
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Total Input Credit (ITC)</p>
              <h2 className="text-3xl font-black text-neutral-900 tracking-tight">{formatCurrency(data.inward.total) || '₹0'}</h2>
              <div className="mt-6 flex items-center gap-2">
                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black text-[9px] px-2 py-0.5">ELIGIBLE</Badge>
                <span className="text-[10px] font-bold text-neutral-400 uppercase">From Purchases/Exp</span>
              </div>
            </div>

            <div className="bg-neutral-900 p-8 rounded-[40px] shadow-2xl shadow-neutral-900/20 relative overflow-hidden group text-white">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-16 w-16 text-white" />
              </div>
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Net GST Payable</p>
              <h2 className="text-3xl font-black text-white tracking-tight">{formatCurrency(data.netPayable.total) || '₹0'}</h2>
              <div className="mt-6 flex items-center gap-2">
                <Badge className="bg-white/10 text-white border-white/5 font-black text-[9px] px-2 py-0.5 uppercase tracking-widest">Calculated</Badge>
                <span className="text-[10px] font-bold text-neutral-400 uppercase">After ITC Adjustment</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Detailed Comparison Table */}
            <div className="bg-white rounded-[40px] border border-neutral-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-neutral-50 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest">Component Analysis</h3>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Tax Head Breakdown (C+S / I)</p>
                </div>
              </div>
              <div className="p-8 space-y-8">
                {['CGST', 'SGST', 'IGST'].map((tax) => {
                  const out = data.outward[tax.toLowerCase()] || 0;
                  const inv = data.inward[tax.toLowerCase()] || 0;
                  const net = data.netPayable[tax.toLowerCase()] || 0;
                  
                  return (
                    <div key={tax} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-neutral-900 uppercase tracking-widest">{tax} Head</span>
                        <span className="text-xs font-black text-accent-600">{formatCurrency(net)} Net</span>
                      </div>
                      <div className="relative h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full bg-rose-400" 
                          style={{ width: `${out > 0 ? 100 : 0}%` }}
                        />
                        <div 
                          className="absolute left-0 top-0 h-full bg-emerald-400 transition-all duration-1000" 
                          style={{ width: `${out > 0 ? (inv / out) * 100 : 0}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] font-black text-neutral-400 uppercase tracking-widest">
                        <span>Output: {formatCurrency(out)}</span>
                        <span>ITC: {formatCurrency(inv)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ITC Source Details */}
            <div className="bg-white rounded-[40px] border border-neutral-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-8 border-b border-neutral-50 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest">ITC Audit Trail</h3>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Purchase Bills contributing to ITC</p>
                </div>
              </div>
              <div className="flex-1 overflow-auto max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-neutral-50/50 border-none">
                      <TableHead className="px-8 py-4 text-[9px] font-black uppercase text-neutral-400 tracking-widest">Date & Voucher</TableHead>
                      <TableHead className="px-8 py-4 text-[9px] font-black uppercase text-neutral-400 tracking-widest text-right">Tax Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.inward.details.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="h-48 text-center text-[10px] font-bold text-neutral-400 uppercase">
                          No Purchase GST Found
                        </TableCell>
                      </TableRow>
                    ) : data.inward.details.map((d: any, i: number) => (
                      <TableRow key={i} className="hover:bg-neutral-50/50 transition-colors border-b border-neutral-50 last:border-none">
                        <TableCell className="px-8 py-5">
                          <div>
                            <p className="text-xs font-black text-neutral-900 tracking-tight">{d.partyName}</p>
                            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">{d.voucherNo} • {format(new Date(d.date), 'dd MMM')}</p>
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-5 text-right font-black text-neutral-700 text-xs">
                          {formatCurrency(d.taxAmount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* Warning/Alert */}
          <div className="bg-amber-50 border border-amber-100 rounded-[32px] p-8 flex gap-6 items-center">
            <div className="h-14 w-14 rounded-2xl bg-white border border-amber-200 flex items-center justify-center text-amber-500 shrink-0">
              <Info className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Compliance Advisory</h4>
              <p className="text-xs font-medium text-amber-700/80 mt-1 leading-relaxed">
                This report is an internal summary based on recorded sales and purchases. Ensure all purchase bills (GSTR-2B) are reconciled before finalizing your GST payment. Net payable amount does not include any interest or penalties.
              </p>
            </div>
          </div>
        </div>
      )}
    </ReportContainer>
  );
}
