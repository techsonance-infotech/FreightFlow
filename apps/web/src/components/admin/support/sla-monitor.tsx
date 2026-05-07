'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SlaMonitor({ request }: { request: any }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculateSLA = () => {
      const createdAt = new Date(request.createdAt).getTime();
      // Tier-based SLA (Enterprise: 2h, Pro: 6h, Starter: 24h)
      const slaMap: any = { enterprise: 2, pro: 6, starter: 24 };
      const slaHours = slaMap[request.planType] || 24;
      const slaTarget = createdAt + (slaHours * 60 * 60 * 1000);
      
      const now = new Date().getTime();
      const diff = slaTarget - now;

      if (diff <= 0) {
        setTimeLeft('SLA EXCEEDED');
        setIsUrgent(true);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours < 1) setIsUrgent(true);
      setTimeLeft(`${hours}h ${mins}m`);
    };

    calculateSLA();
    const timer = setInterval(calculateSLA, 60000);
    return () => clearInterval(timer);
  }, [request]);

  return (
    <div className={cn(
      "p-6 rounded-3xl border transition-all duration-500",
      isUrgent ? "bg-rose-50 border-rose-100 shadow-rose-100/50" : "bg-slate-50 border-slate-100"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className={cn("h-4 w-4", isUrgent ? "text-rose-500" : "text-slate-400")} />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Service Latency</span>
        </div>
        <div className={cn(
          "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
          isUrgent ? "bg-rose-500 text-white" : "bg-slate-900 text-white"
        )}>
          {request.planType} Tier
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className={cn(
            "text-3xl font-black tracking-tighter leading-none mb-1",
            isUrgent ? "text-rose-600" : "text-slate-900"
          )}>
            {timeLeft}
          </p>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Remaining to Resolve</p>
        </div>
        {isUrgent && <AlertTriangle className="h-8 w-8 text-rose-500 animate-pulse" />}
      </div>

      <div className="mt-6 flex items-center gap-2 overflow-hidden">
        <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-1000", isUrgent ? "bg-rose-500" : "bg-blue-600")}
            style={{ width: isUrgent ? '90%' : '30%' }}
          />
        </div>
      </div>
    </div>
  );
}
