'use client';

import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, TrendingUp, TrendingDown, Scale, 
  Hourglass, Calendar, Download, RefreshCw,
  PieChart, BarChart3, ShieldCheck, Activity,
  Landmark, ArrowRightLeft, Calculator,
  ChevronRight, FileText, Wallet, LandmarkIcon,
  Search, Filter, MoreVertical, Briefcase
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportViewer } from '@/components/reports/report-viewer';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function FinancialReportsPage() {
  const [activeTab, setActiveTab] = useState('pl');
  const [loading, setLoading] = useState(true);
  const [asOnDate, setAsOnDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  const [plData, setPlData] = useState<any>(null);
  const [bsData, setBsData] = useState<any>(null);
  const [ageingData, setAgeingData] = useState<any[]>([]);

  useEffect(() => {
    fetchReportData();
  }, [activeTab, asOnDate]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      if (activeTab === 'pl') {
        endpoint = `/api/v1/reports/profit-loss`;
        const res = await fetch(endpoint);
        setPlData(await res.json());
      } else if (activeTab === 'bs') {
        endpoint = `/api/v1/reports/balance-sheet?date=${asOnDate}`;
        const res = await fetch(endpoint);
        setBsData(await res.json());
      } else if (activeTab === 'ageing') {
        endpoint = `/api/v1/reports/ageing?type=debtors`;
        const res = await fetch(endpoint);
        setAgeingData(await res.json());
      }
    } catch (error) {
      toast.error('Failed to sync financial intelligence');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Math.abs(val || 0) / 100);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20 px-4">
      {/* 1. Header with Global Blue and Obsidian Accents */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <LandmarkIcon className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase underline decoration-blue-600/30 decoration-4 underline-offset-8">Financial Intelligence</h1>
          </div>
          <p className="text-sm font-medium text-slate-500 max-w-xl leading-relaxed">
            Fiscal Control Center (FCC) for audit-ready P&L statements, horizontal balance sheets, and counterparty ageing analysis.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/20 flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase text-slate-400 tracking-[0.2em]">Reporting Period</span>
                <input 
                  type="date" 
                  value={asOnDate} 
                  onChange={e => setAsOnDate(e.target.value)} 
                  className="bg-transparent border-none text-[10px] font-black uppercase outline-none w-32 mt-0.5 text-slate-600" 
                />
              </div>
            </div>
          </div>
          {/* Black Highlight Button as requested */}
          <Button className="h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-200" icon={<FileText className="h-4 w-4" />}>
            Generate Audit File
          </Button>
        </div>
      </div>

      {/* 2. visual Fiscal Widgets (Reverted to Global Blue) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <AnalysisCard title="Liquidity Pool" value="₹ 1.24 Cr" sub="Available Working Capital" icon={<Wallet className="h-5 w-5 text-blue-600" />} color="blue" />
        <AnalysisCard title="EBITDA Margin" value="22.4%" sub="+2.1% vs Prev Qtr" icon={<Activity className="h-5 w-5 text-emerald-500" />} color="emerald" />
        <AnalysisCard title="Counterparty Risk" value="Low" sub="Weighted Average Age: 18D" icon={<ShieldCheck className="h-5 w-5 text-blue-600" />} color="blue" />
        <AnalysisCard title="Fiscal Integrity" value="Verified" sub="SOC2 Compliant Logs" icon={<Briefcase className="h-5 w-5 text-slate-500" />} color="slate" />
      </div>

      {/* 3. Primary Command Tabs (Global Blue) */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="flex items-center justify-between">
          <TabsList className="bg-white p-1.5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-1">
            <TabTrigger value="pl" label="Profit & Loss" icon={<BarChart3 className="h-3.5 w-3.5" />} />
            <TabTrigger value="bs" label="Balance Sheet" icon={<Scale className="h-3.5 w-3.5" />} />
            <TabTrigger value="ageing" label="Debtors Ageing" icon={<Hourglass className="h-3.5 w-3.5" />} />
            <TabTrigger value="tb" label="Trial Balance" icon={<Landmark className="h-3.5 w-3.5" />} />
          </TabsList>
          
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-2xl text-blue-600 text-[10px] font-black uppercase tracking-[0.2em]">
            <Activity className="h-3 w-3 animate-pulse text-blue-400" /> GAAP Ledger Synced
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-100/40 overflow-hidden relative">
          
          <TabsContent value="pl" className="m-0 p-0 animate-in slide-in-from-right-4 duration-500">
            <ReportHeader title="Statement of Profit & Loss" subtitle="Comparative analysis of operational yield against expenditure pool." />
            {plData && (
              <div className="p-10 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <FinancialMetricCard title="Gross Operating Inflow" value={formatCurrency(plData.revenue)} sub="Revenue Baseline" icon={<TrendingUp className="h-5 w-5 text-emerald-500" />} color="emerald" />
                  <FinancialMetricCard title="Total Fiscal Outflow" value={formatCurrency(plData.expenses)} sub="Expenditure Burden" icon={<TrendingDown className="h-5 w-5 text-rose-500" />} color="rose" />
                  <FinancialMetricCard title="Net Fiscal Bottomline" value={formatCurrency(plData.netProfit)} sub="Audit Realized Profit" icon={<IndianRupee className="h-5 w-5 text-blue-600" />} color="blue" />
                </div>

                <div className="rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Account Code</TableHead>
                        <TableHead className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Ledger Classification</TableHead>
                        <TableHead className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Category</TableHead>
                        <TableHead className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Ledger Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plData.details?.map((item: any) => (
                        <TableRow key={item.accountId} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                          <TableCell className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-tighter">{item.accountCode || 'S-AUDIT'}</TableCell>
                          <TableCell className="px-10 py-6 font-black text-slate-900 text-sm">{item.accountName}</TableCell>
                          <TableCell className="px-10 py-6">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-blue-600/60">{item.accountType}</span>
                          </TableCell>
                          <TableCell className={cn(
                            "px-10 py-6 text-right font-black text-sm",
                            item.accountType === 'revenue' ? 'text-emerald-600' : 'text-slate-900'
                          )}>
                            {formatCurrency(item.balance)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bs" className="m-0 p-0 animate-in slide-in-from-right-4 duration-500">
            <ReportHeader title="Horizontal Fiscal Position" subtitle="Systemic balance of Enterprise Assets vs Liabilities and Equity." />
            {bsData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 divide-x divide-slate-100">
                {/* Assets */}
                <div className="p-12">
                  <div className="flex justify-between items-center mb-10 border-b border-slate-100 pb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Aggregate Assets</h4>
                    </div>
                    <span className="text-xl font-black text-emerald-600">{formatCurrency(bsData.assets.total)}</span>
                  </div>
                  <div className="space-y-5">
                    {bsData.assets.items.map((item: any) => (
                      <div key={item.accountId} className="flex justify-between items-center p-3.5 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                        <span className="text-sm font-black text-slate-600 group-hover:text-blue-600 transition-colors">{item.accountName}</span>
                        <span className="font-black text-slate-900">{formatCurrency(item.balance)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Liabilities */}
                <div className="p-12">
                  <div className="flex justify-between items-center mb-10 border-b border-slate-100 pb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                        <TrendingDown className="h-4 w-4" />
                      </div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Total Burden</h4>
                    </div>
                    <span className="text-xl font-black text-rose-600">{formatCurrency(bsData.totalLiabilitiesAndEquity)}</span>
                  </div>
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] ml-2">Liabilities Pool</p>
                      {bsData.liabilities.items.map((item: any) => (
                        <div key={item.accountId} className="flex justify-between items-center p-3.5 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                          <span className="text-sm font-black text-slate-600 group-hover:text-rose-600 transition-colors">{item.accountName}</span>
                          <span className="font-black text-slate-900">{formatCurrency(item.balance)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4 pt-8 border-t border-slate-50">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] ml-2">Enterprise Equity</p>
                      {bsData.equity.items.map((item: any) => (
                        <div key={item.accountId} className="flex justify-between items-center p-3.5 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                          <span className="text-sm font-black text-slate-600 group-hover:text-blue-600 transition-colors">{item.accountName}</span>
                          <span className="font-black text-slate-900">{formatCurrency(item.balance)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between p-6 rounded-[2rem] bg-blue-600 text-white shadow-xl shadow-blue-100 mt-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                          <IndianRupee className="h-16 w-16" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest z-10">Retained Earnings (Audit P&L)</span>
                        <span className="text-lg font-black z-10">{formatCurrency(bsData.equity.netProfit)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ageing" className="m-0 p-0 animate-in slide-in-from-right-4 duration-500">
            <ReportHeader title="Counterparty Ageing Registry" subtitle="Bilateral analysis of outstanding receivables bucketed by overdue latency." />
            <div className="px-1">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Trading Entity</TableHead>
                    <TableHead className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">0-30D Pool</TableHead>
                    <TableHead className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">31-60D Pool</TableHead>
                    <TableHead className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">61-90D Pool</TableHead>
                    <TableHead className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">90D+ Pool</TableHead>
                    <TableHead className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Aggregate Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ageingData.length === 0 ? <EmptyState icon={<Hourglass className="h-10 w-10 text-slate-100" />} /> : ageingData.map((row: any, i: number) => (
                    <TableRow key={i} className="hover:bg-slate-50/50 transition-colors group border-b border-slate-50 last:border-0">
                      <TableCell className="px-10 py-6 font-black text-slate-900 text-sm">{row.name}</TableCell>
                      <TableCell className="px-10 py-6 text-right font-black text-slate-500">{formatCurrency(row.buckets['0-30'])}</TableCell>
                      <TableCell className="px-10 py-6 text-right font-black text-amber-500">{formatCurrency(row.buckets['31-60'])}</TableCell>
                      <TableCell className="px-10 py-6 text-right font-black text-orange-500">{formatCurrency(row.buckets['61-90'])}</TableCell>
                      <TableCell className="px-10 py-6 text-right font-black text-rose-500">{formatCurrency(row.buckets['90+'])}</TableCell>
                      <TableCell className="px-10 py-6 text-right font-black text-blue-600 bg-blue-50/30 group-hover:bg-blue-100/40 transition-colors text-base">{formatCurrency(row.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="tb" className="m-0 p-0 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-white p-24 text-center">
              <div className="max-w-md mx-auto space-y-8">
                <div className="h-24 w-24 rounded-[2.5rem] bg-blue-600 flex items-center justify-center mx-auto shadow-2xl shadow-blue-200">
                  <ArrowRightLeft className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Trial Balance Intelligence</h2>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed mt-3 px-6">
                    Our fiscal processing engine is currently compiling the multi-layer ledger drill-down. Automated mapping of Debit/Credit balances will be available shortly.
                  </p>
                </div>
                <Button onClick={() => setActiveTab('pl')} variant="outline" className="h-12 px-10 rounded-2xl border-slate-200 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50">
                  Return to Audit Hub
                </Button>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function TabTrigger({ value, label, icon }: any) {
  return (
    <TabsTrigger 
      value={value} 
      className="rounded-[1.5rem] px-8 py-3 text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-blue-200 transition-all active:scale-95 flex items-center gap-2.5 border border-transparent data-[state=active]:border-blue-600"
    >
      {icon}
      {label}
    </TabsTrigger>
  );
}

function AnalysisCard({ title, value, sub, icon, color }: any) {
  const colorStyles: any = {
    blue: 'bg-blue-50/20 border-blue-50',
    emerald: 'bg-emerald-50/20 border-emerald-50',
    slate: 'bg-slate-50/20 border-slate-50',
  };

  return (
    <div className={cn("bg-white rounded-[2rem] border border-slate-100 p-7 shadow-sm group hover:shadow-md transition-all", colorStyles[color])}>
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
        <div className="p-2 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform border border-slate-50">
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1 italic">{sub}</p>
    </div>
  );
}

function FinancialMetricCard({ title, value, sub, icon, color }: any) {
  const colorStyles: any = {
    emerald: 'bg-emerald-50/40 border-emerald-100',
    rose: 'bg-rose-50/40 border-rose-100',
    blue: 'bg-blue-50/40 border-blue-100',
  };

  return (
    <div className={cn("bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm group hover:shadow-xl transition-all relative overflow-hidden", colorStyles[color])}>
      <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 -rotate-12 group-hover:rotate-0 transition-transform duration-500">
        {icon}
      </div>
      <div className="flex flex-col relative z-10">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</p>
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-2 italic">{sub}</p>
      </div>
    </div>
  );
}

function ReportHeader({ title, subtitle }: any) {
  return (
    <div className="px-10 py-10 border-b border-slate-100 bg-white flex flex-col gap-2">
      <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">{title}</h3>
      <p className="text-xs font-medium text-slate-400">{subtitle}</p>
    </div>
  );
}

function EmptyState({ icon }: any) {
  return (
    <tr>
      <td colSpan={6} className="px-10 py-32 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-[1.5rem] bg-blue-50 flex items-center justify-center border border-blue-100">
            {icon}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-black text-slate-900 uppercase tracking-widest">No Intelligence Records Found</p>
            <p className="text-xs text-slate-400 font-medium max-w-[200px] mx-auto">Try expanding your fiscal search window or adjusting filters.</p>
          </div>
        </div>
      </td>
    </tr>
  );
}
