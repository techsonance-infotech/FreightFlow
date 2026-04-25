'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Loader2, Wrench, Calendar, ClipboardList, 
  CheckCircle2, Clock, Truck, User, CreditCard,
  Plus, Trash2, Search, Filter, History,
  Activity, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function MaintenancePage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    vehicleId: '',
    jobType: 'scheduled',
    description: '',
    mechanicAssigned: '',
    odometer: '',
    estimatedCost: '',
    startedAt: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [vRes, jRes] = await Promise.all([
        fetch('/api/v1/masters/vehicles?limit=100'),
        fetch('/api/v1/fleet/maintenance'),
      ]);
      const vData = await vRes.json();
      const jData = await jRes.json();
      setVehicles(vData.data || []);
      setJobs(Array.isArray(jData) ? jData : []);
    } catch (error) {
      toast.error('Failed to load maintenance data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleId) return toast.error('Please select a vehicle');
    try {
      setSubmitting(true);
      const res = await fetch('/api/v1/fleet/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          estimatedCost: Math.round(parseFloat(formData.estimatedCost || '0') * 100),
          odometer: parseInt(formData.odometer),
        }),
      });
      if (!res.ok) throw new Error('Failed to create job card');
      toast.success('Maintenance job card created');
      setFormData({
        vehicleId: '',
        jobType: 'scheduled',
        description: '',
        mechanicAssigned: '',
        odometer: '',
        estimatedCost: '',
        startedAt: format(new Date(), 'yyyy-MM-dd'),
      });
      fetchInitialData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/v1/fleet/maintenance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error('Update failed');
      toast.success(`Status updated to ${status}`);
      fetchInitialData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'in_progress': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Opening Job Cards...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 px-4">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Maintenance Hub</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage lifecycle repairs, job cards, and preventive service schedules</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-amber-50 px-6 py-3 rounded-2xl border border-amber-100 flex items-center gap-3 shadow-sm">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Active Jobs</p>
              <p className="text-sm font-black text-amber-700">{jobs.filter(j => j.status !== 'completed').length} In Workshop</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* 2. Job Card Creation (Left) */}
        <div className="xl:col-span-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm sticky top-32">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-none">Initialize Job Card</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Open new service request</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <FormInputWrapper label="Target Vehicle">
                <select 
                  value={formData.vehicleId} 
                  onChange={v => setFormData(prev => ({ ...prev, vehicleId: v.target.value }))}
                  className="premium-select"
                >
                  <option value="">Select Vehicle...</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.regNo} — {v.model}</option>)}
                </select>
              </FormInputWrapper>

              <div className="grid grid-cols-2 gap-4">
                <FormInputWrapper label="Job Category">
                  <select 
                    value={formData.jobType} 
                    onChange={v => setFormData(prev => ({ ...prev, jobType: v.target.value }))}
                    className="premium-select"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="breakdown">Breakdown</option>
                    <option value="repair">Repair</option>
                  </select>
                </FormInputWrapper>
                <FormInputWrapper label="Start Date">
                  <input type="date" value={formData.startedAt} onChange={e => setFormData(prev => ({ ...prev, startedAt: e.target.value }))} className="premium-input px-4" />
                </FormInputWrapper>
              </div>

              <FormInputWrapper label="Primary Problem / Goal">
                <input value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} className="premium-input px-4" placeholder="e.g. Engine Oil Change + Filters" />
              </FormInputWrapper>

              <div className="grid grid-cols-2 gap-4">
                <FormInputWrapper label="Current KM">
                  <input type="number" value={formData.odometer} onChange={e => setFormData(prev => ({ ...prev, odometer: e.target.value }))} className="premium-input px-4 font-black" placeholder="KM ODO" />
                </FormInputWrapper>
                <FormInputWrapper label="Budget (₹)">
                  <input type="number" value={formData.estimatedCost} onChange={e => setFormData(prev => ({ ...prev, estimatedCost: e.target.value }))} className="premium-input px-4 font-black text-emerald-600" placeholder="Estimate" />
                </FormInputWrapper>
              </div>

              <FormInputWrapper label="Workshop / Service Partner">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input value={formData.mechanicAssigned} onChange={e => setFormData(prev => ({ ...prev, mechanicAssigned: e.target.value }))} className="premium-input pl-11" placeholder="Mechanic Name" />
                </div>
              </FormInputWrapper>

              <Button type="submit" loading={submitting} className="w-full h-12 text-xs">
                Archive Job Card
              </Button>
            </form>
          </div>
        </div>

        {/* 3. Active Queue (Right) */}
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              <input placeholder="Search Job Cards by Vehicle or Mechanic..." className="w-full h-10 pl-11 pr-4 bg-transparent border-none text-sm font-bold focus:ring-0 outline-none" />
            </div>
            <Button variant="outline" size="sm" icon={<Filter className="h-3.5 w-3.5" />}>
              Filter Queue
            </Button>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-400">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Fleet Unit</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Service Details</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-center">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {jobs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <CheckCircle2 className="h-10 w-10 text-slate-100" />
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Workshop is currently empty</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[10px]">
                              {job.vehicle?.regNo?.slice(-2)}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900">{job.vehicle?.regNo}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(job.startedAt), 'dd MMM yyyy')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-xs font-black text-slate-700">{job.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{job.jobType}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">@{job.odometer} KM ODO</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <div className="flex justify-center">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-sm",
                              getStatusStyle(job.status)
                            )}>
                              {job.status === 'in_progress' ? 'In Service' : job.status.toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            {job.status === 'open' && (
                              <button onClick={() => updateStatus(job.id, 'in_progress')} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                                <Clock className="h-3 w-3" /> Start
                              </button>
                            )}
                            {job.status === 'in_progress' && (
                              <button onClick={() => updateStatus(job.id, 'completed')} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
                                <CheckCircle2 className="h-3 w-3" /> Finish
                              </button>
                            )}
                            {job.status === 'completed' && (
                              <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3" /> Archived
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormInputWrapper({ label, children }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      {children}
    </div>
  );
}
