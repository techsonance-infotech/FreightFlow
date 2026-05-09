'use client';

import React from 'react';
import { 
  ArrowRight, FileJson, 
  Database, Zap, 
  History, ShieldAlert 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function DeltaViewer({ payload }: { payload: any }) {
  if (!payload) return (
    <div className="p-12 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
      <FileJson className="h-10 w-10 text-slate-300 mx-auto mb-4" />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No differential payload attached</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {Object.entries(payload).map(([key, value]: [string, any]) => {
        const isObject = typeof value === 'object' && value !== null;
        
        return (
          <div key={key} className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 group hover:bg-white hover:border-blue-200 transition-all duration-500 shadow-inner hover:shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Database className="h-4 w-4" />
                </div>
                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900 transition-colors">{key.replace(/_/g, ' ')}</h5>
              </div>
              <Zap className="h-3 w-3 text-amber-500 fill-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {isObject ? (
              <pre className="bg-white/50 p-4 rounded-xl text-[11px] font-mono text-slate-600 overflow-x-auto border border-slate-100">
                {JSON.stringify(value, null, 2)}
              </pre>
            ) : (
              <div className="flex items-center gap-4">
                <p className="text-sm font-black text-slate-900 tracking-tight break-all">
                  {String(value)}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
