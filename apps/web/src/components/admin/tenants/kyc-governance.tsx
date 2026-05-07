'use client';

import React, { useState } from 'react';
import { 
  FileText, CheckCircle2, XCircle, 
  Eye, Download, ShieldCheck, 
  AlertTriangle, Clock, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { verifyKycDocument } from '@/app/actions/admin/kyc';
import { cn } from '@/lib/utils';

export function KycGovernance({ tenantId, documents }: { tenantId: string, documents: any[] }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleVerify = async (docId: string, status: 'verified' | 'rejected') => {
    setLoading(docId);
    try {
      await verifyKycDocument(docId, status);
      toast.success(`Document ${status} successfully`);
    } catch (error) {
      toast.error('Failed to update document status');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-[3rem] p-12 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-[100px] -mr-32 -mt-32" />
      
      <div className="flex items-center justify-between mb-16 border-b border-slate-50 pb-10 relative z-10">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/20 rotate-3">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">KYC Sovereignty</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Verification of Mission-Critical Documents</p>
          </div>
        </div>
        <div className="text-right">
          <span className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">
            {documents.filter(d => d.status === 'verified').length} / {documents.length} Verified
          </span>
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        {documents.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
             <FileText className="h-12 w-12 text-slate-200 mx-auto mb-4" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Documents Uploaded by Tenant</p>
          </div>
        ) : documents.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between p-8 bg-slate-50/50 hover:bg-white rounded-3xl border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-slate-100 transition-all duration-500 group">
            <div className="flex items-center gap-8">
              <div className="h-14 w-14 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-300 shadow-sm group-hover:text-blue-600 group-hover:border-blue-200 transition-all">
                <FileText className="h-7 w-7" />
              </div>
              <div>
                <p className="text-lg font-black text-slate-900 tracking-tight">{doc.type}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                   Uploaded {new Date(doc.createdAt).toLocaleDateString()} &bull; 
                   <span className={cn(
                     "font-black",
                     doc.status === 'verified' ? "text-emerald-600" : doc.status === 'rejected' ? "text-rose-600" : "text-amber-500"
                   )}>STATUS: {doc.status.toUpperCase()}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a 
                href={doc.url} 
                target="_blank" 
                className="h-12 px-6 bg-white border border-slate-100 rounded-xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
              >
                <Eye className="h-4 w-4" />
                View Node
              </a>
              
              {doc.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => handleVerify(doc.id, 'rejected')}
                    disabled={!!loading}
                    variant="outline"
                    className="h-12 w-12 border-rose-100 text-rose-600 hover:bg-rose-50 rounded-xl flex items-center justify-center p-0"
                  >
                    <XCircle className="h-5 w-5" />
                  </Button>
                  <Button 
                    onClick={() => handleVerify(doc.id, 'verified')}
                    disabled={!!loading}
                    className="h-12 w-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center p-0 shadow-lg shadow-emerald-200"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex items-center gap-4 p-8 bg-blue-50 border border-blue-100 rounded-[2rem]">
         <AlertTriangle className="h-6 w-6 text-blue-600" />
         <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest leading-relaxed">
           Verification of documentation triggers immutable governance snapshots. Rejection requires a mandatory advisory note to be issued to the tenant gateway.
         </p>
      </div>
    </div>
  );
}
