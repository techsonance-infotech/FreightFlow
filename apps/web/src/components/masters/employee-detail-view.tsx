'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { exportToCSV, exportToExcel, exportToPDF } from '@/lib/export-utils';
import { Modal } from '@/components/ui/modal';
import { EmployeeTransactionModal } from '@/components/masters/employee-transaction-modal';
import { EmployeeAttendanceTab } from '@/components/masters/employee-attendance-tab';
import { EmployeePayrollTab } from '@/components/masters/employee-payroll-tab';
import { 
  Plus, Trash2, Landmark, X, Search, 
  Download, Eye, ShieldCheck, MapPin, 
  Phone, Mail, Calendar, Wallet, IndianRupee,
  CheckCircle2, History, FileText, ExternalLink,
  User, Fingerprint, ScrollText, Banknote, FolderOpen,
  Smartphone, Pencil, Contact, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmployeeDetailViewProps {
  employee: any;
  onClose: () => void;
  isOpen: boolean;
}

export function EmployeeDetailView({ employee, onClose, isOpen }: EmployeeDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'ledger' | 'attendance' | 'payroll' | 'documents'>('ledger');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [editingTransaction, setEditingTransaction] = useState<any | null>(null);

  const fetchTransactions = async () => {
    if (activeTab !== 'ledger' || !employee) return;
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (fromDate) query.append('fromDate', fromDate);
      if (toDate) query.append('toDate', toDate);

      const response = await fetch(`/api/v1/masters/employees/${employee.id}/transactions?${query.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      toast.error('Error loading transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTransactions();
    }
  }, [search, fromDate, toDate, activeTab, isOpen, employee?.id]);

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    const exportData = transactions.map(e => ({
      Date: new Date(e.date).toLocaleDateString(),
      Type: e.type,
      Amount: e.amount / 100,
      Mode: e.paymentMode,
      Message: e.message || '-'
    }));

    const filename = `Employee_Ledger_${employee.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      exportToCSV(exportData, filename);
    } else if (format === 'excel') {
      exportToExcel(exportData, filename);
    } else {
      const headers = ['Date', 'Type', 'Amount (₹)', 'Mode', 'Message'];
      const pdfData = exportData.map(e => [e.Date, e.Type, e.Amount.toFixed(2), e.Mode, e.Message]);
      exportToPDF(headers, pdfData, filename, `Transaction Ledger: ${employee.name}`);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const response = await fetch(`/api/v1/masters/employees/${employee.id}/transactions/${transactionId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete transaction');
      toast.success('Transaction deleted');
      fetchTransactions();
    } catch (error) {
      toast.error('Error deleting transaction');
    }
  };

  if (!employee) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] transition-opacity duration-500",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Side Panel - Pure PARITY with Image 2 Style */}
      <div className={cn(
        "fixed top-0 right-0 h-screen bg-white shadow-2xl z-[101] transition-all duration-500 ease-out flex flex-col overflow-hidden",
        isOpen ? "translate-x-0 w-full lg:w-[50vw]" : "translate-x-full w-0"
      )}>
        
        {/* Header - Exact PARITY */}
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-3xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-200 text-white">
                <User className="h-10 w-10" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">{employee.name}</h2>
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest border border-blue-100">
                    {employee.designation || 'Staff'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <InfoChip icon={<Phone className="h-4 w-4" />} label={employee.phone || 'N/A'} />
                  <InfoChip icon={<IndianRupee className="h-4 w-4" />} label={`₹${(employee.salary || 0 / 100).toLocaleString()}/mo`} />
                  <InfoChip icon={<Fingerprint className="h-4 w-4" />} label={employee.aadharNo || 'N/A'} />
                    <a href={employee.aadharUrl} target="_blank" rel="noreferrer" className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors">
                      <FileText className="h-3 w-3" /> Doc
                    </a>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all shadow-sm"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Tab Navigation - Exact PARITY */}
          <div className="flex items-center gap-2 mt-8">
            {[
              { id: 'ledger', label: 'Transaction Ledger', icon: <ScrollText className="h-4 w-4" /> },
              { id: 'attendance', label: 'Attendance', icon: <Calendar className="h-4 w-4" /> },
              { id: 'payroll', label: 'Payroll & Settlement', icon: <Banknote className="h-4 w-4" /> },
              { id: 'documents', label: 'Documents', icon: <FolderOpen className="h-4 w-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2.5 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                  activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' 
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                )}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area - Exact PARITY */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/10 custom-scrollbar">
          
          {activeTab === 'ledger' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              {/* Filter Row - Exact PARITY */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <input 
                      placeholder="Search transactions..." 
                      value={search} 
                      onChange={(e) => setSearch(e.target.value)} 
                      className="w-64 h-11 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="bg-transparent border-none text-[10px] font-black uppercase p-2 outline-none" />
                    <ArrowRight className="h-3 w-3 text-slate-300" />
                    <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="bg-transparent border-none text-[10px] font-black uppercase p-2 outline-none" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <ExportButton label="CSV" onClick={() => handleExport('csv')} />
                   <ExportButton label="Excel" onClick={() => handleExport('excel')} />
                   <ExportButton label="PDF" onClick={() => handleExport('pdf')} />
                </div>
              </div>

              {/* Table - Exact PARITY */}
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
                      <tr><td colSpan={5} className="px-6 py-20 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Loading...</td></tr>
                    ) : transactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-32 text-center">
                          <div className="flex flex-col items-center gap-4 opacity-40">
                            <ScrollText className="h-10 w-10 text-slate-300" />
                            <p className="text-xs font-black uppercase tracking-widest text-slate-900">Empty Ledger</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      transactions.map((e) => (
                        <tr key={e.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-5">
                            <p className="text-xs font-black text-slate-900">{new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </td>
                          <td className="px-6 py-5">
                            <span className={cn(
                              "inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                              getTransactionColor(e.type)
                            )}>
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
                            <p className={cn(
                              "text-sm font-black",
                              e.type === 'Deduction' ? 'text-red-600' : 'text-slate-900'
                            )}>
                              {e.type === 'Deduction' ? '-' : ''}₹{(e.amount / 100).toLocaleString('en-IN')}
                            </p>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setEditingTransaction(e)} className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white transition-all text-xs text-slate-400"><Pencil className="h-3 w-3" /></button>
                              <button onClick={() => handleDeleteTransaction(e.id)} className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-red-500 hover:text-white transition-all text-xs text-slate-400"><Trash2 className="h-3 w-3" /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary Bar - Exact PARITY */}
              <div className="p-8 bg-white rounded-[40px] border border-slate-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-12">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Net Transactions</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{transactions.length}</p>
                  </div>
                  <div className="h-10 w-px bg-slate-100" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Outflow</p>
                    <p className="text-2xl font-black text-blue-600 mt-1">
                      ₹{(transactions.reduce((sum, e) => sum + (e.type === 'Deduction' ? 0 : e.amount), 0) / 100).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button onClick={onClose} className="rounded-2xl h-14 px-10 bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 shadow-xl shadow-blue-100">Close Registry</Button>
              </div>
            </div>
          )}

          {/* Tab Contents */}
          <div className="h-full">
             {activeTab === 'attendance' && <EmployeeAttendanceTab employeeId={employee.id} />}
             {activeTab === 'payroll' && <EmployeePayrollTab employee={employee} />}
             {activeTab === 'documents' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                  <DocumentCard title="Identity (PAN Card)" url={employee.panUrl} idNo={employee.pan} icon={<Fingerprint className="h-6 w-6" />} />
                  <DocumentCard title="Residency (Aadhar)" url={employee.aadharUrl} idNo={employee.aadharNo} icon={<Contact className="h-6 w-6" />} />
                  <DocumentCard title="Bank Passbook" url={employee.bankPassbookUrl} idNo={employee.bankAccount} icon={<Banknote className="h-6 w-6" />} />
                </div>
             )}
          </div>
        </div>
      </div>

      <Modal isOpen={!!editingTransaction} onClose={() => setEditingTransaction(null)} title="Edit Transaction" size="md">
        {editingTransaction && (
          <EmployeeTransactionModal 
            employeeId={employee.id} 
            initialData={editingTransaction} 
            onSuccess={() => { setEditingTransaction(null); fetchTransactions(); }} 
            onCancel={() => setEditingTransaction(null)} 
          />
        )}
      </Modal>
    </>
  );
}

function InfoChip({ icon, label }: any) {
  return (
    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
      <span className="text-blue-500 text-lg">{icon}</span> {label}
    </span>
  );
}

function ExportButton({ label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all shadow-sm"
    >
      {label}
    </button>
  );
}

function DocumentCard({ title, url, idNo, icon }: any) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl">
          {icon}
        </div>
        <div>
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">{title}</h4>
          <p className="text-[10px] font-bold text-slate-400 mt-1 tracking-widest uppercase">{idNo || 'NOT RECORDED'}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {url ? (
          <Button size="sm" variant="outline" onClick={() => window.open(url, '_blank')} className="h-10 rounded-xl px-4 text-[9px] font-black uppercase tracking-widest border-slate-100 hover:bg-blue-600 hover:text-white transition-all w-full">
            View File
          </Button>
        ) : (
          <div className="w-full text-center py-2.5 bg-rose-50 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-rose-100">
            Missing Document
          </div>
        )}
      </div>
    </div>
  );
}

function getTransactionColor(type: string) {
  switch (type) {
    case 'Salary': return 'bg-blue-50 text-blue-600';
    case 'Advance': return 'bg-orange-50 text-orange-600';
    case 'Bonus': return 'bg-green-50 text-green-600';
    case 'Deduction': return 'bg-red-50 text-red-600';
    default: return 'bg-slate-100 text-slate-600';
  }
}
