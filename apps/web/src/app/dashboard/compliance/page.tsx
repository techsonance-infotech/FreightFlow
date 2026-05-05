'use client';

import React, { useState, useEffect } from 'react';
import { ModuleGrid, ModuleCard } from '@/components/dashboard/widgets';
import { 
  ShieldCheck, Calculator, AlertCircle, FileText, 
  TrendingUp, BarChart3, Clock, Zap, Landmark,
  ChevronRight, ArrowRight, Download, RefreshCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function ComplianceHubPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/compliance/gst/dashboard');
      const json = await res.json();
      if (json.data) setData(json.data);
    } catch (err) {
      toast.error('Failed to load compliance metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (paise: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0 
    }).format(paise / 100);
  };

  const chartData = data ? [
    { name: 'Output Tax', value: data.summary.outputTax, color: '#F43F5E' },
    { name: 'ITC Claimed', value: data.summary.inputTax, color: '#10B981' }
  ] : [];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-6 w-6 rounded-lg bg-emerald-600 flex items-center justify-center">
              <ShieldCheck className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Compliance Intelligence</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">Tax & Statutory Control</h1>
          <p className="text-sm font-medium text-neutral-500 mt-1">Real-time GST liability tracking and filing readiness</p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={fetchDashboardData}
            variant="outline" 
            className="h-12 w-12 p-0 rounded-2xl border-neutral-200 hover:bg-neutral-50"
          >
            <RefreshCcw className={cn("h-4 w-4 text-neutral-400", loading && "animate-spin")} />
          </Button>
          <Button className="h-12 px-6 rounded-2xl bg-neutral-900 text-white font-black text-xs uppercase tracking-widest hover:bg-neutral-800 shadow-xl shadow-neutral-900/10">
            Download Yearly Audit
          </Button>
        </div>
      </div>

      {/* Intelligence Dashboard Section */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* GST Overview Card */}
        <div className="xl:col-span-8 bg-white rounded-[40px] border border-neutral-100 p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <Landmark className="h-32 w-32" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-xl font-black text-neutral-900 tracking-tight">GST Filing Readiness</h2>
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Period: {data?.periodName || 'Loading...'}</p>
              </div>
              <Badge className="bg-emerald-50 text-emerald-600 border-none px-3 py-1 font-black text-[9px] uppercase tracking-widest">
                System Healthy
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">MTD Output Liability</p>
                <h3 className="text-3xl font-black text-rose-600 tracking-tighter">{data ? formatCurrency(data.summary.outputTax) : '₹0'}</h3>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-neutral-400">
                  <TrendingUp className="h-3 w-3 text-rose-400" />
                  <span>Collected from Sales</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">MTD Input Tax Credit</p>
                <h3 className="text-3xl font-black text-emerald-600 tracking-tighter">{data ? formatCurrency(data.summary.inputTax) : '₹0'}</h3>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-neutral-400">
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                  <span>Eligible for Offset</span>
                </div>
              </div>

              <div className="space-y-2 p-6 bg-neutral-50 rounded-3xl border border-neutral-100">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Net Tax Payable</p>
                <h3 className="text-2xl font-black text-neutral-900 tracking-tighter">{data ? formatCurrency(data.summary.netPayable) : '₹0'}</h3>
                <div className="mt-4">
                  <Button variant="ghost" className="h-8 px-3 rounded-lg text-[10px] font-black uppercase text-accent-600 hover:bg-white p-0">
                    Pay Now <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-10 border-t border-neutral-50 grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* e-Invoice Progress */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-neutral-900 uppercase tracking-widest">e-Invoice Compliance</span>
                  <span className="text-xs font-black text-accent-600">{data?.einvoice.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent-600 transition-all duration-1000" 
                    style={{ width: `${data?.einvoice.percentage || 0}%` }}
                  />
                </div>
                <p className="text-[9px] font-bold text-neutral-400 uppercase">
                  {data?.einvoice.generated} of {data?.einvoice.total} B2B Invoices generated IRN
                </p>
              </div>

              <div className="flex items-center gap-6">
                 <div className="h-24 w-24">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie 
                        data={chartData} 
                        innerRadius={30} 
                        outerRadius={40} 
                        paddingAngle={5} 
                        dataKey="value"
                       >
                         {chartData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                         ))}
                       </Pie>
                       <Tooltip />
                     </PieChart>
                   </ResponsiveContainer>
                 </div>
                 <div>
                    <h4 className="text-xs font-black text-neutral-900 uppercase tracking-widest mb-2">Tax Gap Analysis</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[9px] font-bold text-neutral-500 uppercase">
                        <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        Liability: {data ? Math.round(data.summary.outputTax / 100).toLocaleString() : '0'}
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-bold text-neutral-500 uppercase">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        ITC Offset: {data ? Math.round(data.summary.inputTax / 100).toLocaleString() : '0'}
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deadlines Sidebar */}
        <div className="xl:col-span-4 bg-neutral-900 rounded-[40px] p-10 text-white shadow-2xl shadow-neutral-900/20">
          <div className="flex items-center gap-3 mb-10">
            <Clock className="h-5 w-5 text-amber-400" />
            <h3 className="text-sm font-black uppercase tracking-widest">Filing Deadlines</h3>
          </div>

          <div className="space-y-6">
            {data?.deadlines.map((d: any, i: number) => (
              <div key={i} className="group cursor-pointer">
                <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all">
                  <div>
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{d.form}</p>
                    <p className="text-sm font-bold mt-0.5">{d.dueDate}</p>
                  </div>
                  <Badge className="bg-amber-500/10 text-amber-400 border-amber-400/20 text-[8px] font-black uppercase">
                    {d.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
             <div className="flex items-center gap-3">
               <Zap className="h-4 w-4 text-blue-400" />
               <p className="text-[10px] font-black uppercase tracking-widest">System Quick Action</p>
             </div>
             <p className="text-[11px] text-neutral-400 leading-relaxed font-medium">
               GSTR-1 data is ready for export. You have 0 missing GSTINs in your sales record.
             </p>
             <Button className="w-full h-10 rounded-xl bg-white text-neutral-900 font-black text-[9px] uppercase tracking-widest hover:bg-neutral-100 transition-all">
               Generate JSON for GSTR-1
             </Button>
          </div>
        </div>
      </div>

      {/* Module Navigation Grid */}
      <div className="space-y-6">
        <div className="px-2">
          <h3 className="text-xs font-black text-neutral-900 uppercase tracking-widest flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-accent-600" /> Compliance Modules
          </h3>
        </div>
        <ModuleGrid>
          <ModuleCard 
            title="GSTR-1 Preparation" 
            description="Outward supply reporting and JSON generation" 
            icon="📊" 
            path="/dashboard/compliance/gst/gstr1" 
            color="#1565C0" 
          />
          <ModuleCard 
            title="GSTR-3B Summary" 
            description="Net tax liability calculation (Sales vs ITC)" 
            icon="🧮" 
            path="/dashboard/compliance/gst/gstr3b" 
            color="#2E7D32" 
          />
          <ModuleCard 
            title="e-Invoice Management" 
            description="IRN generation and QR code tracking" 
            icon="🧾" 
            path="/dashboard/compliance/gst/einvoice" 
            color="#1E88E5" 
          />
          <ModuleCard 
            title="TDS Management" 
            description="Quarterly deductions, Form 26Q and challans" 
            icon="✂️" 
            path="/dashboard/compliance/tds" 
            color="#C62828" 
          />
          <ModuleCard 
            title="GSTR-2A Recon" 
            description="Reconcile books with portal data to safeguard ITC" 
            icon="🛡️" 
            path="/dashboard/compliance/gst/gstr2a" 
            color="#6A1B9A" 
          />
        </ModuleGrid>
      </div>
    </div>
  );
}
