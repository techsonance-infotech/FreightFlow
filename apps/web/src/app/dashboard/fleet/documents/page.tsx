'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Loader2, ShieldCheck, FileText, CalendarClock, 
  AlertCircle, FileUp, Truck, Plus, Trash2, 
  Search, Filter, ChevronRight, CheckCircle2, Clock
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function FleetDocumentsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    vehicleId: '',
    docType: 'rc',
    docNo: '',
    issueDate: '',
    expiryDate: '',
    fileUrl: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [vRes, dRes] = await Promise.all([
        fetch('/api/v1/masters/vehicles?limit=100'),
        fetch('/api/v1/fleet/documents'),
      ]);
      const vData = await vRes.json();
      const dData = await dRes.json();
      setVehicles(vData.data || []);
      setDocuments(Array.isArray(dData) ? dData : []);
    } catch (error) {
      toast.error('Failed to load document data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicleId) return toast.error('Please select a vehicle');
    try {
      setSubmitting(true);
      const res = await fetch('/api/v1/fleet/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to save document');
      toast.success('Document recorded successfully');
      setFormData({ vehicleId: '', docType: 'rc', docNo: '', issueDate: '', expiryDate: '', fileUrl: '' });
      fetchInitialData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getExpiryStyle = (date: string) => {
    const days = differenceInDays(new Date(date), new Date());
    if (days < 0) return 'bg-rose-50 text-rose-600 border-rose-100';
    if (days <= 30) return 'bg-amber-50 text-amber-600 border-amber-100';
    return 'bg-emerald-50 text-emerald-600 border-emerald-100';
  };

  if (loading) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Registry...</p>
      </div>
    );
  }

  const filteredDocs = documents.filter(doc => 
    doc.vehicle?.regNo?.toLowerCase().includes(search.toLowerCase()) ||
    doc.docNo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Document Compliance</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Universal registry for RC, Insurance, Permits and Fitness</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <div>
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Active Status</p>
              <p className="text-sm font-black text-emerald-700">98.2% Compliant</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* 2. Registration Panel (Left) */}
        <div className="xl:col-span-4">
          <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm sticky top-32">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileUp className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-none">Register Document</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Add new compliance record</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Vehicle</label>
                <select 
                  value={formData.vehicleId} 
                  onChange={e => setFormData(prev => ({ ...prev, vehicleId: e.target.value }))}
                  className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-50 transition-all outline-none"
                >
                  <option value="">Choose Vehicle...</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.regNo}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type of Document</label>
                <select 
                  value={formData.docType} 
                  onChange={e => setFormData(prev => ({ ...prev, docType: e.target.value }))}
                  className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-50 transition-all outline-none"
                >
                  <option value="rc">Registration (RC)</option>
                  <option value="insurance">Insurance Policy</option>
                  <option value="fitness">Fitness Certificate</option>
                  <option value="puc">PUC Certificate</option>
                  <option value="permit">National/State Permit</option>
                  <option value="tax">Road Tax</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Document Number</label>
                <input 
                  type="text" 
                  value={formData.docNo}
                  onChange={e => setFormData(prev => ({ ...prev, docNo: e.target.value }))}
                  placeholder="e.g. MH-12-2024-XXXX"
                  className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-50 transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Issue Date</label>
                  <input 
                    type="date" 
                    value={formData.issueDate}
                    onChange={e => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                    className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-50 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiry Date</label>
                  <input 
                    type="date" 
                    value={formData.expiryDate}
                    onChange={e => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-50 outline-none border-2 border-transparent focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Document Attachment (URL)</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input 
                    type="text" 
                    value={formData.fileUrl}
                    onChange={e => setFormData(prev => ({ ...prev, fileUrl: e.target.value }))}
                    placeholder="https://docs.freightflow.com/..."
                    className="w-full h-12 pl-11 pr-4 bg-slate-50 border-none rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-50 outline-none"
                  />
                </div>
              </div>

              <Button type="submit" loading={submitting} className="w-full h-12 text-xs">
                Archive Document
              </Button>
            </form>
          </div>
        </div>

        {/* 3. Compliance Registry (Right) */}
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              <input 
                placeholder="Filter by Registration No or Document ID..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-10 pl-11 pr-4 bg-transparent border-none text-sm font-bold focus:ring-0 outline-none"
              />
            </div>
            <Button variant="outline" size="sm" icon={<Filter className="h-3.5 w-3.5" />}>
              All Categories
            </Button>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-400">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Fleet Unit</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Doc Type</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Identity No</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Validity</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-center">Status</th>
                    <th className="px-8 py-5 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <ShieldCheck className="h-10 w-10 text-slate-100" />
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">All documents are synchronized</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[10px]">
                              {doc.vehicle?.regNo?.slice(-2)}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900">{doc.vehicle?.regNo}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {doc.vehicle?.id?.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{doc.docType}</span>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-xs font-bold text-slate-500 font-mono tracking-tight">{doc.docNo}</p>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-xs font-black text-slate-900">{format(new Date(doc.expiryDate), 'dd MMM yyyy')}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">Expires in {differenceInDays(new Date(doc.expiryDate), new Date())} Days</p>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex justify-center">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-sm",
                              getExpiryStyle(doc.expiryDate)
                            )}>
                              {differenceInDays(new Date(doc.expiryDate), new Date()) < 0 ? 'Expired' : 'Valid'}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {doc.fileUrl && (
                              <button onClick={() => window.open(doc.fileUrl)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-all">
                                <FileText className="h-4 w-4" />
                              </button>
                            )}
                            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-all">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
