'use client';

import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { VoucherForm } from '@/components/accounting/voucher-form';
import { toast } from 'sonner';

export default function VouchersPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accountOptions, setAccountOptions] = useState<{id: string, name: string, code: string}[]>([]);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/accounting/vouchers?page=${page}`);
      const result = await response.json();
      if (response.ok) {
        setData(result.data);
        setTotal(result.meta.total);
      }
    } catch (error) {
      toast.error('Failed to fetch vouchers');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/v1/accounting/coa');
      const result = await response.json();
      if (response.ok) {
        const flatten = (nodes: any[], res: any[] = []) => {
          nodes.forEach(node => {
            // Only add accounts that can be transacted upon (usually leaf nodes, but we'll include all for now)
            res.push({ id: node.id, name: node.name, code: node.code });
            if (node.children) flatten(node.children, res);
          });
          return res;
        };
        setAccountOptions(flatten(result.data));
      }
    } catch (error) {
      console.error('Error fetching accounts for options', error);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [page]);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const columns = [
    { 
      header: 'Date', 
      accessor: (row: any) => new Date(row.date).toLocaleDateString('en-IN')
    },
    { 
      header: 'Voucher No', 
      accessor: (row: any) => (
        <div>
          <p className="font-bold text-slate-700">{row.voucherNo}</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{row.voucherType}</p>
        </div>
      )
    },
    { 
      header: 'Narration', 
      accessor: (row: any) => <span className="text-sm text-slate-500 truncate max-w-[200px] block">{row.narration || '-'}</span>
    },
    { 
      header: 'Amount', 
      accessor: (row: any) => (
        <span className="font-black text-slate-900">
          ₹{(row.totalAmount / 100).toFixed(2)}
        </span>
      )
    },
    {
      header: 'Details',
      accessor: (row: any) => (
        <div className="space-y-1">
          {row.lines.slice(0, 2).map((l: any, i: number) => (
            <div key={i} className="flex justify-between text-[10px]">
              <span className="text-slate-500">{l.account?.name}</span>
              <span className={`font-bold ${l.debit > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {l.debit > 0 ? `DR ${(l.debit/100).toFixed(2)}` : `CR ${(l.credit/100).toFixed(2)}`}
              </span>
            </div>
          ))}
          {row.lines.length > 2 && <span className="text-[10px] text-blue-500 font-bold">+ {row.lines.length - 2} more lines</span>}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Journal Entries</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage vouchers and manual GL entries</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsModalOpen(true)} icon="➕">
            New Voucher
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

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Post New Voucher"
        size="3xl"
      >
        <VoucherForm
          accountOptions={accountOptions}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchVouchers();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
