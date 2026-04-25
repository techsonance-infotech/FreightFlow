'use client';

import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { ConsigneeForm } from '@/components/masters/consignee-form';
import { type Consignee } from '@freightflow/shared';
import { toast } from 'sonner';

export default function ConsigneesPage() {
  const [data, setData] = useState<Consignee[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Consignee | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/masters/consignees?page=${page}&search=${search}`);
      const result = await response.json();
      if (response.ok) { setData(result.data); setTotal(result.meta.total); }
    } catch { toast.error('Failed to fetch data'); } finally { setLoading(false); }
  };

  useEffect(() => {
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [page, search]);

  const handleDelete = async (item: Consignee) => {
    if (!confirm(`Delete consignee ${item.name}?`)) return;
    try {
      const res = await fetch(`/api/v1/masters/consignees/${item.id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Deleted'); fetchData(); }
    } catch { toast.error('Error'); }
  };

  const columns = [
    { 
      header: 'Consignee / Company', 
      accessor: (row: Consignee) => (
        <div>
          <p className="font-black text-slate-900">{row.name}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.companyName || 'Individual'}</p>
        </div>
      )
    },
    { 
      header: 'Contact Info', 
      accessor: (row: Consignee) => (
        <div className="text-xs font-bold text-slate-600">
          <p>{row.phone || 'No Phone'}</p>
          <p className="text-slate-400 font-medium">{row.email || 'No Email'}</p>
        </div>
      )
    },
    { 
      header: 'Tax Info', 
      accessor: (row: Consignee) => (
        <div className="space-y-1">
          {row.gstin && <p className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block uppercase">{row.gstin}</p>}
          {row.pan && <p className="text-[10px] font-bold text-slate-400 block uppercase">PAN: {row.pan}</p>}
        </div>
      )
    },
    { 
      header: 'Status', 
      accessor: (row: Consignee) => (
        <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${row.isActive ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Consignee Master</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage receiving entities and shipping destinations</p>
        </div>
        <Button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} icon="➕">Add Consignee</Button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <Input placeholder="Search by name, company, or GSTIN..." icon="🔍" value={search} onChange={(e) => setSearch(e.target.value)} className="bg-white border-none focus:ring-0" />
      </div>

      <DataTable columns={columns as any} data={data} loading={loading} onEdit={(row) => { setEditingItem(row); setIsModalOpen(true); }} onDelete={handleDelete} pagination={{ page, total, limit: 10, onPageChange: setPage }} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Consignee' : 'Add New Consignee'} size="lg">
        <ConsigneeForm initialData={editingItem || undefined} onSuccess={() => { setIsModalOpen(false); fetchData(); }} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
