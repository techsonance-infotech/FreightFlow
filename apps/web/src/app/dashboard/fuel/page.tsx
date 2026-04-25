'use client';

import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, 
  ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { 
  Fuel, TrendingUp, History, Loader2, Save, 
  Search, Filter, ChevronRight, AlertCircle, 
  Truck, Calendar, CreditCard, User, MapPin,
  CheckCircle2, AlertTriangle, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function FuelPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [fuelEntries, setFuelEntries] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);

  const [formData, setFormData] = useState({
    vehicleId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    quantity: '',
    rate: '',
    amount: '',
    odometer: '',
    vendor: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [vRes, fRes] = await Promise.all([
        fetch('/api/v1/masters/vehicles?limit=100'),
        fetch('/api/v1/fleet/fuel'),
      ]);
      const vData = await vRes.json();
      const fData = await fRes.json();
      setVehicles(vData.data || []);
      setReport(fData);
      setFuelEntries(fData.entries || []);
    } catch (error) {
      toast.error('Failed to load fuel data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleId) return toast.error('Please select a vehicle');
    try {
      setSubmitting(true);
      const res = await fetch('/api/v1/fleet/fuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: parseFloat(formData.quantity),
          rate: Math.round(parseFloat(formData.rate) * 100),
          amount: Math.round(parseFloat(formData.amount) * 100),
          odometer: parseInt(formData.odometer),
        }),
      });
      if (!res.ok) throw new Error('Failed to add fuel entry');
      toast.success('Fuel entry added successfully');
      setFormData({
        vehicleId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        quantity: '',
        rate: '',
        amount: '',
        odometer: '',
        vendor: '',
      });
      fetchInitialData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const chartData = [...fuelEntries].reverse().slice(-10).map(e => ({
    date: format(new Date(e.date), 'dd MMM'),
    kmpl: Number(e.kmpl || 0),
    regNo: e.vehicle?.regNo
  }));

  if (loading) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Analyzing Fuel Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 px-4">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Fuel Intelligence</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Monitor consumption efficiency and cost anomalies across your fleet</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100 flex items-center gap-3 shadow-sm">
            <Activity className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Fleet Efficiency</p>
              <p className="text-sm font-black text-blue-700">{report?.avgKmpl || 0} KMPL Avg</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Stats Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Total Litres" value={`${(report?.totalLitres || 0).toLocaleString()} L`} sub="Consumption MTD" color="blue" />
        <MetricCard title="Fuel Expense" value={`₹${((report?.totalCost || 0) / 100).toLocaleString()}`} sub="Expenditure MTD" color="slate" />
        <MetricCard title="Optimal KM" value={`${(report?.totalDistance || 0).toLocaleString()} KM`} sub="Distance Covered" color="blue" />
        <MetricCard title="Anomalies" value="3" sub="Detected Spikes" color="amber" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* 3. Log Refill Panel (Left) */}
        <div className="xl:col-span-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm sticky top-32">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Fuel className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-none">Log Refill</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Record new fuel consumption</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <FormInputWrapper label="Vehicle Assignment">
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
                <FormInputWrapper label="Refill Date">
                  <input type="date" value={formData.date} onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))} className="premium-input px-4" />
                </FormInputWrapper>
                <FormInputWrapper label="Odometer (KM)">
                  <input type="number" value={formData.odometer} onChange={e => setFormData(prev => ({ ...prev, odometer: e.target.value }))} className="premium-input px-4" placeholder="KM Reading" />
                </FormInputWrapper>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormInputWrapper label="Quantity (L)">
                  <input type="number" step="0.01" value={formData.quantity} onChange={e => setFormData(prev => ({ ...prev, quantity: e.target.value }))} className="premium-input px-4 font-black" placeholder="0.00" />
                </FormInputWrapper>
                <FormInputWrapper label="Rate (₹/L)">
                  <input type="number" step="0.01" value={formData.rate} onChange={e => setFormData(prev => ({ ...prev, rate: e.target.value }))} className="premium-input px-4 font-black" placeholder="0.00" />
                </FormInputWrapper>
              </div>

              <FormInputWrapper label="Total Settlement (₹)">
                <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))} className="premium-input px-4 font-black text-blue-600 bg-blue-50/20" placeholder="0.00" />
              </FormInputWrapper>

              <FormInputWrapper label="Vendor / Location">
                <input value={formData.vendor} onChange={e => setFormData(prev => ({ ...prev, vendor: e.target.value }))} className="premium-input px-4" placeholder="e.g. HP Pump, Borivali" />
              </FormInputWrapper>

              <Button type="submit" loading={submitting} className="w-full h-12 text-xs">
                Log Consumption
              </Button>
            </form>
          </div>
        </div>

        {/* 4. Efficiency Analysis (Right) */}
        <div className="xl:col-span-8 space-y-10">
          {/* Chart Card */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">KMPL Efficiency Trend</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Last 10 Refills Analysis</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                <CheckCircle2 className="h-3 w-3" /> Healthy Consumption
              </div>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorKmpl" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                  <ReTooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', padding: '12px' }}
                    formatter={(value: any) => [value, 'KMPL']}
                  />
                  <Area type="monotone" dataKey="kmpl" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorKmpl)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table Card */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <History className="h-5 w-5 text-blue-600" />
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Refill Registry</h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/30 text-slate-400">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Date</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Unit Assignment</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Efficiency</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">Settlement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {fuelEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4 text-xs font-black text-slate-500">{format(new Date(entry.date), 'dd MMM yyyy')}</td>
                      <td className="px-8 py-4">
                        <p className="text-sm font-black text-slate-900">{entry.vehicle?.regNo}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{entry.odometer.toLocaleString()} KM ODO</p>
                      </td>
                      <td className="px-8 py-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm",
                          entry.isAnomaly ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                        )}>
                          {entry.kmpl || '0.0'} KMPL
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right font-black text-slate-900">₹{(entry.amount / 100).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, sub, color }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm text-center">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className={cn("text-xl font-black", color === 'blue' ? 'text-blue-600' : 'text-slate-900')}>{value}</h3>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{sub}</p>
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
