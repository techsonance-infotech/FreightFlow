'use client';

import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { ProductForm } from '@/components/masters/product-form';
import { type Product } from '@freightflow/shared';
import { toast } from 'sonner';

export default function ProductsPage() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/masters/products?page=${page}&search=${search}`);
      const result = await response.json();
      if (response.ok) { setData(result.data); setTotal(result.meta.total); }
    } catch { toast.error('Failed to fetch data'); } finally { setLoading(false); }
  };

  useEffect(() => {
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [page, search]);

  const handleDelete = async (item: Product) => {
    if (!confirm(`Delete product ${item.name}?`)) return;
    try {
      const res = await fetch(`/api/v1/masters/products/${item.id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Deleted'); fetchData(); }
    } catch { toast.error('Error'); }
  };

  const columns = [
    { 
      header: 'Product Name', 
      accessor: (row: Product) => (
        <div>
          <p className="font-black text-slate-900">{row.name}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.defaultPacking || 'General Packing'}</p>
        </div>
      )
    },
    { header: 'HSN Code', accessor: 'hsnCode', className: 'font-mono text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block' },
    { 
      header: 'Status', 
      accessor: (row: Product) => (
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
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Product Master</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage transportable goods and HSN codes</p>
        </div>
        <Button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} icon="➕">Add Product</Button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <Input placeholder="Search by name or HSN code..." icon="🔍" value={search} onChange={(e) => setSearch(e.target.value)} className="bg-white border-none focus:ring-0" />
      </div>

      <DataTable columns={columns as any} data={data} loading={loading} onEdit={(row) => { setEditingItem(row); setIsModalOpen(true); }} onDelete={handleDelete} pagination={{ page, total, limit: 10, onPageChange: setPage }} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Product' : 'Add New Product'} size="lg">
        <ProductForm initialData={editingItem || undefined} onSuccess={() => { setIsModalOpen(false); fetchData(); }} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
