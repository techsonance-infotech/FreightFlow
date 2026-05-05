'use client';

import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { ProductForm } from '@/components/masters/product-form';
import { ProductAnalytics } from '@/components/masters/product-analytics';
import { type Product } from '@freightflow/shared';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { exportToCSV, exportToExcel, exportToPDF } from '@/lib/export-utils';

export default function ProductsPage() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/masters/products?page=${page}&search=${search}&limit=${limit}`);
      const result = await response.json();
      if (response.ok) { 
        setData(result.data); 
        setTotal(result.meta.total); 
      }
    } catch { 
      toast.error('Failed to fetch products'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [page, search, limit]);

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    const exportData = data.map(p => ({
      Name: p.name,
      Category: (p as any).category?.name || 'N/A',
      Unit: (p as any).unit?.name || 'N/A',
      'HSN Code': p.hsnCode || 'N/A',
      'GST Rate': `${p.gstRate}%`,
      Status: p.isActive ? 'Active' : 'Inactive'
    }));

    const filename = `Product_Master_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') exportToCSV(exportData, filename);
    else if (format === 'excel') exportToExcel(exportData, filename);
    else {
      const headers = ['Name', 'Category', 'Unit', 'HSN Code', 'GST Rate'];
      const pdfData = exportData.map(p => [p.Name, p.Category, p.Unit, p['HSN Code'], p['GST Rate']]);
      exportToPDF(headers, pdfData, filename, 'Product Master List');
    }
  };

  const handleDelete = async (item: Product) => {
// ... keep columns and other logic
// I will replace the header UI separately to be safe.
    if (!confirm(`Are you sure you want to delete ${item.name}?`)) return;
    try {
      const res = await fetch(`/api/v1/masters/products/${item.id}`, { method: 'DELETE' });
      if (res.ok) { 
        toast.success('Product deleted'); 
        fetchData(); 
      }
    } catch { 
      toast.error('Failed to delete product'); 
    }
  };

  const columns = [
    { 
      header: 'Product', 
      accessor: (row: Product) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
            {row.imageUrl ? (
              <img src={row.imageUrl} alt={row.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg">📦</span>
            )}
          </div>
          <div>
            <p className="font-black text-slate-900 leading-none">{row.name}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {(row as any).category?.name || 'No Category'}
            </p>
          </div>
        </div>
      )
    },
    { 
      header: 'Specs', 
      accessor: (row: Product) => (
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-black uppercase tracking-wider">
            {(row as any).unit?.name || 'No Unit'}
          </span>
          {row.hsnCode && (
            <span className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-[10px] font-black uppercase tracking-wider border border-slate-100">
              HSN: {row.hsnCode}
            </span>
          )}
        </div>
      )
    },
    { 
      header: 'Tax', 
      accessor: (row: Product) => (
        <span className="font-mono text-[11px] font-black text-slate-600 bg-slate-50 px-2 py-1 rounded-lg">
          {row.gstRate}% GST
        </span>
      )
    },
    { 
      header: 'Status', 
      accessor: (row: Product) => (
        <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${row.isActive ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
  ];

  const stats = [
    { label: 'Total Products', value: total, icon: '📦', color: 'bg-blue-500' },
    { label: 'Active', value: data.filter(p => p.isActive).length, icon: '✅', color: 'bg-green-500' },
    { label: 'Tax Rates', value: new Set(data.map(p => p.gstRate)).size, icon: '💰', color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">📦</span>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Product Master</h1>
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest ml-12">Goods Registry, HSN Codes & Tax Segments</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 mr-4">
            <Button variant="outline" size="sm" onClick={() => handleExport('csv')} className="rounded-xl border-slate-200 text-slate-600 font-bold text-[10px] uppercase">CSV</Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('excel')} className="rounded-xl border-slate-200 text-slate-600 font-bold text-[10px] uppercase">Excel</Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} className="rounded-xl border-slate-200 text-red-600 bg-red-50/30 hover:bg-red-600 hover:text-white font-bold text-[10px] uppercase">PDF</Button>
          </div>
          <Button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="rounded-2xl h-14 px-8 bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-100 font-black uppercase tracking-widest text-[11px] flex items-center gap-3">
            <span className="text-xl">+</span> Add Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Products', value: total, icon: '📦', color: 'bg-blue-500' },
          { label: 'Active', value: data.filter(p => p.isActive).length, icon: '✅', color: 'bg-green-500' },
          { label: 'Tax Rates', value: new Set(data.map(p => p.gstRate)).size, icon: '💰', color: 'bg-orange-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl ${stat.color} bg-opacity-10 flex items-center justify-center text-xl`}>
              {stat.icon}
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
              {loading ? (
                <div className="h-8 w-16 bg-slate-100 animate-pulse rounded-lg mt-1" />
              ) : (
                <p className="text-2xl font-black text-slate-900 leading-none">{stat.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="registry" className="w-full space-y-6">
        <TabsList className="bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50">
          <TabsTrigger value="registry" className="rounded-xl px-8 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-black uppercase text-[10px] tracking-widest">Registry</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-xl px-8 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 font-black uppercase text-[10px] tracking-widest">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="registry" className="space-y-6 outline-none">
          <div className="group bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 transition-all duration-300 focus-within:border-blue-500 focus-within:ring-8 focus-within:ring-blue-500/5">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl transition-colors group-focus-within:bg-blue-50 group-focus-within:text-blue-500 shrink-0">🔍</div>
            <input 
              placeholder="Search by name, HSN code or category..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="flex-1 bg-transparent border-none focus:ring-0 text-lg font-bold text-slate-900 placeholder:text-slate-300 outline-none w-full py-2" 
            />
          </div>

          <DataTable 
            columns={columns as any} 
            data={data} 
            loading={loading} 
            onEdit={(row) => { setEditingItem(row); setIsModalOpen(true); }} 
            onDelete={handleDelete} 
            pagination={{ 
              page, 
              total, 
              limit, 
              onPageChange: setPage,
              onLimitChange: setLimit
            }} 
          />
        </TabsContent>

        <TabsContent value="analytics" className="outline-none">
          <ProductAnalytics data={data} />
        </TabsContent>
      </Tabs>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingItem ? 'Edit Product' : 'Add New Product'} 
        size="lg"
      >
        <ProductForm 
          initialData={editingItem || undefined} 
          onSuccess={() => { setIsModalOpen(false); fetchData(); }} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>
    </div>
  );
}
