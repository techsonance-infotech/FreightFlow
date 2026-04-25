'use client';

import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { DealerForm } from '@/components/masters/dealer-form';
import { type Dealer } from '@freightflow/shared';
import { toast } from 'sonner';

export default function DealersPage() {
  const [data, setData] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null);

  const fetchDealers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/masters/dealers?page=${page}&search=${search}`);
      const result = await response.json();
      if (response.ok) {
        setData(result.data);
        setTotal(result.meta.total);
      }
    } catch (error) {
      toast.error('Failed to fetch dealers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchDealers, 300);
    return () => clearTimeout(timer);
  }, [page, search]);

  const handleDelete = async (dealer: Dealer) => {
    if (!confirm(`Are you sure you want to delete ${dealer.name}?`)) return;

    try {
      const response = await fetch(`/api/v1/masters/dealers/${dealer.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        toast.success('Dealer deleted successfully');
        fetchDealers();
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      toast.error('Error deleting dealer');
    }
  };

  const columns = [
    { 
      header: 'Dealer Name', 
      accessor: (row: Dealer) => (
        <div>
          <p className="font-black text-slate-900">{row.name}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{row.shortName || 'No Alias'}</p>
        </div>
      )
    },
    { 
      header: 'Contact Person', 
      accessor: (row: Dealer) => (
        <div>
          <p className="font-bold text-slate-700">{row.personName}</p>
          <p className="text-[10px] font-medium text-slate-400">{row.phone || row.email || 'No Contact'}</p>
        </div>
      )
    },
    { 
      header: 'GSTIN / PAN', 
      accessor: (row: Dealer) => (
        <div className="space-y-1">
          {row.gstin && <p className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block uppercase">{row.gstin}</p>}
          <p className="text-[10px] font-bold text-slate-400 block uppercase">{row.pan || 'PAN NOT PROVIDED'}</p>
        </div>
      )
    },
    { header: 'Area', accessor: 'area' },
    { 
      header: 'Status', 
      accessor: (row: Dealer) => (
        <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${row.isActive ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Dealer Master</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage your customer and dealer relationships</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => {/* TODO: Export */}} icon="📥">
            Export
          </Button>
          <Button onClick={() => { setEditingDealer(null); setIsModalOpen(true); }} icon="➕">
            Add New Dealer
          </Button>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-full sm:w-96">
            <Input 
              placeholder="Search by name, GSTIN, or phone..." 
              icon="🔍"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border-none focus:ring-0"
            />
          </div>
          <div className="flex items-center gap-4">
            <select className="bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-500 px-4 py-2 uppercase tracking-widest focus:ring-2 focus:ring-blue-500/20 outline-none">
              <option>All Types</option>
              <option>Regular</option>
              <option>Contract</option>
            </select>
          </div>
        </div>

        <DataTable
          columns={columns as any}
          data={data}
          loading={loading}
          onEdit={(row) => { setEditingDealer(row); setIsModalOpen(true); }}
          onDelete={handleDelete}
          pagination={{
            page,
            total,
            limit: 10,
            onPageChange: setPage
          }}
        />
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDealer ? 'Edit Dealer Profile' : 'Register New Dealer'}
        size="lg"
      >
        <DealerForm
          initialData={editingDealer || undefined}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchDealers();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
