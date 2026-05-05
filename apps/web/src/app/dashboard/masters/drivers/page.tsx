'use client';

import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { DriverForm } from '@/components/masters/driver-form';
import { type Driver } from '@freightflow/shared';
import { toast } from 'sonner';
import { format, isPast, isWithinInterval, addDays, parseISO } from 'date-fns';
import { exportToCSV, exportToExcel, exportToPDF } from '@/lib/export-utils';

export default function DriversPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/masters/drivers?page=${page}&limit=${limit}&search=${search}`);
      const result = await response.json();
      if (response.ok) { 
        setData(result.data); 
        setTotal(result.meta.total); 
      }
    } catch { 
      toast.error('Failed to fetch data'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [page, limit, search]);

  const handleExport = (formatType: 'csv' | 'excel' | 'pdf') => {
    const exportData = data.map(d => ({
      Name: d.employee?.name || 'Unknown',
      Phone: d.employee?.phone || 'N/A',
      'License No': d.dlNumber || 'N/A',
      'DL Expiry': d.dlExpiry ? format(parseISO(d.dlExpiry as any), 'dd MMM yyyy') : 'N/A',
      Salary: (d.employee?.salary || 0) / 100,
    }));

    const filename = `Drivers_List_${new Date().toISOString().split('T')[0]}`;

    if (formatType === 'csv') exportToCSV(exportData, filename);
    else if (formatType === 'excel') exportToExcel(exportData, filename);
    else {
      const headers = ['Name', 'Phone', 'License No', 'DL Expiry', 'Salary'];
      const pdfData = exportData.map(d => [d.Name, d.Phone, d['License No'], d['DL Expiry'], d.Salary.toLocaleString('en-IN')]);
      exportToPDF(headers, pdfData, filename, 'Driver Master List');
    }
  };

  const columns = [
    { 
      header: 'Driver Profile', 
      accessor: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg shadow-sm border border-blue-100/50">
            👨‍✈️
          </div>
          <div>
            <p className="font-black text-slate-900 leading-tight">{row.employee?.name || 'Unknown'}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{row.employee?.phone || 'No Phone'} • {row.employee?.empCode}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'License Details', 
      accessor: (row: any) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-black text-slate-700">{row.dlNumber || 'N/A'}</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.dlCategory || 'No Category'}</p>
        </div>
      )
    },
    { 
      header: 'DL Expiry', 
      accessor: (row: any) => {
        if (!row.dlExpiry) return <span className="text-slate-300 font-bold text-[10px] uppercase">Not Set</span>;
        
        const expiryDate = parseISO(row.dlExpiry as any);
        const isExpired = isPast(expiryDate);
        const isExpiringSoon = isWithinInterval(expiryDate, { start: new Date(), end: addDays(new Date(), 30) });
        
        let statusClass = 'text-green-600 bg-green-50 border-green-100';
        if (isExpired) statusClass = 'text-red-600 bg-red-50 border-red-100 animate-pulse';
        else if (isExpiringSoon) statusClass = 'text-amber-600 bg-amber-50 border-amber-100';

        return (
          <div className={`inline-flex px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-tight border ${statusClass}`}>
            {format(expiryDate, 'dd MMM yyyy')}
          </div>
        );
      }
    },
    { 
      header: 'Salary & Finances', 
      accessor: (row: any) => (
        <div>
          <p className="font-black text-blue-600 tabular-nums text-sm">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format((row.employee?.salary || 0) / 100)}
          </p>
          <p className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">Monthly Base</p>
        </div>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (row: any) => (
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={() => { setEditingItem(row); setIsModalOpen(true); }}
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-blue-500 hover:text-white transition-all text-sm shadow-sm border border-slate-100"
            title="Edit Driver"
          >
            ✏️
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">👨‍✈️</span>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Driver Master</h1>
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest ml-12">Fleet Crew, Compliance & Operational Settlements</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 mr-4">
            <Button variant="outline" size="sm" onClick={() => handleExport('csv')} className="rounded-xl border-slate-200 text-slate-600 font-bold text-[10px] uppercase">CSV</Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('excel')} className="rounded-xl border-slate-200 text-slate-600 font-bold text-[10px] uppercase">Excel</Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} className="rounded-xl border-slate-200 text-red-600 bg-red-50/30 hover:bg-red-600 hover:text-white font-bold text-[10px] uppercase">PDF</Button>
          </div>
          <Button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="rounded-2xl h-14 px-8 bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-100 font-black uppercase tracking-widest text-[11px] flex items-center gap-3">
            <span className="text-xl">+</span> Register New Driver
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Fleet Crew', value: total, icon: '📋', color: 'bg-blue-50', text: 'text-slate-900' },
          { label: 'Expiring Licenses', value: data.filter(d => d.dlExpiry && isWithinInterval(parseISO(d.dlExpiry as any), { start: new Date(), end: addDays(new Date(), 30) })).length, icon: '⚠️', color: 'bg-amber-50', text: 'text-amber-600' },
          { label: 'Expired Licenses', value: data.filter(d => d.dlExpiry && isPast(parseISO(d.dlExpiry as any))).length, icon: '❌', color: 'bg-red-50', text: 'text-red-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`h-12 w-12 rounded-2xl ${stat.color} flex items-center justify-center text-xl`}>{stat.icon}</div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
              {loading ? (
                <div className="h-8 w-16 bg-slate-100 animate-pulse rounded-lg mt-1" />
              ) : (
                <p className={`text-2xl font-black ${stat.text}`}>{stat.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <Input 
          placeholder="Search by driver name or license..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="max-w-md bg-white border-none h-14 rounded-2xl shadow-sm px-6"
        />

        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <DataTable 
            columns={columns} 
            data={data} 
            loading={loading}
            pagination={{
              page,
              limit,
              total,
              onPageChange: setPage,
              onLimitChange: setLimit
            }}
          />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Driver Profile' : 'Register New Driver'} size="lg">
        <DriverForm 
          initialData={editingItem} 
          onSuccess={() => { setIsModalOpen(false); fetchData(); }} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>
    </div>
  );
}
