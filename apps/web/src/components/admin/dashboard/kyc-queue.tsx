'use client';

import React, { useState } from 'react';
import { ShieldCheck, Eye, CheckCircle2, XCircle, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { verifyKycDocument } from '@/app/actions/admin/kyc';
import Link from 'next/link';

interface PendingDoc {
  id: string;
  type: string;
  url: string;
  createdAt: Date;
  tenant: {
    id: string;
    name: string;
  };
}

interface KycQueueProps {
  documents: PendingDoc[];
}

export function DashboardKycQueue({ documents: initialDocuments }: KycQueueProps) {
  const [documents, setDocuments] = useState<PendingDoc[]>(initialDocuments);
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (docId: string, status: 'verified' | 'rejected') => {
    setLoading(docId);
    try {
      await verifyKycDocument(docId, status);
      toast.success(`Compliance document successfully ${status}`);
      // Remove verified/rejected item from local dashboard list
      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch (err) {
      toast.error('Failed to submit compliance action');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm relative overflow-hidden flex flex-col h-full">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-[80px] -mr-32 -mt-32" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" /> Compliance Queue
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 text-left">
            Pending Workspace KYC Documents
          </p>
        </div>
        <span className="px-3.5 py-1 bg-blue-50 border border-blue-100 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-wider">
          {documents.length} Alert{documents.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-4 flex-1 relative z-10">
        {documents.length === 0 ? (
          <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center opacity-30">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2" />
            <p className="text-[10px] font-black uppercase tracking-widest">All Workspaces Verified</p>
            <p className="text-[9px] font-bold text-slate-400 mt-1">Compliance index at 100%</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div 
              key={doc.id}
              className="p-5 bg-slate-50/50 hover:bg-white border border-slate-100/50 rounded-[2rem] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors shadow-sm">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <Link 
                    href={`/admin/tenants/${doc.tenant.id}`}
                    className="text-xs font-black text-slate-900 hover:text-blue-600 transition-colors tracking-tight flex items-center gap-1.5"
                  >
                    {doc.tenant.name} <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                    {doc.type} Document &bull; {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <a 
                  href={doc.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="h-10 px-4 bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 rounded-xl flex items-center gap-2 text-[9px] font-black uppercase tracking-widest shadow-sm transition-all"
                >
                  <Eye className="h-3.5 w-3.5" /> View
                </a>
                
                <Button 
                  onClick={() => handleAction(doc.id, 'rejected')}
                  disabled={!!loading}
                  variant="ghost"
                  className="h-10 w-10 border border-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 rounded-xl flex items-center justify-center p-0"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
                
                <Button 
                  onClick={() => handleAction(doc.id, 'verified')}
                  disabled={!!loading}
                  className="h-10 w-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center p-0 shadow-sm"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
