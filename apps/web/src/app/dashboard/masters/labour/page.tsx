'use client';

import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { LabourForm } from '@/components/masters/labour-form';
import { type Labour } from '@freightflow/shared';
import { toast } from 'sonner';

export default function LabourPage() {
  const [data, setData] = useState<Labour[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Labour | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/masters/labour?page=${page}&search=${search}`);
      const result = await response.json();
      if (response.ok) { setData(result.data); setTotal(result.meta.total); }
    } catch { toast.error('Failed to fetch data'); } finally { setLoading(false); }
  };

  useEffect(() => {
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [page, search]);

  const handleDelete = async (item: Labour) => {
    if (!confirm(`Delete record for ${item.name}?`)) return;
    try {
      const res = await fetch(`/api/v1/masters/labour/${item.id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Deleted'); fetchData(); }
    } catch { toast.error('Error'); }
  };

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Labour | null>(null);

  const columns = [
    { 
      header: 'Worker Name', 
      accessor: (row: Labour) => (
        <div>
          <p className="font-black text-slate-900">{row.name}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.phone || 'No Phone'}</p>
        </div>
      )
    },
    { header: 'Address', accessor: 'address', className: 'max-w-xs truncate' },
    { 
      header: 'Monthly Salary', 
      accessor: (row: Labour) => (
        <div className="flex items-center gap-3">
          <div className="font-black text-blue-600">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(row.salary / 100)}
          </div>
          <button 
            onClick={() => { setSelectedWorker(row); setIsDrawerOpen(true); }}
            className="h-7 w-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white transition-all text-xs"
            title="View Payment History"
          >
            ₹
          </button>
        </div>
      )
    },
    { 
      header: 'Status', 
      accessor: (row: Labour) => (
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
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Labour Master</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage transport workers, loaders, and staff</p>
        </div>
        <Button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} icon="➕">Register Worker</Button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <Input placeholder="Search by name or phone..." icon="🔍" value={search} onChange={(e) => setSearch(e.target.value)} className="bg-white border-none focus:ring-0" />
      </div>

      <DataTable columns={columns as any} data={data} loading={loading} onEdit={(row) => { setEditingItem(row); setIsModalOpen(true); }} onDelete={handleDelete} pagination={{ page, total, limit: 10, onPageChange: setPage }} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Worker Profile' : 'Register New Worker'} size="lg">
        <LabourForm initialData={editingItem || undefined} onSuccess={() => { setIsModalOpen(false); fetchData(); }} onCancel={() => setIsModalOpen(false)} />
      </Modal>

      {/* Payment History Side Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative w-full max-w-md bg-white shadow-2xl h-full animate-in slide-in-from-right duration-500 flex flex-col">
            <div className="p-8 border-b border-slate-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Payment History</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{selectedWorker?.name}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsDrawerOpen(false)}>✕</Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                <p className="text-4xl mb-4">📜</p>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Payment History Yet</p>
                <p className="text-[10px] text-slate-300 mt-2 italic px-8">Payments recorded in the Accounting module will appear here.</p>
              </div>
            </div>
            <div className="p-8 border-t border-slate-50 bg-slate-50/50">
              <Button className="w-full" onClick={() => setIsDrawerOpen(false)}>Close Ledger</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
