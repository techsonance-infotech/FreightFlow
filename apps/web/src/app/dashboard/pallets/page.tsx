'use client';

import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { OrderPalletForm } from '@/components/orders/OrderPalletForm';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function PalletListPage() {
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
      const response = await fetch(`/api/v1/pallets?page=${page}&limit=${limit}&search=${search}`);
      const result = await response.json();
      if (response.ok) { 
        setData(result.data); 
        setTotal(result.meta.total); 
      }
    } catch { 
      toast.error('Failed to fetch pallet records'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [page, limit, search]);

  const columns = [
    { 
      header: 'Order Info', 
      accessor: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-neutral-100 flex items-center justify-center text-lg shadow-sm border border-neutral-200/50">
            📥
          </div>
          <div>
            <p className="font-black text-slate-900 leading-tight uppercase tracking-tighter">#{row.lrNo}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{format(new Date(row.date), 'dd MMM yyyy')}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Party Details', 
      accessor: (row: any) => (
        <div>
          <p className="text-[11px] font-black text-slate-700 uppercase">{row.companyName}</p>
          <p className="text-[10px] text-slate-400">Code: {row.partyCode || 'N/A'}</p>
        </div>
      )
    },
    { 
      header: 'Logistics', 
      accessor: (row: any) => (
        <div>
          <p className="text-[10px] font-black text-slate-700">Vehicle: {row.vehicle?.plateNumber || row.vehicle?.regNo || 'N/A'}</p>
          <p className="text-[10px] text-slate-400">Pallets: {row.palletDetails?.reduce((acc: number, d: any) => acc + d.qty, 0) || 0}</p>
        </div>
      )
    },
    { 
      header: 'Actions', 
      className: 'text-right',
      accessor: (row: any) => (
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={() => window.open(`/api/v1/pallets/${row.id}/print`, '_blank')}
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-black hover:text-white transition-all text-sm shadow-sm border border-slate-100"
            title="Print"
          >
            🖨️
          </button>
          <button 
            onClick={() => { setEditingItem(row); setIsModalOpen(true); }}
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-blue-600 hover:text-white transition-all text-sm shadow-sm border border-slate-100"
            title="Edit"
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
            <span className="text-3xl">📥</span>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Pallet Tracking</h1>
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest ml-12">Inventory & Distribution Control</p>
        </div>
        
        <Button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="rounded-2xl h-14 px-8 bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/10 font-black uppercase tracking-widest text-[11px] flex items-center gap-3">
          <span className="text-xl">+</span> New Pallet Record
        </Button>
      </div>

      <div className="space-y-6">
        <Input 
          placeholder="Search by LR No, Company or Party Code..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="max-w-md bg-white border-none h-14 rounded-2xl shadow-sm px-6"
        />

        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <DataTable 
            columns={columns as any} 
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Pallet Record' : 'Create Pallet Record'} size="xl">
        <OrderPalletForm initialData={editingItem || undefined} onSuccess={() => { setIsModalOpen(false); fetchData(); }} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
