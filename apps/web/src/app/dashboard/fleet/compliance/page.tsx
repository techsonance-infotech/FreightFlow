'use client';

import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function FleetCompliancePage() {
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ total: 0, safe: 0, warning: 0, critical: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/fleet/compliance');
      const result = await response.json();
      if (response.ok) {
        setData(result.data);
        setSummary(result.summary);
      }
    } catch (error) {
      toast.error('Failed to fetch compliance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { 
      header: 'Vehicle Info', 
      accessor: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg shadow-sm">
            🚚
          </div>
          <div>
            <p className="font-black text-slate-900 uppercase tracking-tighter text-lg leading-none">{row.regNo}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{row.make} {row.model}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Overall Status',
      accessor: (row: any) => {
        const bg = row.overallStatus === 'safe' ? 'bg-emerald-100 text-emerald-700' :
                   row.overallStatus === 'warning' ? 'bg-amber-100 text-amber-700' :
                   'bg-rose-100 text-rose-700';
        return (
          <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm ${bg}`}>
            {row.overallStatus}
          </span>
        );
      }
    },
    {
      header: 'Missing / Expiring Issues',
      accessor: (row: any) => (
        <div className="space-y-1">
          {row.issues.filter((i: any) => i.status !== 'safe').length === 0 && (
            <p className="text-[10px] font-black tracking-widest uppercase text-emerald-600/70 bg-emerald-50 inline-block px-2 py-1 rounded-lg">All documents valid</p>
          )}
          {row.issues.filter((i: any) => i.status !== 'safe').map((issue: any, idx: number) => (
            <div key={idx} className={`text-[9px] px-2 py-1 rounded-lg border font-black uppercase tracking-wider inline-flex items-center gap-1 mr-2 mb-1 shadow-sm ${
              issue.status === 'missing' || issue.status === 'expired' 
                ? 'bg-rose-50 border-rose-200 text-rose-600' 
                : 'bg-amber-50 border-amber-200 text-amber-600'
            }`}>
              <span className="opacity-60">{issue.type}:</span> {issue.message}
            </div>
          ))}
        </div>
      )
    },
    {
      header: 'Action',
      accessor: (row: any) => (
        <Link href={`/dashboard/masters/vehicles`}>
          <Button variant="outline" size="sm" className="h-8 rounded-xl text-xs font-bold shadow-sm">
            Update Vehicle
          </Button>
        </Link>
      )
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Compliance Engine</h1>
          <p className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-widest">Global Overview of Fleet Compliance</p>
        </div>
        <Button onClick={fetchData} variant="outline" className="rounded-xl shadow-sm h-10 font-bold">
          Refresh Scan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scanned Vehicles</p>
          {loading ? (
            <div className="h-10 w-16 bg-slate-50 rounded-lg animate-pulse mt-1" />
          ) : (
            <p className="text-4xl font-black text-slate-800 tracking-tighter mt-1">{summary.total}</p>
          )}
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6 rounded-3xl border border-emerald-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-7xl opacity-10">✅</div>
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Safe Status</p>
          {loading ? (
            <div className="h-10 w-16 bg-emerald-100/50 rounded-lg animate-pulse mt-1" />
          ) : (
            <p className="text-4xl font-black text-emerald-700 tracking-tighter mt-1">{summary.safe}</p>
          )}
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-6 rounded-3xl border border-amber-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-7xl opacity-10">⚠️</div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Expiring (30 Days)</p>
          {loading ? (
            <div className="h-10 w-16 bg-amber-100/50 rounded-lg animate-pulse mt-1" />
          ) : (
            <p className="text-4xl font-black text-amber-700 tracking-tighter mt-1">{summary.warning}</p>
          )}
        </div>
        <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 p-6 rounded-3xl border border-rose-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-7xl opacity-10">🚨</div>
          <p className="text-[10px] font-black uppercase tracking-widest text-rose-600">Critical Issues</p>
          {loading ? (
            <div className="h-10 w-16 bg-rose-100/50 rounded-lg animate-pulse mt-1" />
          ) : (
            <p className="text-4xl font-black text-rose-700 tracking-tighter mt-1">{summary.critical}</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-lg font-black text-slate-800 tracking-tight">Vehicle Compliance Matrix</h2>
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
