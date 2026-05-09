'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { exportToCSV, exportToExcel, exportToPDF } from '@/lib/export-utils';
import { Modal } from '@/components/ui/modal';
import { LabourExpenseModal } from '@/components/masters/labour-expense-modal';

import { AttendanceTab } from '@/components/masters/labour-attendance-tab';
import { PayrollTab } from '@/components/masters/labour-payroll-tab';
import { 
  User, Phone, IndianRupee, Fingerprint, 
  FileText, ScrollText, Calendar, Banknote, 
  Search, ArrowRight, Smartphone, Landmark,
  Pencil, Trash2, CheckCircle2, X
} from 'lucide-react';

interface LabourDetailViewProps {
  labour: any;
  onClose: () => void;
}

export function LabourDetailView({ labour, onClose }: LabourDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'ledger' | 'attendance' | 'payroll'>('ledger');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [editingExpense, setEditingExpense] = useState<any | null>(null);

  const fetchExpenses = async () => {
    if (activeTab !== 'ledger') return;
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (fromDate) query.append('fromDate', fromDate);
      if (toDate) query.append('toDate', toDate);

      const response = await fetch(`/api/v1/masters/labour/${labour.id}/expenses?${query.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch expenses');
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      toast.error('Error loading transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [search, fromDate, toDate, activeTab]);

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    const exportData = expenses.map(e => ({
      Date: new Date(e.date).toLocaleDateString(),
      Type: e.type,
      Amount: e.amount / 100,
      Mode: e.paymentMode,
      Message: e.message || '-'
    }));

    const filename = `Labour_Expenses_${labour.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      exportToCSV(exportData, filename);
    } else if (format === 'excel') {
      exportToExcel(exportData, filename);
    } else {
      const headers = ['Date', 'Type', 'Amount (₹)', 'Mode', 'Message'];
      const pdfData = exportData.map(e => [e.Date, e.Type, e.Amount.toFixed(2), e.Mode, e.Message]);
      exportToPDF(headers, pdfData, filename, `Transaction Ledger: ${labour.name}`);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const response = await fetch(`/api/v1/masters/labour/${labour.id}/expenses/${expenseId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete transaction');
      toast.success('Transaction deleted');
      fetchExpenses();
    } catch (error) {
      toast.error('Error deleting transaction');
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Header */}
      <div className="p-8 border-b border-slate-50 bg-slate-50/30">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-3xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-200 text-white">
              <User className="h-10 w-10" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{labour.name}</h2>
                {labour.skillCategory && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest border border-blue-100">
                    {labour.skillCategory}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100">
                  <Phone className="h-3 w-3 text-blue-500" /> {labour.phone || 'N/A'}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100">
                  <IndianRupee className="h-3 w-3 text-blue-500" /> ₹{(labour.salary / 100).toLocaleString()}/mo
                </span>
                {labour.aadharNo && (
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100">
                    <Fingerprint className="h-3 w-3 text-blue-500" /> {labour.aadharNo}
                  </span>
                )}
                {labour.aadharUrl && (
                  <a href={labour.aadharUrl} target="_blank" rel="noreferrer" className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors">
                    <FileText className="h-3 w-3" /> Aadhar Doc
                  </a>
                )}
                {labour.panUrl && (
                  <a href={labour.panUrl} target="_blank" rel="noreferrer" className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors">
                    <FileText className="h-3 w-3" /> PAN Doc
                  </a>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl h-12 w-12 hover:bg-slate-100 text-slate-400">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-8">
          {[
            { id: 'ledger', label: 'Transaction Ledger', icon: <ScrollText className="h-4 w-4" /> },
            { id: 'attendance', label: 'Attendance', icon: <Calendar className="h-4 w-4" /> },
            { id: 'payroll', label: 'Payroll & Settlement', icon: <Banknote className="h-4 w-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' 
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-slate-50/10">
        {activeTab === 'ledger' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Input 
                  placeholder="Search transactions..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  className="w-64 bg-white border-slate-200 h-11 rounded-xl shadow-sm"
                  icon={<Search className="h-4 w-4" />}
                />
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                  <input 
                    type="date" 
                    value={fromDate} 
                    onChange={(e) => setFromDate(e.target.value)}
                    className="bg-transparent border-none text-[10px] font-black uppercase p-2 outline-none"
                  />
                  <ArrowRight className="h-3 w-3 text-slate-300" />
                  <input 
                    type="date" 
                    value={toDate} 
                    onChange={(e) => setToDate(e.target.value)}
                    className="bg-transparent border-none text-[10px] font-black uppercase p-2 outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleExport('csv')} className="rounded-xl border-slate-200 text-slate-500 font-black text-[10px] uppercase h-9">CSV</Button>
                <Button variant="outline" size="sm" onClick={() => handleExport('excel')} className="rounded-xl border-slate-200 text-slate-500 font-black text-[10px] uppercase h-9">Excel</Button>
                <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} className="rounded-xl border-slate-200 text-slate-500 font-black text-[10px] uppercase h-9">PDF</Button>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Mode</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Loading...</td>
                    </tr>
                  ) : expenses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center opacity-40">
                          <ScrollText className="h-10 w-10 mb-4" />
                          <p className="text-xs font-black uppercase tracking-widest">Empty Ledger</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    expenses.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-5">
                          <p className="text-xs font-black text-slate-900">{new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            e.type === 'Salary' ? 'bg-blue-50 text-blue-600' :
                            e.type === 'Advance' ? 'bg-orange-50 text-orange-600' :
                            e.type === 'Bonus' ? 'bg-green-50 text-green-600' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {e.type}
                          </span>
                          {e.message && <p className="text-[10px] text-slate-400 mt-1.5 font-medium italic">"{e.message}"</p>}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">{e.paymentMode === 'Cash' ? <Banknote className="h-4 w-4" /> : e.paymentMode === 'Bank' ? <Landmark className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{e.paymentMode}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <p className={`text-sm font-black ${e.type === 'Deduction' ? 'text-red-600' : 'text-slate-900'}`}>
                            {e.type === 'Deduction' ? '-' : ''}₹{(e.amount / 100).toLocaleString()}
                          </p>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingExpense(e)} className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white transition-all text-xs shadow-sm text-slate-400"><Pencil className="h-3 w-3" /></button>
                            <button onClick={() => handleDeleteExpense(e.id)} className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-red-500 hover:text-white transition-all text-xs shadow-sm text-slate-400"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-8 border-t border-slate-50 bg-white rounded-[40px] border border-slate-100 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-12">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Net Transactions</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{expenses.length}</p>
                </div>
                <div className="h-10 w-px bg-slate-100" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Outflow</p>
                  <p className="text-2xl font-black text-blue-600 mt-1">
                    ₹{(expenses.reduce((sum, e) => sum + (e.type === 'Deduction' ? 0 : e.amount), 0) / 100).toLocaleString()}
                  </p>
                </div>
              </div>
              <Button onClick={onClose} className="rounded-2xl h-14 px-10 bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 shadow-xl shadow-blue-100">Close Registry</Button>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && <AttendanceTab labourId={labour.id} />}
        {activeTab === 'payroll' && <PayrollTab labourId={labour.id} />}
      </div>

      <Modal isOpen={!!editingExpense} onClose={() => setEditingExpense(null)} title="Edit Transaction Details" size="md">
        {editingExpense && (
          <LabourExpenseModal 
            labourId={labour.id} 
            initialData={editingExpense} 
            onSuccess={() => { setEditingExpense(null); fetchExpenses(); }} 
            onCancel={() => setEditingExpense(null)} 
          />
        )}
      </Modal>
    </div>
  );
}
