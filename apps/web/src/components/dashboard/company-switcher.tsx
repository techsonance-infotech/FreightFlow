'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Building2, Check, ArrowLeftRight, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  gstin?: string;
}

export function CompanySwitcher({ currentCompanyId }: { currentCompanyId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveCompany = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/companies`);
        const json = await res.json();
        const companies = json.data || [];
        const current = companies.find((c: any) => c.id === currentCompanyId);
        setActiveCompany(current || null);
      } catch (error) {
        console.error('Failed to fetch active company');
      } finally {
        setLoading(false);
      }
    };

    fetchActiveCompany();
  }, [currentCompanyId]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-white transition-all shadow-sm active:scale-[0.98]"
      >
        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md">
          <Building2 className="h-4 w-4" />
        </div>
        <div className="text-left hidden md:block max-w-[120px] lg:max-w-[180px]">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-tight">Active Company</p>
          <p className="text-xs font-bold text-slate-900 leading-tight truncate">
            {loading ? 'Loading...' : (activeCompany?.name || 'Active Company')}
          </p>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-full left-0 mt-2 w-72 z-50 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 p-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-3 py-2 border-b border-slate-50 mb-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Entity</p>
            </div>
            
            <div className="max-h-64 overflow-y-auto space-y-1">
              <div className="w-full flex items-center gap-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100 transition-all group">
                <div className="h-10 w-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-bold truncate text-blue-700">
                    {activeCompany?.name || 'Loading...'}
                  </p>
                  {activeCompany?.gstin && (
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">GST: {activeCompany.gstin}</p>
                  )}
                </div>
                <Check className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            
            <div className="mt-2 pt-2 border-t border-slate-50 p-1">
              <Link 
                href="/dashboard/settings/organizations"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
              >
                <ArrowLeftRight className="h-3 w-3" />
                Manage Organizations
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
