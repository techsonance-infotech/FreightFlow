'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { 
  Calendar, Users, Download, FileText, ArrowRight, Loader2, Search, Filter, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { generateSOAPDF } from '@/lib/pdf/soa-utils';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SOAModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealers: any[];
  defaultPartyId?: string;
}

export function SOAModal({ isOpen, onClose, dealers, defaultPartyId }: SOAModalProps) {
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [formData, setFormData] = useState({
    partyId: defaultPartyId || '',
    startDate: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  const handleGenerate = async () => {
    if (!formData.partyId || !formData.startDate || !formData.endDate) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams(formData);
      const res = await fetch(`/api/v1/accounting/reports/soa?${params}`);
      const json = await res.json();
      
      if (res.ok && json.data) {
        setReport(json.data);
        toast.success('SOA Data Fetched');
      } else {
        throw new Error(json.error || 'Failed to fetch data');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to fetch SOA data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!report) return;
    setIsGenerating(true);
    try {
      const dealer = dealers.find(d => d.id === report.partyId) || report.party;
      const doc = await generateSOAPDF(
        dealer, 
        report.transactions || [], 
        { from: new Date(formData.startDate), to: new Date(formData.endDate) }
      );
      doc.save(`SOA_${dealer.name}_${formData.startDate}_to_${formData.endDate}.pdf`);
      toast.success('Statement Downloaded Successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setReport(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Statement of Account"
      size="lg"
    >
      <div className="flex flex-col gap-6">
        <p className="text-sm text-neutral-500 font-medium">
          {report ? "Preview and download the generated statement." : "Generate a detailed financial statement for a specific dealer."}
        </p>
        {!report ? (
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Select Dealer</label>
                <div className="relative group">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-accent-600 transition-colors" />
                  <select 
                    value={formData.partyId}
                    onChange={(e) => setFormData(prev => ({ ...prev, partyId: e.target.value }))}
                    className="w-full h-12 pl-11 pr-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-accent-600/5 focus:border-accent-600 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select a Dealer</option>
                    {dealers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Statement Period</label>
                <div className="flex items-center gap-2 bg-neutral-50 p-1 rounded-2xl border border-neutral-100">
                  <div className="relative flex-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                    <input 
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full bg-transparent border-none text-xs font-bold outline-none text-neutral-700 h-10 pl-9 pr-2"
                    />
                  </div>
                  <div className="h-4 w-[1px] bg-neutral-200" />
                  <div className="relative flex-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                    <input 
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full bg-transparent border-none text-xs font-bold outline-none text-neutral-700 h-10 pl-9 pr-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="h-11 px-6 rounded-xl border-neutral-200 font-bold text-xs uppercase tracking-widest text-neutral-500"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleGenerate}
                disabled={loading}
                className="h-11 px-8 rounded-xl bg-accent-600 hover:bg-accent-700 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-accent-600/20 gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                Generate Preview
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Preview Toolbar */}
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center border border-neutral-100">
                  <FileText className="h-5 w-5 text-accent-600" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-neutral-900 uppercase">Statement Generated</h4>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                    {report.transactions?.length || 0} Transactions Found
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={resetForm}
                  className="h-9 rounded-lg border-neutral-200 text-neutral-500 font-bold text-[10px] uppercase tracking-widest"
                >
                  Change Filters
                </Button>
                <Button 
                  size="sm"
                  onClick={handleDownload}
                  disabled={isGenerating}
                  className="h-9 rounded-lg bg-accent-600 hover:bg-accent-700 text-white font-black text-[10px] uppercase tracking-widest gap-2"
                >
                  {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                  Download PDF
                </Button>
              </div>
            </div>

            {/* Simple Preview List */}
            <div className="max-h-[400px] overflow-y-auto rounded-2xl border border-neutral-100 divide-y divide-neutral-50">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-neutral-50 border-b border-neutral-100">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Date</th>
                    <th className="px-4 py-3 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Particulars</th>
                    <th className="px-4 py-3 text-[10px] font-black text-neutral-400 uppercase tracking-widest text-right">Debit</th>
                    <th className="px-4 py-3 text-[10px] font-black text-neutral-400 uppercase tracking-widest text-right">Credit</th>
                    <th className="px-4 py-3 text-[10px] font-black text-neutral-400 uppercase tracking-widest text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {report.transactions?.map((t: any, i: number) => (
                    <tr key={i} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-4 py-3 text-[11px] font-bold text-neutral-600">{format(new Date(t.date), 'dd/MM/yy')}</td>
                      <td className="px-4 py-3">
                        <p className="text-[11px] font-black text-neutral-800 uppercase">{t.voucherType}</p>
                        <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-tighter">{t.voucherNo || t.refNo}</p>
                      </td>
                      <td className="px-4 py-3 text-[11px] font-bold text-neutral-700 text-right">{t.debit ? t.debit.toFixed(2) : '-'}</td>
                      <td className="px-4 py-3 text-[11px] font-bold text-neutral-700 text-right">{t.credit ? t.credit.toFixed(2) : '-'}</td>
                      <td className="px-4 py-3 text-[11px] font-black text-neutral-900 text-right">{t.balance?.toFixed(2)}</td>
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
