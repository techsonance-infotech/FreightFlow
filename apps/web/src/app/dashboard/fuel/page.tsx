'use client';

import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Fuel, AlertTriangle, TrendingUp, Filter, Plus, Pencil, Trash2, IndianRupee, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { formatUtcDate } from '@/lib/utils';

export default function FuelTrackingPage() {
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState({ totalVolume: 0, totalCost: 0, anomalies: 0 });

  const [formData, setFormData] = useState({
    vehicleId: '',
    date: new Date().toISOString().split('T')[0],
    quantity: '',
    rate: '',
    amount: '',
    odometer: '',
    vendor: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fuelRes, vehRes] = await Promise.all([
        fetch('/api/v1/fleet/fuel?limit=100'),
        fetch('/api/v1/masters/vehicles?limit=100')
      ]);
      const fuelJson = await fuelRes.json();
      const vehJson = await vehRes.json();
      
      if (fuelRes.ok) {
        const entries = fuelJson.data || [];
        setData(entries);
        
        let vol = 0; let cost = 0; let anom = 0;
        entries.forEach((e: any) => {
          vol += Number(e.quantity);
          cost += e.amount / 100;
          if (e.isAnomaly) anom++;
        });
        setSummary({ totalVolume: vol, totalCost: cost, anomalies: anom });
      }
      if (vehRes.ok) {
        setVehicles(vehJson.data || []);
      }
    } catch (error) {
      toast.error('Failed to load fuel data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto calculate amount if quantity and rate are present
  useEffect(() => {
    if (formData.quantity && formData.rate) {
      const amt = Number(formData.quantity) * Number(formData.rate);
      setFormData(prev => ({ ...prev, amount: amt.toFixed(2) }));
    }
  }, [formData.quantity, formData.rate]);

  const handleEdit = (entry: any) => {
    setEditingEntry(entry);
    setFormData({
      vehicleId: entry.vehicleId,
      date: new Date(entry.date).toISOString().split('T')[0],
      quantity: String(entry.quantity),
      rate: String(entry.rate / 100),
      amount: String(entry.amount / 100),
      odometer: String(entry.odometer),
      vendor: entry.vendor || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fuel entry?')) return;
    try {
      const res = await fetch(`/api/v1/fleet/fuel/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete entry');
      toast.success('Entry deleted successfully');
      if (editingEntry?.id === id) setEditingEntry(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleId || !formData.quantity || !formData.odometer) {
      return toast.error('Vehicle, Quantity, and Odometer are required');
    }

    const qty = Number(formData.quantity);
    const rate = Number(formData.rate);
    const amt = Number(formData.amount);
    const odo = Number(formData.odometer);

    if (qty <= 0) return toast.error('Quantity must be greater than zero');
    if (odo < 0) return toast.error('Odometer reading cannot be negative');
    if (rate < 0) return toast.error('Fuel Rate cannot be negative');
    if (amt < 0) return toast.error('Total Amount cannot be negative');
    
    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        quantity: qty,
        rate: rate,
        amount: amt,
        odometer: odo
      };

      const url = editingEntry ? `/api/v1/fleet/fuel/${editingEntry.id}` : '/api/v1/fleet/fuel';
      const res = await fetch(url, {
        method: editingEntry ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error || 'Failed to log fuel');
      
      if (result.data.isAnomaly) {
        toast.warning('Fuel Logged with Anomaly Warning!', { description: result.data.anomalyReason });
      } else {
        toast.success(`Fuel entry ${editingEntry ? 'updated' : 'logged'} successfully`);
      }
      
      setFormData({
        vehicleId: '',
        date: new Date().toISOString().split('T')[0],
        quantity: '',
        rate: '',
        amount: '',
        odometer: '',
        vendor: ''
      });
      setEditingEntry(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { 
      header: 'Vehicle', 
      accessor: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-[10px] text-blue-600">
            {row.vehicle?.regNo?.slice(-4)}
          </div>
          <div>
            <p className="font-black text-slate-900 uppercase tracking-tight text-sm leading-none">{row.vehicle?.regNo}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {formatUtcDate(row.date, 'dd MMM yyyy')}
            </p>
          </div>
        </div>
      )
    },
    {
      header: 'Fuel Data',
      accessor: (row: any) => (
        <div>
          <p className="text-sm font-black text-slate-800">{Number(row.quantity).toFixed(2)} L</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mt-0.5">
            ₹{(row.amount / 100).toFixed(2)} @ ₹{(row.rate / 100).toFixed(2)}/L
          </p>
        </div>
      )
    },
    {
      header: 'Efficiency (KMPL)',
      accessor: (row: any) => {
        if (!row.kmpl) return <span className="text-xs text-slate-400 font-bold">First Entry</span>;
        const kmpl = Number(row.kmpl);
        const isGood = kmpl >= 3.0;
        return (
          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border shadow-sm ${isGood ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
            <TrendingUp className="h-3 w-3" />
            <span className="text-xs font-black">{kmpl.toFixed(2)} km/l</span>
          </div>
        );
      }
    },
    {
      header: 'Anomaly Status',
      accessor: (row: any) => {
        if (!row.isAnomaly) return <span className="text-emerald-500 font-black text-xs">OK</span>;
        return (
          <div className="max-w-[180px]">
            <div className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-100">
              <AlertTriangle className="h-3 w-3" />
              <span className="text-[9px] font-black uppercase tracking-wider">Detected</span>
            </div>
            <p className="text-[8px] text-rose-500 font-bold mt-1 leading-tight">{row.anomalyReason}</p>
          </div>
        );
      }
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Fuel Analytics</h1>
          <p className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-widest">Efficiency Tracking & Anomaly Detection</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-50 rounded-3xl border border-slate-100 animate-pulse" />
          ))
        ) : (
          <>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Volume Logged</p>
              <p className="text-4xl font-black text-slate-800 tracking-tighter mt-1">{summary.totalVolume.toFixed(2)} <span className="text-xl">L</span></p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-3xl border border-blue-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
              <div className="absolute -right-4 -top-4 text-7xl opacity-10 text-blue-600">
                <IndianRupee className="h-24 w-24" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Total Fuel Expense</p>
              <p className="text-4xl font-black text-blue-700 tracking-tighter mt-1">₹ {summary.totalCost.toLocaleString()}</p>
            </div>
            <div className={`p-6 rounded-3xl shadow-sm flex flex-col justify-center relative overflow-hidden ${summary.anomalies > 0 ? 'bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200' : 'bg-emerald-50 border border-emerald-100'}`}>
              <div className="absolute -right-4 -top-4 text-7xl opacity-10 text-rose-600">
                {summary.anomalies > 0 ? <AlertTriangle className="h-24 w-24" /> : <CheckCircle2 className="h-24 w-24 text-emerald-600" />}
              </div>
              <p className={`text-[10px] font-black uppercase tracking-widest ${summary.anomalies > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>Anomalies Detected</p>
              <p className={`text-4xl font-black tracking-tighter mt-1 ${summary.anomalies > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>{summary.anomalies}</p>
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
                {editingEntry ? <Pencil className="h-5 w-5" /> : <Fuel className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-none">{editingEntry ? 'Edit Fuel Entry' : 'Log Fuel Entry'}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{editingEntry ? 'Modify existing log' : 'Record fill-ups & calculate KMPL'}</p>
              </div>
              {editingEntry && (
                <Button variant="ghost" size="sm" onClick={() => { setEditingEntry(null); setFormData({ vehicleId: '', date: new Date().toISOString().split('T')[0], quantity: '', rate: '', amount: '', odometer: '', vendor: '' }); }} className="ml-auto text-rose-500 hover:text-rose-600 hover:bg-rose-50">Cancel</Button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Vehicle *</label>
                <select 
                  value={formData.vehicleId} 
                  onChange={e => setFormData(prev => ({ ...prev, vehicleId: e.target.value }))}
                  className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-50 transition-all outline-none"
                  required
                  disabled={!!editingEntry}
                >
                  <option value="">Choose Vehicle...</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.regNo}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-50 outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Odometer *</label>
                  <input 
                    type="number" min="0"
                    value={formData.odometer}
                    onChange={e => setFormData(prev => ({ ...prev, odometer: e.target.value }))}
                    placeholder="Current KM"
                    className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-50 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity (Litres) *</label>
                  <input 
                    type="number" step="0.01" min="0.01"
                    value={formData.quantity}
                    onChange={e => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-50 outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rate (per L) *</label>
                  <input 
                    type="number" step="0.01" min="0"
                    value={formData.rate}
                    onChange={e => setFormData(prev => ({ ...prev, rate: e.target.value }))}
                    className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-50 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Amount (₹) *</label>
                <input 
                  type="number" step="0.01" min="0"
                  value={formData.amount}
                  onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full h-12 px-4 bg-blue-50 text-blue-700 border-none rounded-xl text-sm font-black outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vendor/Pump Name</label>
                <input 
                  type="text" 
                  value={formData.vendor}
                  onChange={e => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                  className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-50 outline-none"
                />
              </div>

              <Button type="submit" loading={submitting} className="w-full h-12 rounded-xl text-xs font-black tracking-widest uppercase">
                {editingEntry ? 'Update Fuel Log' : 'Submit Fuel Log'}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Data Table */}
        <div className="xl:col-span-8">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <h2 className="text-lg font-black text-slate-800 tracking-tight">Recent Fuel Logs</h2>
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
    </div>
  );
}
