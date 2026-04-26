'use client';

import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { LabourForm } from '@/components/masters/labour-form';
import { LabourExpenseModal } from '@/components/masters/labour-expense-modal';
import { LabourDetailView } from '@/components/masters/labour-detail-view';
import { type Labour } from '@freightflow/shared';
import { toast } from 'sonner';
import { exportToCSV, exportToExcel, exportToPDF } from '@/lib/export-utils';

export default function LabourPage() {
  const [data, setData] = useState<Labour[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [selectedLabour, setSelectedLabour] = useState<Labour | null>(null);
  const [editingItem, setEditingItem] = useState<Labour | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/masters/labour?page=${page}&search=${search}`);
      const result = await response.json();
      if (response.ok) { 
        setData(result.data); 
        setTotal(result.meta.total); 
      }
    } catch { 
      toast.error('Failed to fetch data'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [page, search]);

  const handleDelete = async (item: Labour) => {
    if (!confirm(`Are you sure you want to delete ${item.name}? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/v1/masters/labour/${item.id}`, { method: 'DELETE' });
      if (res.ok) { 
        toast.success('Labour record deleted'); 
        fetchData(); 
      }
    } catch { 
      toast.error('Error deleting record'); 
    }
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    const exportData = data.map(l => ({
      Name: l.name,
      Phone: l.phone || 'N/A',
      Salary: l.salary / 100,
      Address: l.address || 'N/A',
      Status: l.isActive ? 'Active' : 'Inactive'
    }));

    const filename = `Labour_Registry_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      exportToCSV(exportData, filename);
    } else if (format === 'excel') {
      exportToExcel(exportData, filename);
    } else {
      const headers = ['Name', 'Phone', 'Salary (₹)', 'Address', 'Status'];
      const pdfData = exportData.map(l => [l.Name, l.Phone, l.Salary.toLocaleString(), l.Address, l.Status]);
      exportToPDF(headers, pdfData, filename, 'Labour Registry Master List');
    }
  };

  const columns = [
    { 
      header: 'Worker Profile', 
      accessor: (row: Labour) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg shadow-sm border border-slate-200/50">
            👤
          </div>
          <div>
            <p className="font-black text-slate-900 leading-tight">{row.name}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{row.phone || 'No Phone'}</p>
          </div>
        </div>
      )
    },
    { header: 'Address', accessor: 'address', className: 'max-w-xs truncate text-slate-500 font-medium' },
    { 
      header: 'Monthly Salary', 
      accessor: (row: Labour) => (
        <div className="font-black text-blue-600 tabular-nums">
          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(row.salary / 100)}
        </div>
      )
    },
    { 
      header: 'Status', 
      accessor: (row: Labour) => (
        <span className={`inline-flex px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${row.isActive ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (row: Labour) => (
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={() => { setSelectedLabour(row); setIsDetailViewOpen(true); }}
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-blue-600 hover:text-white transition-all text-sm shadow-sm border border-slate-100"
            title="View Ledger"
          >
            👁️
          </button>
          <button 
            onClick={() => { setSelectedLabour(row); setIsExpenseModalOpen(true); }}
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-orange-500 hover:text-white transition-all text-sm shadow-sm border border-slate-100"
            title="Record Expense"
          >
            ₹
          </button>
          <button 
            onClick={() => { setEditingItem(row); setIsModalOpen(true); }}
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-blue-500 hover:text-white transition-all text-sm shadow-sm border border-slate-100"
            title="Edit Profile"
          >
            ✏️
          </button>
          <button 
            onClick={() => handleDelete(row)}
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-red-500 hover:text-white transition-all text-sm shadow-sm border border-slate-100"
            title="Delete Record"
          >
            🗑️
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Labour Registry</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage workforce attendance, ledger, and profile registry</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-100 shadow-sm mr-2">
            <Button variant="ghost" size="sm" onClick={() => handleExport('csv')} className="h-8 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600">CSV</Button>
            <Button variant="ghost" size="sm" onClick={() => handleExport('excel')} className="h-8 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600">Excel</Button>
            <Button variant="ghost" size="sm" onClick={() => handleExport('pdf')} className="h-8 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600">PDF</Button>
          </div>
          <Button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100">
            <span className="mr-2">➕</span> Register Labour
          </Button>
        </div>
      </div>

      <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="pl-4 text-slate-400">🔍</div>
        <input 
          placeholder="Search by worker name, phone or address..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="flex-1 bg-transparent border-none focus:ring-0 h-12 text-sm font-medium text-slate-600 outline-none" 
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
        <DataTable 
          columns={columns as any} 
          data={data} 
          loading={loading} 
          pagination={{ page, total, limit: 10, onPageChange: setPage }} 
        />
      </div>

      {/* Register / Edit Labour Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Labour Profile' : 'Register New Labour'} size="lg">
        <LabourForm initialData={editingItem || undefined} onSuccess={() => { setIsModalOpen(false); fetchData(); }} onCancel={() => setIsModalOpen(false)} />
      </Modal>

      {/* Add Expense Modal */}
      <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title="Record Labour Expense" size="md">
        {selectedLabour?.id && (
          <LabourExpenseModal 
            labourId={selectedLabour.id} 
            onSuccess={() => { setIsExpenseModalOpen(false); fetchData(); }} 
            onCancel={() => setIsExpenseModalOpen(false)} 
          />
        )}
      </Modal>

      {/* Detailed Eye View (Ledger) */}
      {isDetailViewOpen && selectedLabour && (
        <div className="fixed inset-0 z-[70] flex justify-end animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsDetailViewOpen(false)} />
          <div className="relative w-full max-w-4xl bg-white shadow-2xl h-full animate-in slide-in-from-right duration-500">
            <LabourDetailView labour={selectedLabour} onClose={() => setIsDetailViewOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
