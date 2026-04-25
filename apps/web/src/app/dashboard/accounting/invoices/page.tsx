'use client';

import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function InvoicesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/accounting/invoices?page=${page}`);
      const result = await response.json();
      if (response.ok) {
        setData(result.data);
        setTotal(result.meta.total);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [page]);

  const columns = [
    { 
      header: 'Date', 
      accessor: (row: any) => new Date(row.date).toLocaleDateString('en-IN')
    },
    { 
      header: 'Invoice No', 
      accessor: (row: any) => (
        <div>
          <p className="font-bold text-slate-700">{row.invoiceNo}</p>
        </div>
      )
    },
    { 
      header: 'Linked Orders', 
      accessor: (row: any) => (
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-full">
          {row.orders?.length || 0} Orders
        </span>
      )
    },
    { 
      header: 'Total Amount', 
      accessor: (row: any) => (
        <span className="font-black text-slate-900">
          ₹{(row.totalAmount / 100).toFixed(2)}
        </span>
      )
    },
    { 
      header: 'Status', 
      accessor: (row: any) => (
        <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
          row.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 
          row.status === 'sent' ? 'bg-blue-50 text-blue-600' :
          'bg-slate-100 text-slate-500'
        }`}>
          {row.status}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Freight Invoices</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage billing and accounts receivable</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => { toast.info('Invoice Generation is handled via the Trips/Orders module in this phase.') }} icon="➕">
            Generate Invoice
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <DataTable
          columns={columns as any}
          data={data}
          loading={loading}
          pagination={{
            page,
            total,
            limit: 50,
            onPageChange: setPage
          }}
        />
      </div>
    </div>
  );
}
