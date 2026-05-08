'use client';

import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { toast } from 'sonner';
import { TrendingUp, TrendingDown, IndianRupee, Activity, Truck } from 'lucide-react';

export default function VehicleAnalyticsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ revenue: 0, fuelCost: 0, maintenanceCost: 0, profit: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/fleet/analytics');
      const json = await res.json();
      if (res.ok) {
        setData(json.data || []);
        setSummary(json.summary || { revenue: 0, fuelCost: 0, maintenanceCost: 0, profit: 0 });
      }
    } catch (error) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { 
      header: 'Vehicle', 
      accessor: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <p className="font-black text-slate-900 uppercase tracking-tight text-sm leading-none">{row.regNo}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {row.trips} Trips Completed
            </p>
          </div>
        </div>
      )
    },
    {
      header: 'Revenue',
      accessor: (row: any) => (
        <p className="text-sm font-black text-slate-800">₹{row.revenue.toLocaleString()}</p>
      )
    },
    {
      header: 'Operating Costs',
      accessor: (row: any) => (
        <div>
          <p className="text-xs font-black text-rose-600">₹{row.totalCost.toLocaleString()}</p>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
            Fuel: ₹{row.fuelCost.toLocaleString()} | Maint: ₹{row.maintenanceCost.toLocaleString()}
          </p>
        </div>
      )
    },
    {
      header: 'Net Profit',
      accessor: (row: any) => {
        const isProfitable = row.profit >= 0;
        return (
          <div>
            <p className={`text-sm font-black ${isProfitable ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isProfitable ? '+' : ''}₹{row.profit.toLocaleString()}
            </p>
            <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest mt-1 ${isProfitable ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {isProfitable ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {row.margin}% Margin
            </div>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Vehicle P&L Analytics</h1>
          <p className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-widest">Fleet Profitability & Cost Breakdown</p>
        </div>
      </div>

      {/* Global Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-3xl border border-indigo-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10"><TrendingUp className="h-24 w-24" /></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Total Fleet Revenue</p>
          {loading ? (
            <div className="h-10 w-32 bg-indigo-100/50 rounded-lg animate-pulse mt-1" />
          ) : (
            <p className="text-3xl font-black text-indigo-700 tracking-tighter mt-1">₹{summary.revenue.toLocaleString()}</p>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Fuel Costs</p>
          {loading ? (
            <div className="h-10 w-32 bg-slate-50 rounded-lg animate-pulse mt-1" />
          ) : (
            <p className="text-3xl font-black text-slate-800 tracking-tighter mt-1">₹{summary.fuelCost.toLocaleString()}</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Maintenance Costs</p>
          {loading ? (
            <div className="h-10 w-32 bg-slate-50 rounded-lg animate-pulse mt-1" />
          ) : (
            <p className="text-3xl font-black text-slate-800 tracking-tighter mt-1">₹{summary.maintenanceCost.toLocaleString()}</p>
          )}
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6 rounded-3xl border border-emerald-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10"><IndianRupee className="h-24 w-24" /></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Net Fleet Profit</p>
          {loading ? (
            <div className="h-10 w-32 bg-emerald-100/50 rounded-lg animate-pulse mt-1" />
          ) : (
            <p className="text-3xl font-black text-emerald-700 tracking-tighter mt-1">₹{summary.profit.toLocaleString()}</p>
          )}
        </div>
      </div>

      {/* Analytics Data Table */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" /> Vehicle Performance Ledger
          </h2>
        </div>
        <DataTable 
          data={data} 
          columns={columns} 
          loading={loading}
        />
      </div>
    </div>
  );
}
