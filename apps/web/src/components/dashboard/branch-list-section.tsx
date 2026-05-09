'use client';

import React, { useState } from 'react';
import { Building2, Plus, Store } from 'lucide-react';
import { BranchModal } from './branch-modal';

interface BranchListSectionProps {
  branches: any[];
}

export function BranchListSection({ branches }: BranchListSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);

  return (
    <aside className="p-8 lg:p-12 space-y-12 bg-slate-50/30 min-h-screen">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Branches</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Multi-location Control</p>
          </div>
          <button 
            onClick={() => {
              setSelectedBranch(null);
              setModalOpen(true);
            }}
            className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-lg shadow-blue-100"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {branches.map((branch, index) => (
            <div key={branch.id} className="group relative p-5 rounded-[2rem] bg-white border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                  <Store className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate tracking-tight">{branch.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
                    {index === 0 ? 'Main Headquarters' : 'Operational Branch'}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Active Node</span>
                <button 
                  onClick={() => {
                    setSelectedBranch(branch);
                    setModalOpen(true);
                  }}
                  className="text-[9px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700"
                >
                  Configure
                </button>
              </div>
            </div>
          ))}
        </div>

        {branches.length === 0 && (
          <div className="p-10 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
              <Building2 className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold text-slate-400 leading-relaxed">No additional branches configured yet.</p>
          </div>
        )}
      </div>

      {modalOpen && (
        <BranchModal 
          branch={selectedBranch} 
          onClose={() => setModalOpen(false)} 
        />
      )}
    </aside>
  );
}
