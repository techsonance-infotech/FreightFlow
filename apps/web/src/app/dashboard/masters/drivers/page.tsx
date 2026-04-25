'use client';

import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { DriverForm } from '@/components/masters/driver-form';
import { type Driver } from '@freightflow/shared';
import { toast } from 'sonner';
import { format, isPast, isWithinInterval, addDays } from 'date-fns';

export default function DriversPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Driver | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/masters/drivers?page=${page}&search=${search}`);
      const result = await response.json();
      if (response.ok) { setData(result.data); setTotal(result.meta.total); }
    } catch { toast.error('Failed to fetch data'); } finally { setLoading(false); }
  };

  useEffect(() => {
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [page, search]);

  const handleDelete = async (item: Driver) => {
    if (!confirm(`Remove driver license for ${item.id}?`)) return;
    try {
      const res = await fetch(`/api/v1/masters/drivers/${item.id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Deleted'); fetchData(); }
    } catch { toast.error('Error'); }
  };

  const columns = [
    { 
      header: 'Driver Name', 
      accessor: (row: any) => (
        <div>
          <p className="font-black text-slate-900">{row.employee?.name}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.employee?.empCode}</p>
        </div>
      )
    },
    { 
      header: 'License Details', 
      accessor: (row: any) => (
        <div>
          <p className="font-mono text-sm font-black text-slate-700">{row.dlNumber}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.dlCategory || 'No Category'}</p>
        </div>
      )
    },
    { 
      header: 'DL Expiry', 
      accessor: (row: any) => {
        const expiryDate = new Date(row.dlExpiry);
        const isExpired = isPast(expiryDate);
        const isExpiringSoon = isWithinInterval(expiryDate, { start: new Date(), end: addDays(new Date(), 30) });
        
        let statusClass = 'text-green-600 bg-green-50';
        if (isExpired) statusClass = 'text-red-600 bg-red-50 animate-pulse';
        else if (isExpiringSoon) statusClass = 'text-amber-600 bg-amber-50';

        return (
          <div className={`inline-flex px-3 py-1 rounded-lg text-xs font-black uppercase tracking-tight ${statusClass}`}>
            {format(expiryDate, 'dd MMM yyyy')}
          </div>
        );
      }
    },
    { 
      header: 'Type', 
      accessor: (row: any) => (
        <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${row.isVendorDriver ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
          {row.isVendorDriver ? 'Vendor' : 'Staff'}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Driver Master</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage driver licenses and validity alerts</p>
        </div>
        <Button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} icon="➕">Register Driver</Button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <Input placeholder="Search by name or DL number..." icon="🔍" value={search} onChange={(e) => setSearch(e.target.value)} className="bg-white border-none focus:ring-0" />
      </div>

      <DataTable columns={columns as any} data={data} loading={loading} onEdit={(row) => { setEditingItem(row); setIsModalOpen(true); }} onDelete={handleDelete} pagination={{ page, total, limit: 10, onPageChange: setPage }} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Driver Details' : 'Register New Driver'} size="lg">
        <DriverForm initialData={editingItem || undefined} onSuccess={() => { setIsModalOpen(false); fetchData(); }} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
