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

import { LabourAnalytics } from '@/components/masters/labour-analytics';

export default function LabourPage() {
  const [activeMainTab, setActiveMainTab] = useState<'registry' | 'insights'>('registry');
  const [data, setData] = useState<Labour[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [selectedLabour, setSelectedLabour] = useState<Labour | null>(null);
  const [editingItem, setEditingItem] = useState<Labour | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/masters/labour?page=${page}&limit=${limit}&search=${search}`);
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
  }, [page, limit, search]);

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
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.phone || 'No Phone'}</p>
              <div className="flex items-center gap-1.5 ml-1">
                {row.aadharUrl && <span title="Aadhar Doc" className="text-blue-500 cursor-help">📎</span>}
                {row.panUrl && <span title="PAN Doc" className="text-blue-500 cursor-help">💳</span>}
              </div>
              {row.skillCategory && (
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-500 uppercase tracking-wider border border-blue-100">
                  {row.skillCategory}
                </span>
              )}
            </div>
          </div>
        </div>
      )
    },
    { header: 'Address', accessor: (row: Labour) => row.address, className: 'max-w-xs truncate text-slate-500 font-medium' },
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
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">👷</span>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Labour Registry</h1>
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest ml-12">Worker management, Payroll & Operational Insights</p>
        </div>
        
        {activeMainTab === 'registry' && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 mr-4">
              <Button variant="outline" size="sm" onClick={() => handleExport('csv')} className="rounded-xl border-slate-200 text-slate-600 font-bold text-[10px] uppercase">CSV</Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('excel')} className="rounded-xl border-slate-200 text-slate-600 font-bold text-[10px] uppercase">Excel</Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} className="rounded-xl border-slate-200 text-red-600 bg-red-50/30 hover:bg-red-600 hover:text-white font-bold text-[10px] uppercase">PDF</Button>
            </div>
            <Button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="rounded-2xl h-14 px-8 bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-100 font-black uppercase tracking-widest text-[11px] flex items-center gap-3">
              <span className="text-xl">+</span> Register New Worker
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveMainTab('registry')}
          className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeMainTab === 'registry' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          🗂️ Worker Registry
        </button>
        <button
          onClick={() => setActiveMainTab('insights')}
          className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeMainTab === 'insights' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          📊 Cost Insights
        </button>
      </div>

      {activeMainTab === 'registry' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Input 
              placeholder="Search by worker name, phone or skill..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="max-w-md bg-white border-none h-14 rounded-2xl shadow-sm px-6"
            />
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Force</p>
                {loading ? (
                  <div className="h-6 w-24 bg-slate-100 animate-pulse rounded-lg mt-1 ml-auto" />
                ) : (
                  <p className="text-xl font-black text-slate-900">{total} Workers</p>
                )}
              </div>
            </div>
          </div>

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
      ) : (
        <LabourAnalytics />
      )}

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
