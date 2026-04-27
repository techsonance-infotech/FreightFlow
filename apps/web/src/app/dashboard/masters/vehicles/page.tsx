'use client';

import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { VehicleForm } from '@/components/masters/vehicle-form';
import { type Vehicle } from '@freightflow/shared';
import { toast } from 'sonner';

export default function VehiclesPage() {
  const [data, setData] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Vehicle | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/masters/vehicles?page=${page}&search=${search}`);
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
  }, [page, search]);

  const handleDelete = async (item: Vehicle) => {
    if (!confirm(`Delete vehicle ${item.regNo}?`)) return;
    try {
      const res = await fetch(`/api/v1/masters/vehicles/${item.id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Deleted'); fetchData(); }
    } catch { toast.error('Error deleting'); }
  };

  const columns = [
    { 
      header: 'Vehicle Info', 
      accessor: (row: Vehicle) => (
        <div>
          <p className="font-black text-slate-900 uppercase tracking-tighter text-lg">{row.regNo}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.make} {row.model}</p>
        </div>
      )
    },
    { 
      header: 'Type / Ownership', 
      accessor: (row: Vehicle) => (
        <div>
          <p className="font-bold text-slate-700">{row.type}</p>
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{row.ownership}</p>
        </div>
      )
    },
    { 
      header: 'Odometer', 
      accessor: (row: Vehicle) => (
        <div className="font-mono font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg inline-block">
          {row.odometer?.toLocaleString()} km
        </div>
      )
    },
    { 
      header: 'Status', 
      accessor: (row: Vehicle) => {
        const styles = {
          active: 'bg-green-50 text-green-600',
          maintenance: 'bg-amber-50 text-amber-600',
          inactive: 'bg-slate-100 text-slate-500',
        };
        return <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${styles[row.status as keyof typeof styles]}`}>{row.status}</span>;
      }
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Vehicle Master</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage your fleet and transport assets</p>
        </div>
        <Button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} icon="➕">Register Vehicle</Button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <Input placeholder="Search by Reg No, Make, Model..." icon="🔍" value={search} onChange={(e) => setSearch(e.target.value)} className="bg-white border-none focus:ring-0" />
      </div>

      <DataTable columns={columns as any} data={data} loading={loading} onEdit={(row) => { setEditingItem(row); setIsModalOpen(true); }} onDelete={handleDelete} pagination={{ page, total, limit: 10, onPageChange: setPage }} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Vehicle Details' : 'Register New Vehicle'} size="lg">
        <VehicleForm initialData={editingItem || undefined} onSuccess={() => { setIsModalOpen(false); fetchData(); }} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
