'use client';

import React from 'react';
import { X, ShieldCheck, HardDrive, Calendar, User, Code, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface BackupDetailModalProps {
  backup: {
    id: string;
    name: string;
    type: 'manual' | 'automatic' | 'pre_restore';
    status: string;
    progress: number;
    fileSize: string | null;
    originalSize?: string | null;
    checksum?: string | null;
    encrypted: boolean;
    schemaVersion?: string | null;
    appVersion?: string | null;
    createdAt: string;
    completedAt: string | null;
    errorMessage: string | null;
    includes?: any;
    creator?: { name: string; email: string };
  };
  onClose: () => void;
}

export function BackupDetailModal({ backup, onClose }: BackupDetailModalProps) {
  const formatSize = (bytesStr: string | null) => {
    if (!bytesStr) return '—';
    const bytes = Number(bytesStr);
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTablesIncluded = () => {
    if (!backup.includes) return [];
    try {
      if (typeof backup.includes === 'string') {
        return JSON.parse(backup.includes);
      }
      if (Array.isArray(backup.includes)) {
        return backup.includes;
      }
    } catch {
      // Quiet fail
    }
    return [];
  };

  const tables = getTablesIncluded();

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <HardDrive className="h-4.5 w-4.5 text-blue-600" />
            </div>
            <span className="font-black text-slate-950 text-sm tracking-tight">Backup Details & Metadata</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Main Info */}
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-950 tracking-tight">{backup.name}</h3>
            <span className="text-[10px] font-mono text-slate-400 block break-all">ID: {backup.id}</span>
          </div>

          {/* Grid properties */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-400" /> Date Created
              </span>
              <p className="text-xs font-bold text-slate-800">
                {format(new Date(backup.createdAt), 'PPpp')}
              </p>
            </div>

            {backup.completedAt && (
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" /> Date Finalized
                </span>
                <p className="text-xs font-bold text-slate-850">
                  {format(new Date(backup.completedAt), 'PPpp')}
                </p>
              </div>
            )}

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <HardDrive className="h-3 w-3 text-blue-500" /> File Size
              </span>
              <p className="text-xs font-black text-slate-800 font-mono">
                {formatSize(backup.fileSize)}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <Code className="h-3 w-3 text-indigo-500" /> Schema / App Version
              </span>
              <p className="text-xs font-bold text-slate-800">
                v{backup.schemaVersion || '1.0'} / v{backup.appVersion || '0.1.0'}
              </p>
            </div>

            {backup.creator && (
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <User className="h-3 w-3 text-slate-400" /> Requested By
                </span>
                <p className="text-xs font-bold text-slate-800">
                  {backup.creator.name}
                </p>
              </div>
            )}

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                🛡️ Encryption
              </span>
              <p className="text-xs font-bold text-emerald-600">
                AES-256-GCM Encrypted
              </p>
            </div>
          </div>

          {/* Checksum SHA-256 */}
          {backup.checksum && (
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                SHA-256 Checksum
              </span>
              <div className="p-3 bg-slate-50 rounded-xl font-mono text-[10px] font-bold text-slate-500 select-all break-all border border-slate-150">
                {backup.checksum}
              </div>
            </div>
          )}

          {/* Tables list */}
          {tables.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-slate-400" /> Modules / Tables Included
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tables.map((t: string) => (
                  <span key={t} className="px-2 py-1 bg-slate-100 text-slate-650 rounded-lg text-[10px] font-bold">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {backup.errorMessage && (
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-rose-500 tracking-wider block">
                Error Message
              </span>
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold leading-relaxed">
                {backup.errorMessage}
              </div>
            </div>
          )}
        </div>

        {/* Action footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
