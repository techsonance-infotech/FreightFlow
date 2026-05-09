'use client';

import React, { useState } from 'react';
import { 
  Clock, Calendar, Mail, 
  Plus, Settings, Trash2,
  CheckCircle2, XCircle, Play,
  Pause, ChevronRight, FileText,
  BarChart, Bell, History,
  ExternalLink, Search, Filter,
  Layers, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toggleReportSchedule } from '@/app/actions/reports/scheduler';
import { toast } from 'sonner';

interface ScheduledReport {
  id: string;
  reportType: string;
  schedule: 'daily' | 'weekly' | 'monthly';
  recipientEmails: string[];
  lastRunAt: string | null;
  nextRunAt: string | null;
  isActive: boolean;
}

export function ReportSchedulerManager({ reports }: { reports: ScheduledReport[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggle = async (id: string, current: boolean) => {
    setLoadingId(id);
    try {
      await toggleReportSchedule(id, !current);
      toast.success(`Schedule ${!current ? 'activated' : 'paused'}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-10 p-8 lg:p-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Automated Intelligence</h1>
          <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest">Hands-free Reporting & Delivery</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 font-black text-xs uppercase tracking-widest gap-3 shadow-sm">
            <History className="h-4 w-4" /> Delivery Logs
          </Button>
          <Button className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-200 gap-3">
            <Plus className="h-4 w-4" /> Schedule New
          </Button>
        </div>
      </div>

      {/* Grid Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Automation" value={reports.length} icon={<Layers className="h-5 w-5" />} color="slate" />
        <StatCard label="Active Schedules" value={reports.filter(r => r.isActive).length} icon={<Play className="h-5 w-5" />} color="blue" />
        <StatCard label="Emails Sent (MTD)" value={reports.length * 4} icon={<Send className="h-5 w-5" />} color="indigo" />
        <StatCard label="Success Rate" value="100%" icon={<CheckCircle2 className="h-5 w-5" />} color="emerald" />
      </div>

      {/* Report List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {reports.map((report) => (
          <div key={report.id} className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl shadow-lg">
                    <BarChart className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{report.reportType.replace('_', ' ')}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-widest">{report.schedule}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">• Next run: {report.nextRunAt ? format(new Date(report.nextRunAt), 'dd MMM, HH:mm') : 'Pending'}</span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => handleToggle(report.id, report.isActive)}
                  disabled={loadingId === report.id}
                  variant="ghost" 
                  className={cn(
                    "rounded-xl h-12 w-12 flex items-center justify-center transition-all",
                    report.isActive ? "bg-emerald-50 text-emerald-600 hover:bg-rose-50 hover:text-rose-600" : "bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                  )}
                >
                  {report.isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
              </div>

              <div className="space-y-6 mb-8">
                 <div className="space-y-3">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipients</p>
                   <div className="flex flex-wrap gap-2">
                     {report.recipientEmails.map((email, i) => (
                       <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-600">
                         <Mail className="h-3 w-3 text-slate-400" />
                         {email}
                       </div>
                     ))}
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-50">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Run</p>
                       <p className="text-xs font-black text-slate-700">{report.lastRunAt ? format(new Date(report.lastRunAt), 'dd MMM yyyy') : 'Never'}</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-50">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                       <p className={cn(
                         "text-xs font-black",
                         report.isActive ? "text-emerald-600" : "text-rose-600"
                       )}>
                         {report.isActive ? 'Active' : 'Paused'}
                       </p>
                    </div>
                 </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 h-12 rounded-xl border-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 gap-2">
                  <Settings className="h-3 w-3" /> Config
                </Button>
                <Button className="flex-1 h-12 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-slate-900/10 gap-2">
                  Run Now <Send className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {/* Background Accent */}
            <div className="absolute right-0 top-0 h-40 w-40 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-700" />
          </div>
        ))}
        
        {reports.length === 0 && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
            <Clock className="h-12 w-12 text-slate-100 mx-auto mb-4" />
            <p className="text-sm font-black text-slate-200 uppercase tracking-widest">No scheduled reports found</p>
            <Button variant="ghost" className="mt-4 font-black text-[10px] uppercase tracking-widest text-indigo-500">Add First Automation</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    slate: 'bg-slate-50 text-slate-400 border-slate-100'
  };

  return (
    <div className={cn(
      "p-8 rounded-[2.5rem] border shadow-sm relative overflow-hidden bg-white",
      colors[color] ? "" : "border-slate-100"
    )}>
      <div className={cn(
        "h-10 w-10 rounded-xl flex items-center justify-center mb-6",
        colors[color]
      )}>
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <h4 className="text-3xl font-black text-slate-900">{value}</h4>
    </div>
  );
}
