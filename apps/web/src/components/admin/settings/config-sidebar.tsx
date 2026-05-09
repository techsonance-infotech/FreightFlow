'use client';

import React from 'react';
import { 
  Globe, CreditCard, Shield, 
  Bell, Database, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfigSidebarProps {
  activeSector: string;
  onSectorChange: (sector: string) => void;
}

export function ConfigSidebar({ activeSector, onSectorChange }: ConfigSidebarProps) {
  const sectors = [
    { id: 'branding', label: 'General Branding', icon: <Globe className="h-5 w-5" /> },
    { id: 'billing', label: 'SaaS Billing Matrix', icon: <CreditCard className="h-5 w-5" /> },
    { id: 'security', label: 'Security Protocols', icon: <Shield className="h-5 w-5" /> },
    { id: 'notifications', label: 'System Notifications', icon: <Bell className="h-5 w-5" /> },
    { id: 'infra', label: 'Infrastructure Nodes', icon: <Database className="h-5 w-5" /> },
  ];

  return (
    <div className="space-y-4">
      {sectors.map((sector) => (
        <button
          key={sector.id}
          onClick={() => onSectorChange(sector.id)}
          className={cn(
            "w-full h-20 flex items-center gap-6 px-10 rounded-[1.5rem] transition-all duration-500 group relative overflow-hidden",
            activeSector === sector.id 
              ? "bg-blue-600 text-white shadow-2xl shadow-blue-200" 
              : "bg-white border border-slate-100 text-slate-400 hover:border-blue-600 hover:text-blue-600 shadow-sm"
          )}
        >
          {activeSector === sector.id && (
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 animate-pulse" />
          )}
          
          <div className={cn(
            "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500",
            activeSector === sector.id 
              ? "bg-white/20 backdrop-blur-md rotate-3" 
              : "bg-slate-50 group-hover:bg-blue-50 group-hover:-rotate-6"
          )}>
            {sector.icon}
          </div>
          
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{sector.label}</span>
            {activeSector === sector.id && (
              <span className="text-[8px] font-black text-blue-200 uppercase tracking-widest mt-1 flex items-center gap-2">
                <Zap className="h-2 w-2 fill-blue-200" />
                Active Protocol
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
