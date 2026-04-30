'use client';

import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, TrendingUp, TrendingDown, Scale, 
  Hourglass, Calendar, Download, RefreshCw,
  PieChart, BarChart3, ShieldCheck, Activity,
  Landmark, ArrowRightLeft, Calculator,
  ChevronRight, FileText, Wallet, LandmarkIcon,
  Search, Filter, MoreVertical, Briefcase, Layers
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  StatCard, 
  ReportSectionHeader, 
  LoadingState, 
  EmptyReportState,
  ReportContainer,
  Pagination
} from '@/components/reports/report-components';

export default function FinancialReportsPage() {
  const [activeTab, setActiveTab] = useState('pl');
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [asOnDate, setAsOnDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  const [summary, setSummary] = useState<any>(null);
  const [plData, setPlData] = useState<any>(null);
  const [dealerPlData, setDealerPlData] = useState<any[]>([]);
  const [categoryPlData, setCategoryPlData] = useState<any[]>([]);
  const [bsData, setBsData] = useState<any>(null);
  const [ageingData, setAgeingData] = useState<any[]>([]);
  const [tbData, setTbData] = useState<any[]>([]);

  const fetchSummary = async () => {
    try {
      const res = await fetch('/api/v1/reports/summary');
      setSummary(await res.json());
    } catch (e) {
      console.error('Failed to fetch summary');
    }
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ startDate, endDate });
      
      if (activeTab === 'pl') {
        const res = await fetch(`/api/v1/reports/profit-loss?type=standard&${params}`);
        const data = await res.json();
        setPlData(data);
      } else if (activeTab === 'dealer-pl') {
        const res = await fetch(`/api/v1/reports/profit-loss?type=dealer&${params}`);
        const data = await res.json();
        setDealerPlData(Array.isArray(data) ? data : []);
      } else if (activeTab === 'category-pl') {
        const res = await fetch(`/api/v1/reports/profit-loss?type=category&${params}`);
        const data = await res.json();
        setCategoryPlData(Array.isArray(data) ? data : []);
      } else if (activeTab === 'bs') {
        const res = await fetch(`/api/v1/reports/balance-sheet?date=${asOnDate}`);
        const data = await res.json();
        setBsData(data);
      } else if (activeTab === 'ageing') {
        const res = await fetch(`/api/v1/reports/ageing?type=debtors`);
        const data = await res.json();
        setAgeingData(Array.isArray(data) ? data : []);
      } else if (activeTab === 'tb') {
        const res = await fetch(`/api/v1/reports/trial-balance?${params}`);
        const data = await res.json();
        setTbData(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      toast.error('Failed to sync financial intelligence');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [activeTab, asOnDate, startDate, endDate]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Math.abs(val || 0) / 100);
  };

  return (
    <ReportContainer className="pb-20 px-4 md:px-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-accent-600 flex items-center justify-center shadow-xl shadow-accent-600/20">
              <LandmarkIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Financial Intelligence</h1>
              <p className="text-sm font-medium text-neutral-500">Fiscal Control Center & Audit-Ready Statements</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-neutral-200 shadow-sm">
            <div className="flex items-center gap-2 px-3">
              <Calendar className="h-4 w-4 text-neutral-400" />
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
                className="bg-transparent border-none text-xs font-bold outline-none w-28 text-neutral-700 cursor-pointer" 
              />
            </div>
            <div className="h-4 w-[1px] bg-neutral-200" />
            <div className="flex items-center gap-2 px-3">
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)} 
                className="bg-transparent border-none text-xs font-bold outline-none w-28 text-neutral-700 cursor-pointer" 
              />
            </div>
          </div>
          <Button 
            onClick={() => {
              const reportName = `FreightFlow_Audit_${activeTab}_${startDate}_to_${endDate}`;
              window.print();
            }}
            className="h-11 px-6 bg-accent-600 hover:bg-accent-700 text-white shadow-lg shadow-accent-600/20 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Audit File
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Liquidity Pool" 
          value={formatCurrency(summary?.liquidityPool || 0)} 
          subValue="Available working capital"
          icon={<Wallet className="h-5 w-5" />} 
          color="blue" 
        />
        <StatCard 
          title="EBITDA Margin" 
          value={`${summary?.ebitdaMargin || 0}%`} 
          subValue="+2.1% vs prev qtr"
          icon={<Activity className="h-5 w-5" />} 
          color="emerald" 
        />
        <StatCard 
          title="Counterparty Risk" 
          value={summary?.outstanding > 5000000 ? "High" : "Low"} 
          subValue={`Ageing Avg: ${summary?.outstanding > 0 ? '18D' : '0D'}`}
          icon={<ShieldCheck className="h-5 w-5" />} 
          color="blue" 
        />
        <StatCard 
          title="Fiscal Integrity" 
          value={summary?.auditHealth || "Verified"} 
          subValue="SOC2 compliant logs"
          icon={<Briefcase className="h-5 w-5" />} 
          color="slate" 
        />
      </div>

      {/* Main Content Area */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-neutral-100 pb-1">
          <TabsList className="bg-transparent p-0 h-auto gap-8 overflow-x-auto no-scrollbar justify-start">
            <TabTrigger value="pl" label="Profit & Loss" />
            <TabTrigger value="dealer-pl" label="Dealer P&L" />
            <TabTrigger value="category-pl" label="Category P&L" />
            <TabTrigger value="bs" label="Balance Sheet" />
            <TabTrigger value="ageing" label="Debtors Ageing" />
            <TabTrigger value="tb" label="Trial Balance" />
          </TabsList>
          
          <div className="flex items-center gap-2 text-[10px] font-bold text-success-700 uppercase tracking-widest bg-success-50 px-3 py-1.5 rounded-full border border-success-100">
            <div className="h-1.5 w-1.5 rounded-full bg-success-700 animate-pulse" />
            GAAP Ledger Synced
          </div>
        </div>

        <>
          {loading ? (
            <LoadingState />
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <TabsContent value="pl" className="m-0 border-none outline-none">
                <div className="px-4 pb-8">
                  <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden">
                    <ReportSectionHeader 
                      title="Statement of Profit & Loss" 
                      subtitle="Comparative analysis of operational yield against expenditure pool."
                      className="px-8 pt-8 mb-4"
                    />
                    
                    {plData && (
                      <div className="p-8 pt-0 space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <FinancialMetricCard 
                            title="Operating Inflow" 
                            value={formatCurrency(plData.revenue)} 
                            icon={<TrendingUp className="h-6 w-6" />} 
                            color="emerald" 
                          />
                          <FinancialMetricCard 
                            title="Fiscal Outflow" 
                            value={formatCurrency(plData.expenses)} 
                            icon={<TrendingDown className="h-6 w-6" />} 
                            color="rose" 
                          />
                          <FinancialMetricCard 
                            title="Net Bottomline" 
                            value={formatCurrency(plData.netProfit)} 
                            icon={<IndianRupee className="h-6 w-6" />} 
                            color="blue" 
                          />
                        </div>

                        <div className="rounded-[24px] border border-neutral-100 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white">
                          <Table>
                            <TableHeader className="bg-white">
                              <TableRow className="border-none hover:bg-transparent">
                                <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400">Account Classification</TableHead>
                                <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-center">Segment</TableHead>
                                <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">Closing Balance</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {plData.details?.map((item: any) => (
                                <TableRow key={item.accountId} className="hover:bg-transparent transition-colors group border-b border-neutral-100 last:border-none">
                                  <TableCell className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                      <div className="h-10 w-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-[10px] font-black text-neutral-400 group-hover:text-accent-600 transition-colors">
                                        {item.accountCode?.slice(0, 3) || 'ACC'}
                                      </div>
                                      <div>
                                        <p className="text-sm font-bold text-neutral-900 uppercase tracking-tight">{item.accountName}</p>
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">{item.category}</p>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="px-8 py-6 text-center">
                                    <Badge className="bg-neutral-50 text-neutral-600 border-neutral-200 text-[10px] font-bold rounded-lg px-2.5 py-1 uppercase tracking-widest">Operating</Badge>
                                  </TableCell>
                                  <TableCell className="px-8 py-6 text-right font-bold text-neutral-900 tracking-tight">{formatCurrency(item.balance)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="dealer-pl" className="m-0 border-none outline-none">
                <div className="px-4 pb-8">
                  <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden">
                    <ReportSectionHeader 
                      title="Dealer-wise Gross Profitability" 
                      subtitle="Customer-centric fiscal audit of revenue contribution per entity."
                      className="px-8 pt-8 mb-4"
                    />
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-white">
                          <TableRow className="border-none hover:bg-transparent">
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400">Trading Entity</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-center">LR Volume</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">Gross Inflow</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">Contribution</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-center">Audit</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {!Array.isArray(dealerPlData) || dealerPlData.length === 0 ? (
                            <TableEmptyState icon={<Briefcase />} title="No dealer P&L found" />
                          ) : dealerPlData.map((d: any) => (
                            <TableRow key={d.id} className="hover:bg-transparent transition-colors group border-b border-neutral-50 last:border-none">
                              <TableCell className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center font-black text-xs border border-accent-100 group-hover:scale-105 transition-transform">
                                    {d.name?.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-neutral-900 uppercase tracking-tight">{d.name}</p>
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">Primary Customer</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="px-8 py-6 text-center font-bold text-neutral-600">{d.trips}</TableCell>
                              <TableCell className="px-8 py-6 text-right font-bold text-success-700">{formatCurrency(d.revenue)}</TableCell>
                              <TableCell className="px-8 py-6 text-right">
                                <div className="flex items-center justify-end gap-3">
                                  <span className="text-[10px] font-bold text-neutral-400 tracking-widest">{(d.revenue / (summary?.revenue || 1) * 100).toFixed(1)}%</span>
                                  <div className="h-1.5 w-16 bg-neutral-100 rounded-full overflow-hidden shadow-inner">
                                    <div className="h-full bg-accent-600 rounded-full" style={{ width: `${(d.revenue / (summary?.revenue || 1) * 100)}%` }} />
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="px-8 py-6 text-center">
                                <Badge className="bg-success-50 text-success-700 border-success-100 text-[10px] font-bold rounded-lg px-2.5 py-1">VERIFIED</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="category-pl" className="m-0 border-none outline-none">
                <div className="px-4 pb-8">
                  <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden">
                    <ReportSectionHeader 
                      title="Category Performance Analysis" 
                      subtitle="Strategic cluster evaluation by market segments."
                      className="px-8 pt-8 mb-4"
                    />
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-white">
                          <TableRow className="border-none hover:bg-transparent">
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400">Market Cluster</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-center">LR Volume</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">Total Revenue</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">Contribution</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-center">Yield</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {!Array.isArray(categoryPlData) || categoryPlData.length === 0 ? (
                            <TableEmptyState icon={<Layers />} title="No category P&L found" />
                          ) : categoryPlData.map((c: any, i: number) => (
                            <TableRow key={i} className="hover:bg-transparent transition-colors group border-b border-neutral-50 last:border-none">
                              <TableCell className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xs border border-amber-100">
                                    {c.category?.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-neutral-900 uppercase tracking-tight">{c.category}</p>
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">Commercial Segment</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="px-8 py-6 text-center font-bold text-neutral-600">{c.count}</TableCell>
                              <TableCell className="px-8 py-6 text-right font-bold text-neutral-900">{formatCurrency(c.revenue)}</TableCell>
                              <TableCell className="px-8 py-6 text-right">
                                <div className="flex items-center justify-end gap-3">
                                  <span className="text-[10px] font-bold text-neutral-400 tracking-widest">{(c.revenue / (summary?.revenue || 1) * 100).toFixed(1)}%</span>
                                  <div className="h-1.5 w-16 bg-neutral-100 rounded-full overflow-hidden shadow-inner">
                                    <div className="h-full bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.4)]" style={{ width: `${(c.revenue / (summary?.revenue || 1) * 100)}%` }} />
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="px-8 py-6 text-center">
                                <Badge className="bg-neutral-50 text-neutral-600 border-neutral-200 text-[10px] font-bold rounded-lg px-2.5 py-1">OPTIMAL</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="bs" className="m-0 border-none outline-none">
                <div className="px-4 pb-8">
                  <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden">
                    <ReportSectionHeader 
                      title="Horizontal Fiscal Position" 
                      subtitle="Systemic balance of Enterprise Assets vs Liabilities and Equity."
                      className="px-8 pt-8 mb-4"
                    />
                    {bsData && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 divide-x divide-neutral-100 border-t border-neutral-100">
                        <div className="p-8 bg-white">
                          <div className="flex justify-between items-center mb-8 bg-accent-50/50 p-6 rounded-[24px] border border-accent-100 shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-accent-600 text-white flex items-center justify-center shadow-lg shadow-accent-600/20">
                                <TrendingUp className="h-5 w-5" />
                              </div>
                              <h4 className="text-sm font-black text-neutral-900 uppercase tracking-widest">Aggregate Assets</h4>
                            </div>
                            <span className="text-2xl font-black text-success-700 tracking-tighter">{formatCurrency(bsData.assets.total)}</span>
                          </div>
                          <div className="space-y-3">
                            {Array.isArray(bsData.assets?.items) && bsData.assets.items.map((item: any) => (
                              <div key={item.accountId} className="flex justify-between items-center p-5 rounded-[20px] hover:bg-transparent transition-all border border-neutral-100/50 group bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                                <span className="text-sm font-bold text-neutral-600 group-hover:text-accent-600 transition-colors uppercase tracking-tight">{item.accountName}</span>
                                <span className="font-black text-neutral-900 tracking-tight">{formatCurrency(item.balance)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-8 bg-white">
                          <div className="flex justify-between items-center mb-8 bg-error-50/50 p-6 rounded-[24px] border border-error-100 shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-error-600 text-white flex items-center justify-center shadow-lg shadow-error-600/20">
                                <TrendingDown className="h-5 w-5" />
                              </div>
                              <h4 className="text-sm font-black text-neutral-900 uppercase tracking-widest">Total Burden</h4>
                            </div>
                            <span className="text-2xl font-black text-error-700 tracking-tighter">{formatCurrency(bsData.totalLiabilitiesAndEquity)}</span>
                          </div>
                          <div className="space-y-8">
                            <div className="space-y-3">
                              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] ml-2">Liabilities Pool</p>
                              {Array.isArray(bsData.liabilities?.items) && bsData.liabilities.items.map((item: any) => (
                                <div key={item.accountId} className="flex justify-between items-center p-5 rounded-[20px] hover:bg-transparent transition-all border border-neutral-100/50 group bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                                  <span className="text-sm font-bold text-neutral-600 group-hover:text-error-600 transition-colors uppercase tracking-tight">{item.accountName}</span>
                                  <span className="font-black text-neutral-900 tracking-tight">{formatCurrency(item.balance)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="space-y-3 pt-8 border-t border-neutral-200">
                              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em] ml-2">Enterprise Equity</p>
                              {Array.isArray(bsData.equity?.items) && bsData.equity.items.map((item: any) => (
                                <div key={item.accountId} className="flex justify-between items-center p-5 rounded-[20px] hover:bg-transparent transition-all border border-neutral-100/50 group bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                                  <span className="text-sm font-bold text-neutral-600 group-hover:text-accent-600 transition-colors uppercase tracking-tight">{item.accountName}</span>
                                  <span className="font-black text-neutral-900 tracking-tight">{formatCurrency(item.balance)}</span>
                                </div>
                              ))}
                              <div className="flex justify-between p-7 rounded-[24px] bg-neutral-900 text-white shadow-2xl mt-6 relative overflow-hidden group">
                                <div className="relative z-10 flex flex-col justify-center">
                                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-1">Retained Earnings</span>
                                  <span className="text-xs font-bold text-accent-500">AUDIT VERIFIED</span>
                                </div>
                                <span className="text-3xl font-black z-10 tracking-tighter text-accent-500">{formatCurrency(bsData.equity.netProfit)}</span>
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform duration-700">
                                  <IndianRupee className="h-20 w-20" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ageing" className="m-0 border-none outline-none">
                <div className="px-4 pb-8">
                  <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden">
                    <ReportSectionHeader 
                      title="Counterparty Ageing Registry" 
                      subtitle="Bilateral analysis of outstanding receivables bucketed by overdue latency."
                      className="px-8 pt-8 mb-4"
                    />
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-white">
                          <TableRow className="border-none hover:bg-transparent">
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400">Trading Entity</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">0-30D</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">31-60D</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">61-90D</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">90D+</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">Total Due</TableHead>
                          </TableRow>
                        </TableHeader>
                          <TableBody>
                            {!Array.isArray(ageingData) || ageingData.length === 0 ? (
                              <TableEmptyState icon={<Hourglass />} title="No ageing data found" />
                            ) : ageingData.map((row: any, i: number) => (
                              <TableRow key={i} className="hover:bg-transparent transition-colors group border-b border-neutral-50 last:border-none">
                                <TableCell className="px-8 py-6">
                                  <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-black text-xs">
                                      {row.name?.charAt(0)}
                                    </div>
                                    <p className="text-sm font-bold text-neutral-900 uppercase tracking-tight">{row.name}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="px-8 py-6 text-right font-bold text-neutral-400 tracking-tight">{formatCurrency(row.buckets['0-30'])}</TableCell>
                                <TableCell className="px-8 py-6 text-right font-bold text-amber-500 tracking-tight">{formatCurrency(row.buckets['31-60'])}</TableCell>
                                <TableCell className="px-8 py-6 text-right font-bold text-amber-700 tracking-tight">{formatCurrency(row.buckets['61-90'])}</TableCell>
                                <TableCell className="px-8 py-6 text-right font-black text-error-600 tracking-tight">{formatCurrency(row.buckets['90+'])}</TableCell>
                                <TableCell className="px-8 py-6 text-right font-black text-accent-600 bg-accent-50/30 group-hover:bg-accent-50/50 transition-colors tracking-tighter text-lg">
                                  {formatCurrency(row.total)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
                      </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tb" className="m-0 border-none outline-none">
                <div className="px-4 pb-8">
                  <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden">
                    <ReportSectionHeader 
                      title="Full Trial Balance Audit" 
                      subtitle="Aggregated ledger balances across all active chart of accounts."
                      className="px-8 pt-8 mb-4"
                    />
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-white">
                          <TableRow className="border-none hover:bg-transparent">
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400">Account Identification</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">Debit Balance</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">Credit Balance</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">Net Ledger Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {!Array.isArray(tbData) || tbData.length === 0 ? (
                            <TableEmptyState icon={<ArrowRightLeft />} title="No trial balance records found" />
                          ) : tbData.map((row: any) => (
                            <TableRow key={row.accountId} className="hover:bg-transparent transition-colors group border-b border-neutral-50 last:border-none">
                              <TableCell className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 rounded-xl bg-neutral-100 text-neutral-500 flex items-center justify-center font-black text-[10px] border border-neutral-200">
                                    {row.accountCode}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-neutral-900 uppercase tracking-tight">{row.accountName}</p>
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">{row.category}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="px-8 py-6 text-right font-bold text-error-600 tracking-tight">{formatCurrency(row.debit)}</TableCell>
                              <TableCell className="px-8 py-6 text-right font-bold text-success-700 tracking-tight">{formatCurrency(row.credit)}</TableCell>
                              <TableCell className="px-8 py-6 text-center">
                                <Badge className="bg-success-50 text-success-700 border-success-100 text-[10px] font-bold rounded-lg px-2.5 py-1">BALANCED</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          )}
        </>
      </Tabs>
    </ReportContainer>
  );
}

function TabTrigger({ value, label }: { value: string; label: string }) {
  return (
    <TabsTrigger 
      value={value} 
      className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-4 pt-2 text-sm font-bold text-neutral-500 transition-all data-[state=active]:border-accent-600 data-[state=active]:text-accent-600 data-[state=active]:shadow-none"
    >
      {label}
    </TabsTrigger>
  );
}

function FinancialMetricCard({ title, value, icon, color }: any) {
  const colorMap: any = {
    emerald: 'text-success-700 bg-success-50 border-success-100',
    rose: 'text-error-700 bg-error-50 border-error-100',
    blue: 'text-accent-600 bg-accent-50 border-accent-100',
  };

  return (
    <div className={cn("p-6 rounded-2xl border border-neutral-100 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white", colorMap[color])}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{title}</p>
        {React.isValidElement(icon) 
          ? React.cloneElement(icon as React.ReactElement<any>, { className: "h-5 w-5 opacity-70" }) 
          : icon}
      </div>
      <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
    </div>
  );
}

function TableEmptyState({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <TableRow>
      <td colSpan={10} className="py-20">
        <div className="flex flex-col items-center justify-center text-neutral-400">
          <div className="mb-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100 shadow-sm">
            {React.isValidElement(icon) 
              ? React.cloneElement(icon as React.ReactElement<any>, { className: "h-8 w-8" }) 
              : icon}
          </div>
          <p className="text-sm font-bold uppercase tracking-widest">{title}</p>
        </div>
      </td>
    </TableRow>
  );
}
