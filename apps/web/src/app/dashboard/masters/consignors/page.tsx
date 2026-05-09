'use client';

import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { ConsignorForm } from '@/components/masters/consignor-form';
import { type Consignor } from '@freightflow/shared';
import { toast } from 'sonner';
import { exportToCSV, exportToExcel, exportToPDF } from '@/lib/export-utils';
import { Building2, ShieldCheck, CreditCard, Paperclip, FileText, Pencil, Trash2, ArrowDownToLine, Plus } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ConsignorsPage() {
  const [data, setData] = useState<Consignor[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Consignor | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/masters/consignors?page=${page}&limit=${limit}&search=${search}`);
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

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const toastId = toast.loading('Reading file...');
    
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws);

        toast.loading('Importing data...', { id: toastId });
        
        const response = await fetch('/api/v1/masters/consignors/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: rawData }),
        });

        const result = await response.json();
        if (response.ok) {
          toast.success(`Successfully imported ${result.count} consignors`, { id: toastId });
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

  const handleDelete = async (item: Consignor) => {
    if (!confirm(`Are you sure you want to delete ${item.name}?`)) return;
    try {
      const res = await fetch(`/api/v1/masters/consignors/${item.id}`, { method: 'DELETE' });
      if (res.ok) { 
        toast.success('Consignor deleted'); 
        fetchData(); 
      }
    } catch { 
      toast.error('Error deleting record'); 
    }
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    const exportData = data.map(c => ({
      Name: c.name,
      Company: c.companyName || 'N/A',
      Phone: c.phone || 'N/A',
      GSTIN: c.gstin || 'N/A',
      PAN: c.pan || 'N/A',
      'Credit Limit': c.creditLimit,
      'MSME Status': c.isMsme ? 'Yes' : 'No',
      Status: c.isActive ? 'Active' : 'Inactive'
    }));

    const filename = `Consignor_Master_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') exportToCSV(exportData, filename);
    else if (format === 'excel') exportToExcel(exportData, filename);
    else {
      const headers = ['Name', 'Company', 'Phone', 'GSTIN', 'Credit Limit', 'MSME'];
      const pdfData = exportData.map(c => [c.Name, c.Company, c.Phone, c.GSTIN, c['Credit Limit'].toLocaleString(), c['MSME Status']]);
      exportToPDF(headers, pdfData, filename, 'Consignor Master List');
    }
  };

  const columns = [
    { 
      header: 'Consignor Profile', 
      accessor: (row: Consignor) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-lg shadow-sm border border-slate-100">
            <Building2 className="h-5 w-5 text-slate-400" />
          </div>
          <div>
            <p className="font-black text-slate-900 leading-tight">{row.name}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{row.companyName || 'No Sub-Company'}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Compliance', 
      accessor: (row: Consignor) => (
        <div className="space-y-1">
          <p className="text-[11px] font-black text-slate-700">GST: <span className="font-mono">{row.gstin || 'N/A'}</span></p>
          <div className="flex items-center gap-2">
            {row.isMsme && <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-600 uppercase tracking-wider border border-purple-100">MSME</span>}
            {row.gstUrl && <span title="GST Copy Available" className="text-blue-500"><Paperclip className="h-3 w-3" /></span>}
          </div>
        </div>
      )
    },
    { 
      header: 'Contact', 
      accessor: (row: Consignor) => (
        <div>
          <p className="text-sm font-bold text-slate-700">{row.phone || 'No Phone'}</p>
          <p className="text-[10px] text-slate-400 max-w-[150px] truncate">{row.address || 'No Address'}</p>
        </div>
      )
    },
    { 
      header: 'Credit Terms', 
      accessor: (row: Consignor) => (
        <div>
          <p className="font-black text-blue-600 text-sm">₹{row.creditLimit.toLocaleString()}</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{row.creditDays} Days Cycle</p>
        </div>
      )
    },
    { 
      header: 'Actions', 
      className: 'text-right',
      accessor: (row: Consignor) => (
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={() => window.location.href = `/dashboard/accounting/ledger?consignorId=${row.id}`}
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all text-sm shadow-sm border border-blue-100"
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
            <Building2 className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Consignor Master</h1>
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest ml-12">Shipper Database, Credit Control & Compliance</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 mr-4">
            <input type="file" id="bulk-import" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleImport} />
            <Button 
              variant="outline" 
              size="sm" 
              disabled={importing}
              onClick={() => document.getElementById('bulk-import')?.click()}
              className="rounded-xl border-slate-200 text-blue-600 bg-blue-50/50 hover:bg-blue-600 hover:text-white font-bold text-[10px] uppercase gap-2"
            >
              <ArrowDownToLine className="h-4 w-4" /> Import
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('csv')} className="rounded-xl border-slate-200 text-slate-600 font-bold text-[10px] uppercase">CSV</Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('excel')} className="rounded-xl border-slate-200 text-slate-600 font-bold text-[10px] uppercase">Excel</Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} className="rounded-xl border-slate-200 text-red-600 bg-red-50/30 hover:bg-red-600 hover:text-white font-bold text-[10px] uppercase">PDF</Button>
          </div>
          <Button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="rounded-2xl h-14 px-8 bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-100 font-black uppercase tracking-widest text-[11px] flex items-center gap-3">
            <Plus className="h-5 w-5" /> Register New Consignor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Shippers', value: total, icon: <Building2 className="h-6 w-6 text-blue-600" />, color: 'bg-blue-50', text: 'text-slate-900' },
          { label: 'MSME Partners', value: data.filter(c => c.isMsme).length, icon: <ShieldCheck className="h-6 w-6 text-purple-600" />, color: 'bg-purple-50', text: 'text-purple-600' },
          { label: 'Avg Credit Limit', value: `₹${(data.reduce((acc, c) => acc + c.creditLimit, 0) / (data.length || 1)).toLocaleString()}`, icon: <CreditCard className="h-6 w-6 text-green-600" />, color: 'bg-green-50', text: 'text-green-600' },
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
          placeholder="Search by company, name, phone or GSTIN..." 
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

      {/* Consignor Form Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Consignor' : 'Register New Consignor'} size="lg">
        <ConsignorForm initialData={editingItem || undefined} onSuccess={() => { setIsModalOpen(false); fetchData(); }} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
