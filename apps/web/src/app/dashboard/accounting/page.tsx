'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  ModuleGrid, ModuleCard 
} from '@/components/dashboard/widgets';
import { 
  ReportContainer, StatCard, LoadingState 
} from '@/components/reports/report-components';
import { 
  TrendingUp, TrendingDown, Wallet, ArrowUpRight, 
  ArrowDownLeft, Clock, ShieldCheck, AlertCircle,
  Landmark, CreditCard, Receipt, FileText, Settings2,
  ChevronRight, ArrowRight, Activity, Folders, FileEdit,
  ArrowDownToLine, ArrowUpFromLine, Banknote, Scale
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

export default function AccountingHubPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/v1/accounting/dashboard');
      const json = await res.json();
      if (json.data) setData(json.data);
      else setData({});
    } catch (err) {
      toast.error('Failed to load dashboard metrics');
      setData({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (paise: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0 
    }).format(paise / 100);
  };

  if (loading) return <LoadingState rows={10} />;

  const mtdNet = (data?.mtdStats?.revenue || 0) - (data?.mtdStats?.expense || 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-6 w-6 rounded-lg bg-accent-600 flex items-center justify-center shadow-lg shadow-accent-600/20">
              <Landmark className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[10px] font-black text-accent-600 uppercase tracking-[0.2em]">Financial Intelligence</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-neutral-900">Accounting Control Center</h1>
          <p className="text-sm font-medium text-neutral-500 mt-1 flex items-center gap-2">
            <Activity className="h-3 w-3 text-emerald-500" />
            Real-time ledger monitoring and compliance tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard/accounting/settings')}
            className="h-12 px-6 rounded-2xl border-neutral-200 font-bold text-xs uppercase tracking-widest gap-2 bg-white"
          >
            <Settings2 className="h-4 w-4" />
            Global Settings
          </Button>
          <Button className="h-12 px-6 rounded-2xl bg-accent-600 hover:bg-accent-700 text-white shadow-xl shadow-accent-600/20 font-black text-xs uppercase tracking-widest gap-2">
            <TrendingUp className="h-4 w-4" />
            Close Books
          </Button>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Cash & Bank"
          value={formatCurrency(data?.balances?.reduce((sum: any, b: any) => sum + b.balance, 0) || 0)}
          subValue={`${data?.balances?.length || 0} Connected Accounts`}
          icon={<Wallet className="h-6 w-6" />}
          color="blue"
        />
        <StatCard 
          title="Monthly Revenue"
          value={formatCurrency(data?.mtdStats?.revenue || 0)}
          subValue="Current Month Earnings"
          icon={<ArrowDownLeft className="h-6 w-6" />}
          color="emerald"
          trend={{ value: 'MTD', isUp: true }}
        />
        <StatCard 
          title="Monthly Expense"
          value={formatCurrency(data?.mtdStats?.expense || 0)}
          subValue="Operational Outflow"
          icon={<ArrowUpRight className="h-6 w-6" />}
          color="rose"
          trend={{ value: 'MTD', isUp: true }}
        />
        <StatCard 
          title="Net Margin"
          value={formatCurrency(mtdNet)}
          subValue={mtdNet >= 0 ? "Operating Surplus" : "Operating Deficit"}
          icon={<TrendingUp className="h-6 w-6" />}
          color={mtdNet >= 0 ? "blue" : "rose"}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Cash Flow Intelligence */}
        <div className="xl:col-span-2 bg-white p-8 rounded-[40px] border border-neutral-100 shadow-[0_8px_40px_rgb(0,0,0,0.03)] relative overflow-hidden group">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest">Cash Flow Trends</h3>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Inflow vs Outflow — Last 6 Months</p>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black text-neutral-900 uppercase tracking-wider">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-rose-500" />
                <span className="text-[10px] font-black text-neutral-900 uppercase tracking-wider">Expense</span>
              </div>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.cashFlowChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 800, fill: '#999' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 800, fill: '#999' }}
                  tickFormatter={(v) => `₹${v/1000}k`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                    fontSize: '11px',
                    fontWeight: 900,
                    textTransform: 'uppercase'
                  }} 
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
                <Bar dataKey="expense" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Health & Dues */}
        <div className="space-y-8">
          {/* Receivables/Payables Card */}
          <div className="bg-neutral-900 rounded-[40px] p-8 text-white shadow-2xl shadow-neutral-900/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Activity className="h-24 w-24" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-8">Working Capital health</h3>
            
            <div className="space-y-8 relative z-10">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Receivables</p>
                  <p className="text-2xl font-black tracking-tight">{formatCurrency(data?.receivables?.total || 0)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{data?.receivables?.count || 0} Unpaid</p>
                </div>
              </div>
              <div className="h-[1px] w-full bg-white/10" />
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1">Payables</p>
                  <p className="text-2xl font-black tracking-tight">{formatCurrency(data?.payables?.total || 0)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{data?.payables?.count || 0} Bills Due</p>
                </div>
              </div>
            </div>

            <Button className="w-full mt-10 h-14 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/5 font-black text-[10px] uppercase tracking-widest transition-all">
              Optimize Cash Cycle
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Compliance Alerts */}
          <div className="bg-white p-8 rounded-[40px] border border-neutral-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black text-neutral-900 uppercase tracking-widest">Compliance Alerts</h3>
              <Badge className="bg-amber-50 text-amber-600 border-amber-100 font-black text-[9px] px-2 py-0.5 rounded-lg">STATUTORY</Badge>
            </div>
            
            <div className="space-y-6">
              {data?.pendingApprovals > 0 && (
                <div className="p-5 bg-amber-50 rounded-3xl border border-amber-100 group cursor-pointer hover:bg-amber-100 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-black text-amber-900 uppercase tracking-tight">{data.pendingApprovals} Vouchers Pending</p>
                      <p className="text-[10px] font-bold text-amber-600/70 uppercase tracking-widest mt-0.5">Awaiting Audit/Approval</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              )}
              {(!data?.deadlines || data.deadlines.length === 0) ? (
                <div className="flex flex-col items-center py-4 text-center">
                  <ShieldCheck className="h-8 w-8 text-emerald-500 mb-2 opacity-20" />
                  <p className="text-[10px] font-bold text-neutral-400 uppercase">All clear!</p>
                </div>
              ) : data?.deadlines?.map((d: any, i: number) => (
                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border transition-all group-hover:scale-105",
                    d.daysLeft <= 3 ? "bg-rose-50 border-rose-100 text-rose-500" : "bg-neutral-50 border-neutral-100 text-neutral-400"
                  )}>
                    {d.daysLeft <= 3 ? <AlertCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-neutral-900 uppercase tracking-tight truncate">{d.type} Filing Due</p>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">Deadline: {d.due}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      d.daysLeft <= 3 ? "text-rose-600" : "text-neutral-500"
                    )}>{d.daysLeft}d left</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Accounting Tools Launcher */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div>
            <h2 className="text-xl font-black text-neutral-900 tracking-tight">Accounting Module Launcher</h2>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">Direct access to core financial registries</p>
          </div>
        </div>

        <ModuleGrid>
          <ModuleCard 
            title="Chart of Accounts" 
            description="Manage your GL structure, groups and accounts" 
            icon={<Folders className="h-6 w-6" />} 
            path="/dashboard/accounting/coa" 
            color="#1565C0" 
          />
          <ModuleCard 
            title="Journal Vouchers" 
            description="Create and review double-entry journal entries" 
            icon={<FileEdit className="h-6 w-6" />} 
            path="/dashboard/accounting/vouchers" 
            color="#1E88E5" 
          />
          <ModuleCard 
            title="Accounts Receivable" 
            description="Track customer dues, ageing and collections" 
            icon={<ArrowDownToLine className="h-6 w-6" />} 
            path="/dashboard/accounting/ar" 
            color="#2E7D32" 
          />
          <ModuleCard 
            title="Dealer Billing Hub" 
            description="Generate consolidated invoices and dealer reports" 
            icon={<Receipt className="h-6 w-6" />} 
            path="/dashboard/accounting/dealer-billing" 
            color="#0D47A1" 
          />
          <ModuleCard 
            title="Accounts Payable" 
            description="Manage vendor bills, payments and TDS" 
            icon={<ArrowUpFromLine className="h-6 w-6" />} 
            path="/dashboard/accounting/ap" 
            color="#E65100" 
          />
          <ModuleCard 
            title="Bank Reconciliation" 
            description="Auto-match bank statements with system ledgers" 
            icon={<Banknote className="h-6 w-6" />} 
            path="/dashboard/accounting/bank" 
            color="#0277BD" 
          />
          <ModuleCard 
            title="Cheque Inventory" 
            description="Track physical cheque books and leaf status" 
            icon={<CreditCard className="h-6 w-6" />} 
            path="/dashboard/accounting/bank/cheques" 
            color="#0D47A1" 
          />
          <ModuleCard 
            title="Audit Trail" 
            description="Immutable history of all financial activities" 
            icon={<ShieldCheck className="h-6 w-6" />} 
            path="/dashboard/accounting/audit-logs" 
            color="#374151" 
          />
          <ModuleCard 
            title="Tax & Compliance" 
            description="GST preparation, e-Invoicing and statutory returns" 
            icon={<Scale className="h-6 w-6" />} 
            path="/dashboard/compliance" 
            color="#7B1FA2" 
          />
        </ModuleGrid>
      </div>
    </div>
  );
}
