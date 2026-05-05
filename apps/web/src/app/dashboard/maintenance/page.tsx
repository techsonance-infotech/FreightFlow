'use client';

import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Wrench, CheckCircle2, CircleDashed, Hammer, Pencil, Trash2, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function MaintenanceHubPage() {
  const [data, setData] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [completionJob, setCompletionJob] = useState<any>(null);
  const [actualCost, setActualCost] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState({ total: 0, open: 0, estimatedCost: 0, actualCost: 0 });
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    vehicleId: '',
    jobType: 'scheduled',
    description: '',
    mechanicAssigned: '',
    odometer: '',
    estimatedCost: '',
    startedAt: ''
  });

  useEffect(() => {
    setMounted(true);
    setFormData(prev => ({ ...prev, startedAt: new Date().toISOString().split('T')[0] }));
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mRes, vRes] = await Promise.all([
        fetch('/api/v1/fleet/maintenance?limit=100'),
        fetch('/api/v1/masters/vehicles?limit=100')
      ]);
      const mJson = await mRes.json();
      const vJson = await vRes.json();
      
      if (mRes.ok) {
        const jobs = mJson.data || [];
        setData(jobs);
        
        let open = 0; let est = 0; let act = 0;
        jobs.forEach((j: any) => {
          if (j.status !== 'completed') open++;
          est += (j.estimatedCost || 0) / 100;
          act += (j.actualCost || 0) / 100;
        });
        setSummary({ total: jobs.length, open, estimatedCost: est, actualCost: act });
      }
      if (vRes.ok) setVehicles(vJson.data || []);
    } catch (error) {
      toast.error('Failed to load maintenance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (job: any) => {
    setEditingJob(job);
    setFormData({
      vehicleId: job.vehicleId,
      jobType: job.jobType,
      description: job.description,
      mechanicAssigned: job.mechanicAssigned || '',
      odometer: String(job.odometer),
      estimatedCost: String(job.estimatedCost / 100),
      startedAt: new Date(job.startedAt).toISOString().split('T')[0]
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleId || !formData.description || !formData.odometer) {
      return toast.error('Vehicle, Description, and Odometer are required');
    }
    
    try {
      setSubmitting(true);
      const url = editingJob ? `/api/v1/fleet/maintenance/${editingJob.id}` : '/api/v1/fleet/maintenance';
      const res = await fetch(url, {
        method: editingJob ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || `Failed to ${editingJob ? 'update' : 'log'} maintenance`);
      
      toast.success(`Maintenance job ${editingJob ? 'updated' : 'created'}`);
      setFormData({
        vehicleId: '', jobType: 'scheduled', description: '', mechanicAssigned: '',
        odometer: '', estimatedCost: '', startedAt: new Date().toISOString().split('T')[0]
      });
      setEditingJob(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteJob = async () => {
    if (!actualCost) return toast.error('Please enter the actual cost');
    
    try {
      setSubmitting(true);
      const res = await fetch(`/api/v1/fleet/maintenance/${completionJob.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed', actualCost: Number(actualCost) }),
      });
      if (res.ok) {
        toast.success('Job marked as completed');
        setCompletionJob(null);
        setActualCost('');
        fetchData();
      } else {
        throw new Error('Failed to complete job');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this maintenance record?')) return;
    try {
      const res = await fetch(`/api/v1/fleet/maintenance/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Record deleted');
        if (editingJob?.id === id) setEditingJob(null);
        fetchData();
      }
    } catch {
      toast.error('Error deleting record');
    }
  };

  const columns = [
    { 
      header: 'Job Info', 
      accessor: (row: any) => (
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-sm border ${row.jobType === 'breakdown' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
            <Hammer className="h-5 w-5" />
          </div>
          <div>
            <p className="font-black text-slate-900 uppercase tracking-tight text-sm leading-none">{row.vehicle?.regNo}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {row.jobType} • {format(new Date(row.startedAt), 'dd MMM yyyy')}
            </p>
          </div>
        </div>
      )
    },
    {
      header: 'Details',
      accessor: (row: any) => (
        <div>
          <p className="text-xs font-bold text-slate-700 truncate max-w-[200px]">{row.description}</p>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">
            Mecha: {row.mechanicAssigned || 'Unassigned'} • Odo: {row.odometer}
          </p>
        </div>
      )
    },
    {
      header: 'Cost',
      accessor: (row: any) => (
        <div>
          <p className="text-xs font-black text-slate-800">
            {row.actualCost ? `₹${(row.actualCost / 100).toLocaleString()}` : 'Pending'}
          </p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            Est: ₹{((row.estimatedCost || 0) / 100).toLocaleString()}
          </p>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (row: any) => (
        <div className="flex items-center gap-4">
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
            row.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
          }`}>
            {row.status}
          </span>
          {row.status !== 'completed' && (
            <Button 
              size="sm" variant="outline" 
              onClick={() => setCompletionJob(row)}
              className="h-7 text-[10px] font-black uppercase tracking-tighter"
            >
              Finish
            </Button>
          )}
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(row)} className="h-8 w-8 p-0 text-amber-600 hover:bg-amber-50">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row.id)} className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Maintenance Hub</h1>
          <p className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-widest">Service Logs & Breakdown Tracking</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-50 rounded-3xl border border-slate-100 animate-pulse" />
          ))
        ) : (
          <>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Jobs</p>
              <p className="text-4xl font-black text-slate-800 tracking-tighter mt-1">{summary.total}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-6 rounded-3xl border border-amber-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
              <div className="absolute -right-4 -top-4 text-7xl opacity-10">🔧</div>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Open Jobs</p>
              <p className="text-4xl font-black text-amber-700 tracking-tighter mt-1">{summary.open}</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-6 rounded-3xl border border-indigo-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
              <div className="absolute -right-4 -top-4 text-7xl opacity-10">💸</div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Total Estimated Cost</p>
              <p className="text-3xl font-black text-indigo-700 tracking-tighter mt-1">₹{summary.estimatedCost.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6 rounded-3xl border border-emerald-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
              <div className="absolute -right-4 -top-4 text-7xl opacity-10">💰</div>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Total Actual Cost</p>
              <p className="text-3xl font-black text-emerald-700 tracking-tighter mt-1">₹{summary.actualCost.toLocaleString()}</p>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Form */}
        <div className="xl:col-span-4">
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl shadow-slate-200/40 sticky top-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                {editingJob ? <Pencil className="h-5 w-5" /> : <Wrench className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-none">{editingJob ? 'Edit Maintenance Job' : 'Schedule Maintenance'}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{editingJob ? 'Modify job details' : 'Log repairs or scheduled service'}</p>
              </div>
              {editingJob && (
                <Button variant="ghost" size="sm" onClick={() => { setEditingJob(null); setFormData({ vehicleId: '', jobType: 'scheduled', description: '', mechanicAssigned: '', odometer: '', estimatedCost: '', startedAt: new Date().toISOString().split('T')[0] }); }} className="ml-auto text-rose-500 hover:bg-rose-50">Cancel</Button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Vehicle *</label>
                <select 
                  value={formData.vehicleId} 
                  onChange={e => setFormData(prev => ({ ...prev, vehicleId: e.target.value }))}
                  className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-50 outline-none"
                  required
                  disabled={!!editingJob}
                >
                  <option value="">Choose Vehicle...</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.regNo}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Job Type</label>
                  <select 
                    value={formData.jobType}
                    onChange={e => setFormData(prev => ({ ...prev, jobType: e.target.value }))}
                    className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-50 outline-none"
                  >
                    <option value="scheduled">Scheduled Service</option>
                    <option value="repair">Breakdown/Repair</option>
                    <option value="inspection">Inspection</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                  <input 
                    type="date" 
                    value={formData.startedAt}
                    onChange={e => setFormData(prev => ({ ...prev, startedAt: e.target.value }))}
                    className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-50 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Job Description *</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full h-24 p-4 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-50 outline-none resize-none"
                  placeholder="What needs to be done?"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mechanic/Workshop</label>
                  <input 
                    type="text" 
                    value={formData.mechanicAssigned}
                    onChange={e => setFormData(prev => ({ ...prev, mechanicAssigned: e.target.value }))}
                    className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-50 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Odometer (KM) *</label>
                  <input 
                    type="number" 
                    value={formData.odometer}
                    onChange={e => setFormData(prev => ({ ...prev, odometer: e.target.value }))}
                    className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-50 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estimated Cost (₹)</label>
                <input 
                  type="number" 
                  value={formData.estimatedCost}
                  onChange={e => setFormData(prev => ({ ...prev, estimatedCost: e.target.value }))}
                  className="w-full h-12 px-4 bg-blue-50 text-blue-700 border-none rounded-xl text-sm font-black outline-none"
                />
              </div>

              <Button type="submit" loading={submitting} className="w-full h-12 rounded-xl text-xs font-black tracking-widest uppercase">
                {editingJob ? 'Update Maintenance Job' : 'Log Maintenance'}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Data Table */}
        <div className="xl:col-span-8">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <h2 className="text-lg font-black text-slate-800 tracking-tight">Job History</h2>
              <Button variant="outline" size="sm" onClick={fetchData} className="h-8 rounded-xl font-bold">Refresh</Button>
            </div>
            <DataTable 
              data={data} 
              columns={columns} 
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Custom Completion Modal */}
      {completionJob && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Finish Job</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Enter final actual cost</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle</p>
                <p className="text-sm font-black text-slate-900 mt-1 uppercase">{completionJob.vehicle?.regNo}</p>
                <p className="text-[11px] font-bold text-slate-500 mt-0.5">{completionJob.description}</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Actual Cost (₹) *</label>
                <input 
                  type="number" 
                  autoFocus
                  value={actualCost}
                  onChange={e => setActualCost(e.target.value)}
                  className="w-full h-14 px-5 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl text-lg font-black text-slate-900 outline-none transition-all"
                  placeholder="0.00"
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setCompletionJob(null)}
                  className="flex-1 h-12 rounded-2xl font-black text-xs uppercase tracking-widest border-slate-200"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCompleteJob}
                  loading={submitting}
                  className="flex-[2] h-12 rounded-2xl font-black text-xs uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                >
                  Confirm Completion
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
