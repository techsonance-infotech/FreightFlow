'use client';

import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { DealerForm } from '@/components/masters/dealer-form';
import { type Dealer } from '@freightflow/shared';
import { toast } from 'sonner';
import { exportToCSV, exportToExcel, exportToPDF } from '@/lib/export-utils';
import { Handshake, Landmark, Truck, FileText, Pencil, Trash2, ArrowDownToLine, Plus } from 'lucide-react';
import * as XLSX from 'xlsx';

import { useSearchParams } from 'next/navigation';

export default function DealersPage() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('id');
  
  const [data, setData] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Dealer | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/masters/dealers?page=${page}&limit=${limit}&search=${search}`);
      const result = await response.json();
      if (response.ok) { 
        setData(result.data); 
        setTotal(result.meta.total); 
        
        // Handle deep linking from search
        if (highlightId && result.data.length > 0) {
          const target = result.data.find((d: any) => d.id === highlightId);
          if (target) {
            setEditingItem(target);
            setIsModalOpen(true);
          }
        }
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
  }, [page, limit, search, highlightId]);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const toastId = toast.loading('Reading vendor file...');
    
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws);

        toast.loading('Bulk uploading vendors...', { id: toastId });
        
        const response = await fetch('/api/v1/masters/dealers/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: rawData }),
        });

        const result = await response.json();
        if (response.ok) {
          toast.success(`Successfully imported ${result.count} dealers`, { id: toastId });
          fetchData();
        } else {
          toast.error(result.error || 'Import failed', { id: toastId });
        }
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      toast.error('Error reading file', { id: toastId });
    } finally {
      setImporting(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleDelete = async (item: Dealer) => {
    if (!confirm(`Are you sure you want to delete ${item.name}?`)) return;
    try {
      const res = await fetch(`/api/v1/masters/dealers/${item.id}`, { method: 'DELETE' });
      if (res.ok) { 
        toast.success('Dealer deleted successfully'); 
        fetchData(); 
      }
    } catch { 
      toast.error('Error deleting record'); 
    }
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    const exportData = data.map(d => ({
      Name: d.name,
      Person: d.personName || 'N/A',
      Phone: d.phone || 'N/A',
      GSTIN: d.gstin || 'N/A',
      Bank: d.bankName || 'N/A',
      Account: d.accountNo || 'N/A',
      TDS: `${d.tdsRate}%`,
      Fleet: d.fleetSize
    }));

    const filename = `Dealers_Master_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') exportToCSV(exportData, filename);
    else if (format === 'excel') exportToExcel(exportData, filename);
    else {
      const headers = ['Name', 'Phone', 'GSTIN', 'Bank', 'Fleet'];
      const pdfData = exportData.map(d => [d.Name, d.Phone, d.GSTIN, d.Bank, d.Fleet]);
      exportToPDF(headers, pdfData, filename, 'Dealer/Vendor Master List');
    }
  };

  const columns = [
    { 
      header: 'Vendor Identity', 
      accessor: (row: Dealer) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-lg shadow-sm border border-indigo-100">
            <Handshake className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="font-black text-slate-900 leading-tight">{row.name}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{row.personName || 'No Contact'}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Short Name', 
      accessor: (row: Dealer) => <span className="font-mono text-xs">{row.shortName || '-'}</span>
    },
    { 
      header: 'Address Details', 
      accessor: (row: Dealer) => (
        <div className="max-w-[200px]">
          <p className="text-[10px] text-slate-600 line-clamp-1">{row.address || '-'}</p>
          <div className="flex gap-2 text-[9px] font-bold text-slate-400 uppercase mt-0.5">
            <span>Pin: {row.pincode || '-'}</span>
            <span>Area: {row.area || '-'}</span>
          </div>
        </div>
      )
    },
    { 
      header: 'Compliance & Tax', 
      accessor: (row: Dealer) => (
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-700">GST: <span className="font-mono">{row.gstin || 'N/A'}</span></p>
          <p className="text-[10px] font-black text-slate-700">PAN: <span className="font-mono">{row.pan || 'N/A'}</span></p>
          {row.serviceTaxNo && <p className="text-[9px] font-bold text-blue-600 uppercase">ST No: {row.serviceTaxNo}</p>}
        </div>
      )
    },
    { 
      header: 'Dealer Type', 
      accessor: (row: Dealer) => (
        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-tighter border border-slate-200">
          {row.dealerType || 'Regular'}
        </span>
      )
    },
    { 
      header: 'Actions', 
      className: 'text-right',
      accessor: (row: Dealer) => (
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={() => window.location.href = `/dashboard/accounting/ledger?dealerId=${row.id}`}
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all text-sm shadow-sm border border-indigo-100"
            title="View Ledger"
          >
            <FileText className="h-4 w-4" />
          </button>
          <button 
            onClick={() => { setEditingItem(row); setIsModalOpen(true); }}
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-blue-600 hover:text-white transition-all text-sm shadow-sm border border-slate-100"
            title="Edit Profile"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button 
            onClick={() => handleDelete(row)}
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-red-500 hover:text-white transition-all text-sm shadow-sm border border-slate-100"
            title="Delete Record"
          >
            <Trash2 className="h-4 w-4" />
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
            <Handshake className="h-8 w-8 text-indigo-600" />
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dealer Master</h1>
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest ml-12">Vendor Network, Fleet Partners & Payouts</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 mr-4">
            <input type="file" id="bulk-import" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleImport} />
            <Button 
              variant="outline" 
              size="sm" 
              disabled={importing}
              onClick={() => document.getElementById('bulk-import')?.click()}
              className="rounded-xl border-slate-200 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-600 hover:text-white font-bold text-[10px] uppercase gap-2"
            >
              <ArrowDownToLine className="h-4 w-4" /> Import
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('csv')} className="rounded-xl border-slate-200 text-slate-600 font-bold text-[10px] uppercase">CSV</Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('excel')} className="rounded-xl border-slate-200 text-slate-600 font-bold text-[10px] uppercase">Excel</Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} className="rounded-xl border-slate-200 text-red-600 bg-red-50/30 hover:bg-red-600 hover:text-white font-bold text-[10px] uppercase">PDF</Button>
          </div>
          <Button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="rounded-2xl h-14 px-8 bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-100 font-black uppercase tracking-widest text-[11px] flex items-center gap-3">
            <Plus className="h-5 w-5" /> Register New Vendor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Vendors', value: total, icon: <Handshake className="h-6 w-6 text-indigo-600" />, color: 'bg-indigo-50', text: 'text-slate-900' },
          { label: 'Bank Verified', value: data.filter(d => !!d.bankProofUrl).length, icon: <Landmark className="h-6 w-6 text-green-600" />, color: 'bg-green-50', text: 'text-green-600' },
          { label: 'Fleet Strength', value: data.reduce((acc, curr) => acc + (curr.fleetSize || 0), 0), icon: <Truck className="h-6 w-6 text-orange-600" />, color: 'bg-orange-50', text: 'text-orange-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`h-12 w-12 rounded-2xl ${stat.color} flex items-center justify-center text-xl`}>{stat.icon}</div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
              {loading ? (
                <div className="h-8 w-16 bg-slate-100 animate-pulse rounded-lg mt-1" />
              ) : (
                <p className={`text-2xl font-black ${stat.text}`}>{stat.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <Input 
          placeholder="Search by vendor name, GSTIN, phone or routes..." 
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Vendor Profile' : 'Register New Vendor'} size="xl">
        <DealerForm initialData={editingItem || undefined} onSuccess={() => { setIsModalOpen(false); fetchData(); }} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
