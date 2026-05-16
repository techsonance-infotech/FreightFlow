'use client';

import React, { useState } from 'react';
import { 
  Clock, Calendar, Mail, 
  Plus, Settings, Trash2,
  CheckCircle2, XCircle, Play,
  Pause, ChevronRight, FileText,
  BarChart, Bell, History,
  ExternalLink, Search, Filter,
  Layers, Send, Info, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { 
  toggleReportSchedule, 
  runReportNow, 
  deleteScheduledReport,
  createScheduledReport 
} from '@/app/actions/reports/scheduler';
import { toast } from 'sonner';
import { Modal } from '@/components/ui/modal';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    reportType: 'Financial_P&L',
    schedule: 'daily' as 'daily' | 'weekly' | 'monthly',
    recipientEmails: '',
  });

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

  const handleRunNow = async (id: string) => {
    const loadingToast = toast.loading('Triggering report generation...');
    try {
      await runReportNow(id);
      toast.success('Report successfully queued for delivery', { id: loadingToast });
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this automation?')) return;
    try {
      await deleteScheduledReport(id);
      toast.success('Automation removed');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCreate = async () => {
    if (!newReport.recipientEmails) {
      toast.error('Please add at least one recipient email');
      return;
    }
    try {
      await createScheduledReport({
        ...newReport,
        recipientEmails: newReport.recipientEmails.split(',').map(e => e.trim()),
      });
      setIsModalOpen(false);
      toast.success('Automation schedule created');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-10 p-8 lg:p-12 animate-in fade-in duration-700">
      {/* Explanation Banner */}
      <div className="bg-brand-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-brand-900/20">
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
          <div className="h-20 w-20 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center shrink-0">
            <Zap className="h-10 w-10 text-accent-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight mb-2">What is Report Automation?</h2>
            <p className="text-brand-100/80 font-medium max-w-2xl text-sm leading-relaxed">
              Automated Intelligence allows you to schedule any mission-critical report—including P&L, Fleet Compliance, GSTR-1, and TDS Registers—to be generated and delivered directly to stakeholders via email. Set your frequency, define recipients, and let FreightFlow handle the distribution hands-free.
            </p>
          </div>
          <div className="lg:ml-auto flex items-center gap-4">
             <div className="text-center">
                <p className="text-[10px] font-black text-brand-300 uppercase tracking-widest mb-1">Status</p>
                <div className="flex items-center gap-2 bg-success-500/20 px-4 py-2 rounded-xl border border-success-500/30">
                   <div className="h-2 w-2 rounded-full bg-success-500 animate-pulse" />
                   <span className="text-xs font-black uppercase tracking-widest">Engine Active</span>
                </div>
             </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-96 w-96 bg-accent-500/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-neutral-900 tracking-tighter">Automation Center</h1>
          <p className="text-sm font-medium text-neutral-500 mt-1 uppercase tracking-widest">Scheduled Insights & Stakeholder Delivery</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-neutral-200 font-black text-xs uppercase tracking-widest gap-3 shadow-sm bg-white hover:bg-neutral-50">
            <History className="h-4 w-4" /> Delivery Logs
          </Button>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="h-14 px-8 rounded-2xl bg-accent-600 hover:bg-accent-700 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-accent-600/20 gap-3"
          >
            <Plus className="h-4 w-4" /> Schedule New
          </Button>
        </div>
      </div>

      {/* Grid Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Workflows" value={reports.length} icon={<Layers className="h-5 w-5" />} color="neutral" />
        <StatCard label="Live Schedules" value={reports.filter(r => r.isActive).length} icon={<Play className="h-5 w-5" />} color="accent" />
        <StatCard label="Stakeholders" value="12 Active" icon={<Mail className="h-5 w-5" />} color="brand" />
        <StatCard label="Efficiency Gain" value="~14h/mo" icon={<Zap className="h-5 w-5" />} color="amber" />
      </div>

      {/* Report List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {reports.map((report) => (
          <div key={report.id} className="bg-white rounded-[3rem] border border-neutral-100 p-10 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-neutral-50">
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 rounded-2xl bg-brand-950 text-white flex items-center justify-center text-xl shadow-lg">
                    <BarChart className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-neutral-900 tracking-tight">{report.reportType.replace(/_/g, ' ')}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-black text-accent-600 bg-accent-50 px-2.5 py-1 rounded-lg uppercase tracking-widest">{report.schedule}</span>
                      <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">• Next run: {report.nextRunAt ? format(new Date(report.nextRunAt), 'dd MMM, HH:mm') : 'Pending'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => handleToggle(report.id, report.isActive)}
                    disabled={loadingId === report.id}
                    variant="ghost" 
                    className={cn(
                      "rounded-xl h-12 w-12 flex items-center justify-center transition-all",
                      report.isActive ? "bg-success-50 text-success-700 hover:bg-rose-50 hover:text-rose-600" : "bg-neutral-50 text-neutral-400 hover:bg-success-50 hover:text-success-700"
                    )}
                  >
                    {report.isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  <Button 
                    onClick={() => handleDelete(report.id)}
                    variant="ghost" 
                    className="rounded-xl h-12 w-12 flex items-center justify-center text-rose-300 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                 <div className="space-y-3">
                   <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Recipients</p>
                   <div className="flex flex-wrap gap-2">
                     {report.recipientEmails.map((email, i) => (
                       <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-50 border border-neutral-100 text-[10px] font-bold text-neutral-600">
                         <Mail className="h-3 w-3 text-neutral-400" />
                         {email}
                       </div>
                     ))}
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="p-5 rounded-2xl bg-neutral-50/50 border border-neutral-50">
                       <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1 text-center lg:text-left">Last Run Result</p>
                       <p className="text-xs font-black text-neutral-700 text-center lg:text-left">{report.lastRunAt ? format(new Date(report.lastRunAt), 'dd MMM yyyy') : 'Pending Execution'}</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-neutral-50/50 border border-neutral-50">
                       <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1 text-center lg:text-left">Current Status</p>
                       <p className={cn(
                         "text-xs font-black text-center lg:text-left",
                         report.isActive ? "text-success-700" : "text-rose-600"
                       )}>
                         {report.isActive ? 'Active Workflow' : 'Paused Engine'}
                       </p>
                    </div>
                 </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 h-12 rounded-xl border-neutral-200 text-neutral-600 font-black text-[10px] uppercase tracking-widest hover:bg-neutral-50 gap-2">
                  <Settings className="h-3 w-3" /> Edit Config
                </Button>
                <Button 
                  onClick={() => handleRunNow(report.id)}
                  className="flex-1 h-12 rounded-xl bg-neutral-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-neutral-900/10 gap-2"
                >
                  Trigger Instant Run <Send className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {/* Background Accent */}
            <div className="absolute right-0 top-0 h-40 w-40 bg-neutral-50 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-700" />
          </div>
        ))}
        
        {reports.length === 0 && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-neutral-100 rounded-[3rem]">
            <Clock className="h-12 w-12 text-neutral-100 mx-auto mb-4" />
            <p className="text-sm font-black text-neutral-200 uppercase tracking-widest">No Intelligence Workflows Found</p>
            <Button 
              onClick={() => setIsModalOpen(true)}
              variant="ghost" 
              className="mt-4 font-black text-[10px] uppercase tracking-widest text-accent-600"
            >
              Configure First Automation
            </Button>
          </div>
        )}
      </div>

      {/* New Report Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Schedule New Automation"
      >
        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Select Report Intelligence</label>
            <select 
              value={newReport.reportType}
              onChange={(e) => setNewReport({ ...newReport, reportType: e.target.value })}
              className="w-full h-12 px-4 rounded-xl bg-neutral-50 border border-neutral-100 text-sm font-bold outline-none focus:ring-2 focus:ring-accent-600/10 transition-all"
            >
              <option value="Financial_P&L">Financial: Profit & Loss</option>
              <option value="Financial_BalanceSheet">Financial: Balance Sheet</option>
              <option value="Accounting_SOA">Accounting: Statement of Account</option>
              <option value="Compliance_GSTR1">Compliance: GSTR-1 Review</option>
              <option value="Fleet_Compliance">Fleet: Document Expiry Audit</option>
              <option value="Logistics_TransitPerformance">Logistics: Transit Performance</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Frequency</label>
            <div className="flex gap-2">
              {(['daily', 'weekly', 'monthly'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setNewReport({ ...newReport, schedule: s })}
                  className={cn(
                    "flex-1 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    newReport.schedule === s 
                      ? "bg-brand-900 text-white shadow-lg" 
                      : "bg-neutral-50 text-neutral-400 hover:bg-neutral-100"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Recipient Emails (Comma separated)</label>
            <Input 
              placeholder="e.g. director@company.com, auditor@firm.com" 
              value={newReport.recipientEmails}
              onChange={(e) => setNewReport({ ...newReport, recipientEmails: e.target.value })}
              className="h-12 rounded-xl border-neutral-100 bg-neutral-50 font-bold"
            />
          </div>

          <Button 
            onClick={handleCreate}
            className="w-full h-14 bg-accent-600 hover:bg-accent-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-accent-600/20 mt-4"
          >
            Deploy Automation Workflow
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  const colors: any = {
    accent: 'bg-accent-50 text-accent-600 border-accent-100',
    brand: 'bg-brand-50 text-brand-900 border-brand-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    neutral: 'bg-neutral-50 text-neutral-400 border-neutral-100'
  };

  return (
    <div className={cn(
      "p-8 rounded-[2.5rem] border shadow-sm relative overflow-hidden bg-white hover:shadow-md transition-all",
      colors[color] ? "" : "border-neutral-100"
    )}>
      <div className={cn(
        "h-10 w-10 rounded-xl flex items-center justify-center mb-6",
        colors[color]
      )}>
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">{label}</p>
      <h4 className="text-3xl font-black text-neutral-900">{value}</h4>
    </div>
  );
}
