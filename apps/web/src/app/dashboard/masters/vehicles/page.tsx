'use client';

import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { VehicleForm } from '@/components/masters/vehicle-form';
import { VehicleHistory } from '@/components/masters/vehicle-history';
import { type Vehicle } from '@freightflow/shared';
import { toast } from 'sonner';
import { format, isPast, isWithinInterval, addDays, parseISO } from 'date-fns';
import { exportToCSV, exportToExcel, exportToPDF } from '@/lib/export-utils';

export default function VehiclesPage() {
  const [data, setData] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Vehicle | null>(null);
  const [historyItem, setHistoryItem] = useState<Vehicle | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/masters/vehicles?page=${page}&limit=${limit}&search=${search}`);
      const result = await response.json();
      if (response.ok) {
        setData(result.data);
        setTotal(result.meta.total);
      }
    } catch (error) {
      toast.error('Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [page, limit, search]);

  const handleDelete = async (item: Vehicle) => {
    if (!confirm(`Are you sure you want to delete vehicle ${item.regNo}? This action is irreversible.`)) return;
    try {
      const res = await fetch(`/api/v1/masters/vehicles/${item.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Vehicle deleted successfully');
        fetchData();
      }
    } catch {
      toast.error('Error deleting vehicle');
    }
  };

  const handleExport = (formatType: 'csv' | 'excel' | 'pdf') => {
    const exportData = data.map(v => ({
      'Reg No': v.regNo,
      'Make/Model': `${v.make} ${v.model}`,
      'Type': v.type,
      'Ownership': v.ownership,
      'Payload (Kg)': v.payloadKg || 0,
      'Status': v.status,
      'Driver': (v as any).assignedDriver?.name || 'Unassigned'
    }));

    const filename = `Vehicle_Master_${new Date().toISOString().split('T')[0]}`;

    if (formatType === 'csv') exportToCSV(exportData, filename);
    else if (formatType === 'excel') exportToExcel(exportData, filename);
    else {
      const headers = ['Reg No', 'Make/Model', 'Type', 'Ownership', 'Payload', 'Status', 'Driver'];
      const pdfData = exportData.map(v => [v['Reg No'], v['Make/Model'], v.Type, v.Ownership, v['Payload (Kg)'], v.Status, v.Driver]);
      exportToPDF(headers, pdfData, filename, 'Fleet Vehicle Registry');
    }
  };

  const columns = [
    { 
      header: 'Vehicle Info', 
      accessor: (row: Vehicle) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg shadow-sm">
            {row.type === 'Trailer' ? '🚛' : '🚚'}
          </div>
          <div>
            <p className="font-black text-slate-900 uppercase tracking-tighter text-lg leading-none">{row.regNo}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{row.make} {row.model} • {row.yom || 'N/A'}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Specs / Capacity', 
      accessor: (row: Vehicle) => (
        <div>
          <p className="font-bold text-slate-700 text-xs">
            Payload: <span className="text-blue-600 font-black">{((row.payloadKg || 0) / 1000).toFixed(1)} MT</span>
          </p>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-0.5">
            {row.fuelType} • {row.ownership}
          </p>
        </div>
      )
    },
    { 
      header: 'Compliance Status', 
      accessor: (row: any) => {
        const docs = row.vehicleDocuments || [];
        const expiringCount = docs.filter((d: any) => {
          const exp = parseISO(d.expiryDate);
          return isWithinInterval(exp, { start: new Date(), end: addDays(new Date(), 30) });
        }).length;
        const expiredCount = docs.filter((d: any) => isPast(parseISO(d.expiryDate))).length;

        if (expiredCount > 0) return <span className="bg-red-50 text-red-600 px-2 py-1 rounded-lg text-[9px] font-black uppercase border border-red-100">Expired Docs ({expiredCount})</span>;
        if (expiringCount > 0) return <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded-lg text-[9px] font-black uppercase border border-amber-100">Renew Soon ({expiringCount})</span>;
        return <span className="bg-green-50 text-green-600 px-2 py-1 rounded-lg text-[9px] font-black uppercase border border-green-100">All Compliant</span>;
      }
    },
    { 
      header: 'Assigned Driver', 
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          {row.assignedDriver ? (
            <>
              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px]">👨‍✈️</div>
              <span className="text-xs font-bold text-slate-700">{row.assignedDriver.name}</span>
            </>
          ) : (
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Unassigned</span>
          )}
        </div>
      )
    },
    { 
      header: 'Status', 
      accessor: (row: Vehicle) => {
        const styles = {
          active: 'bg-green-50 text-green-600 border-green-100',
          maintenance: 'bg-amber-50 text-amber-600 border-amber-100',
          inactive: 'bg-slate-100 text-slate-500 border-slate-200',
        };
        return <span className={`inline-flex px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${styles[row.status as keyof typeof styles] || styles.inactive}`}>{row.status}</span>;
      }
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (row: Vehicle) => (
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={() => { setHistoryItem(row); setIsHistoryModalOpen(true); }}
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-blue-600 hover:text-white transition-all text-sm shadow-sm border border-slate-100"
            title="View Assignment History"
          >
            👁️
          </button>
          <button 
            onClick={() => { setEditingItem(row); setIsModalOpen(true); }}
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-blue-500 hover:text-white transition-all text-sm shadow-sm border border-slate-100"
            title="Edit Asset"
          >
            ✏️
          </button>
          <button 
            onClick={() => handleDelete(row)}
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-red-500 hover:text-white transition-all text-sm shadow-sm border border-slate-100"
            title="Delete Asset"
          >
            🗑️
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 p-2">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">Fleet Registry</h1>
          <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest text-[10px] flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Strategic Asset Management & Compliance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl mr-2">
            <Button variant="ghost" size="sm" onClick={() => handleExport('csv')} className="h-8 rounded-lg text-[9px] font-black uppercase hover:bg-white transition-all">CSV</Button>
            <Button variant="ghost" size="sm" onClick={() => handleExport('excel')} className="h-8 rounded-lg text-[9px] font-black uppercase hover:bg-white transition-all">Excel</Button>
            <Button variant="ghost" size="sm" onClick={() => handleExport('pdf')} className="h-8 rounded-lg text-[9px] font-black uppercase hover:bg-white hover:text-red-600 transition-all">PDF</Button>
          </div>
          <Button 
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }} 
            className="rounded-2xl h-14 px-8 bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-100 font-black uppercase tracking-widest text-[11px] flex items-center gap-3"
          >
            <span className="text-xl">+</span> Register Vehicle
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Fleet', value: total, icon: '🚛', color: 'text-slate-900', bg: 'bg-slate-50' },
          { label: 'Own Vehicles', value: data.filter(v => v.ownership === 'Own').length, icon: '🏠', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Maintenance', value: data.filter(v => v.status === 'maintenance').length, icon: '⚙️', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Idle / Yard', value: data.filter(v => v.status === 'inactive').length, icon: '🅿️', color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <span className={`h-10 w-10 ${stat.bg} rounded-xl flex items-center justify-center text-xl shadow-inner`}>{stat.icon}</span>
              <span className="text-[10px] font-black text-slate-300 group-hover:text-slate-400 uppercase tracking-tighter transition-colors">Real-time</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
            {loading ? (
              <div className="h-8 w-16 bg-slate-50 rounded-lg animate-pulse mt-1" />
            ) : (
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Search & Table */}
      <div className="space-y-6">
        <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex items-center">
          <Input 
            placeholder="Search by Registration Number, Make, Model or Owner..." 
            icon="🔍" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="bg-transparent border-none focus:ring-0 h-12 text-sm font-bold placeholder:text-slate-300" 
          />
        </div>

        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <DataTable 
            columns={columns as any} 
            data={data} 
            loading={loading} 
            pagination={{ 
              page, 
              total, 
              limit, 
              onPageChange: setPage,
              onLimitChange: setLimit
            }} 
          />
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingItem ? 'Edit Fleet Asset' : 'Fleet Registration'} 
        size="lg"
      >
        <VehicleForm 
          initialData={editingItem || undefined} 
          onSuccess={() => { setIsModalOpen(false); fetchData(); }} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>

      {/* Premium Vehicle Timeline Slide-over */}
      {isHistoryModalOpen && historyItem && (
        <div className="fixed inset-0 z-[70] flex justify-end animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsHistoryModalOpen(false)} />
          <div className="relative w-full max-w-4xl bg-white shadow-2xl h-full animate-in slide-in-from-right duration-500">
            <VehicleHistory vehicle={historyItem} onClose={() => setIsHistoryModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
