'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Calendar, Users, Printer, Download, FileText, ArrowRight } from 'lucide-react';

interface SOAModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealers: any[];
  defaultPartyId?: string;
}

export function SOAModal({ isOpen, onClose, dealers, defaultPartyId }: SOAModalProps) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [formData, setFormData] = useState({
    partyId: defaultPartyId || '',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const generateSOA = async () => {
    if (!formData.partyId) return toast.error('Please select a Party');
    setLoading(true);
    try {
      const params = new URLSearchParams(formData);
      const res = await fetch(`/api/v1/accounting/reports/soa?${params}`);
      const json = await res.json();
      if (res.ok) {
        setReport(json.data);
      } else {
        throw new Error(json.error);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('soa-print-area');
    if (!printContent) return;
    const win = window.open('', '', 'height=700,width=900');
    win?.document.write('<html><head><title>Statement of Account</title>');
    win?.document.write('<style>body{font-family:sans-serif;padding:40px;} table{width:100%;border-collapse:collapse;margin-top:20px;} th,td{border:1px solid #ddd;padding:8px;text-align:left;} th{background:#f5f5f5;} .header{text-align:center;margin-bottom:30px;} .totals{margin-top:20px;text-align:right;}</style>');
    win?.document.write('</head><body>');
    win?.document.write(printContent.innerHTML);
    win?.document.write('</body></html>');
    win?.document.close();
    win?.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Statement of Account"
      size={report ? '3xl' : 'xl'}
    >
      <div className="space-y-6">
        {!report ? (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Select Party (Customer/Vendor)</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <select 
                  value={formData.partyId}
                  onChange={e => setFormData({...formData, partyId: e.target.value})}
                  className="w-full h-12 pl-11 pr-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all appearance-none"
                >
                  <option value="">Choose Party...</option>
                  {dealers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.category})</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">From Date</label>
                <input 
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({...formData, startDate: e.target.value})}
                  className="w-full h-12 px-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold text-neutral-700 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">To Date</label>
                <input 
                  type="date"
                  value={formData.endDate}
                  onChange={e => setFormData({...formData, endDate: e.target.value})}
                  className="w-full h-12 px-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold text-neutral-700 outline-none"
                />
              </div>
            </div>

            <Button 
              onClick={generateSOA} 
              loading={loading}
              className="w-full h-12 bg-accent-600 hover:bg-accent-700 text-white font-black uppercase tracking-widest text-xs"
            >
              Generate Statement
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setReport(null)} className="text-xs font-bold text-neutral-400">
                ← Change Parameters
              </Button>
              <div className="flex gap-2">
                <Button onClick={handlePrint} variant="outline" className="h-9 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest border-neutral-200">
                  <Printer className="h-3 w-3 mr-2" /> Print
                </Button>
                <Button variant="outline" className="h-9 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest border-neutral-200">
                  <Download className="h-3 w-3 mr-2" /> Export PDF
                </Button>
              </div>
            </div>

            <div id="soa-print-area" className="bg-white border border-neutral-100 rounded-2xl p-8 shadow-sm">
              <div className="header">
                <h1 className="text-2xl font-black text-neutral-900 uppercase tracking-tight">Statement of Account</h1>
                <p className="text-sm font-bold text-neutral-500 mt-1">
                  {new Date(report.period.start).toLocaleDateString()} - {new Date(report.period.end).toLocaleDateString()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-10 mb-8 border-b border-neutral-100 pb-8">
                <div>
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Statement For</p>
                  <h3 className="text-lg font-black text-neutral-900">{report.party.name}</h3>
                  <p className="text-xs font-bold text-neutral-500 mt-1">{report.party.address}</p>
                  <p className="text-xs font-black text-accent-600 mt-1">GSTIN: {report.party.gstin}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Summary</p>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-neutral-600">Opening Balance: <span className="font-black text-neutral-900">₹{(report.openingBalance / 100).toLocaleString()}</span></p>
                    <p className="text-sm font-bold text-neutral-600">Closing Balance: <span className="font-black text-accent-600 text-lg">₹{(report.closingBalance / 100).toLocaleString()}</span></p>
                  </div>
                </div>
              </div>

              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-neutral-50">
                    <th className="px-4 py-3 font-black text-neutral-400 uppercase tracking-widest">Date</th>
                    <th className="px-4 py-3 font-black text-neutral-400 uppercase tracking-widest">Description</th>
                    <th className="px-4 py-3 font-black text-neutral-400 uppercase tracking-widest text-right">Debit (Dr)</th>
                    <th className="px-4 py-3 font-black text-neutral-400 uppercase tracking-widest text-right">Credit (Cr)</th>
                    <th className="px-4 py-3 font-black text-neutral-400 uppercase tracking-widest text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50 font-bold text-neutral-700">
                  <tr>
                    <td className="px-4 py-3">{new Date(report.period.start).toLocaleDateString()}</td>
                    <td className="px-4 py-3">Opening Balance</td>
                    <td className="px-4 py-3 text-right">-</td>
                    <td className="px-4 py-3 text-right">-</td>
                    <td className="px-4 py-3 text-right">₹{(report.openingBalance / 100).toLocaleString()}</td>
                  </tr>
                  {report.transactions.map((tx: any) => (
                    <tr key={tx.id}>
                      <td className="px-4 py-3">{new Date(tx.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className="text-[9px] font-black uppercase text-accent-600 mr-2">[{tx.voucherType}]</span>
                        {tx.narration || tx.voucherNo}
                      </td>
                      <td className="px-4 py-3 text-right text-rose-600">{tx.debit > 0 ? `₹${(tx.debit / 100).toLocaleString()}` : '-'}</td>
                      <td className="px-4 py-3 text-right text-emerald-600">{tx.credit > 0 ? `₹${(tx.credit / 100).toLocaleString()}` : '-'}</td>
                      <td className="px-4 py-3 text-right">₹{(tx.balance / 100).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
