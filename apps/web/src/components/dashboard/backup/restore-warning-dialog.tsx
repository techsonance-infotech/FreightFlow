'use client';

import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface RestoreWarningDialogProps {
  backupId: string;
  onClose: () => void;
  onConfirm: (backupId: string) => void;
}

export function RestoreWarningDialog({ backupId, onClose, onConfirm }: RestoreWarningDialogProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [typedConfirm, setTypedConfirm] = useState('');

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmed && typedConfirm.toLowerCase() === 'restore') {
      onConfirm(backupId);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-rose-50/50 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
            <span className="font-black text-rose-950 text-sm tracking-tight">Critical Restoration Warning</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-rose-100/50 rounded-lg text-rose-500 hover:text-rose-700 transition-colors"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleConfirm} className="p-6 space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-black text-slate-800 uppercase tracking-wider">Restoring Overwrites Active Data</p>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Performing a database restoration will revert all configurations, transactions, records, and client files to the state they were in when this snapshot was created. 
            </p>
            <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-xl space-y-1.5">
              <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider flex items-center gap-1">
                🛡️ Rollback Snapshot Enabled
              </span>
              <p className="text-[11px] text-amber-700 font-bold leading-normal">
                FreightFlow will automatically generate a fallback snapshot right before restoring, allowing rollbacks if needed.
              </p>
            </div>
          </div>

          {/* Checks and fields */}
          <div className="space-y-4 pt-2">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <span className="text-xs text-slate-600 font-bold leading-normal">
                I understand this operation is destructive and will replace current database states.
              </span>
            </label>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                Type <span className="text-rose-500">"RESTORE"</span> to confirm
              </label>
              <input
                type="text"
                value={typedConfirm}
                onChange={(e) => setTypedConfirm(e.target.value)}
                placeholder="RESTORE"
                className="w-full h-11 px-4 bg-slate-50 border border-slate-150 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* Action trigger */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!confirmed || typedConfirm.toLowerCase() !== 'restore'}
              className="flex-1 py-3 bg-rose-650 hover:bg-rose-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-100 transition-all"
            >
              Start Restore
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
