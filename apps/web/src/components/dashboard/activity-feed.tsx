'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Package, Truck, IndianRupee, AlertCircle, 
  CheckCircle2, UserPlus, FileText, Info, Activity
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityFeedProps {
  data?: any[];
}

const TYPE_CONFIG: any = {
  order: { icon: <Package className="h-3 w-3" />, color: 'text-blue-600', bg: 'bg-blue-50' },
  trip: { icon: <Truck className="h-3 w-3" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  finance: { icon: <IndianRupee className="h-3 w-3" />, color: 'text-amber-600', bg: 'bg-amber-50' },
  system: { icon: <Info className="h-3 w-3" />, color: 'text-slate-600', bg: 'bg-slate-50' },
  default: { icon: <Activity className="h-3 w-3" />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
};

export function ActivityFeed({ data = [] }: ActivityFeedProps) {
  const activities = data.slice(0, 5); // Show last 5
  
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent Activity</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Live Operations Log</p>
        </div>
      </div>
      
      <div className="p-2 space-y-1">
        {activities.length > 0 ? activities.map((activity, idx) => {
          const type = (activity.action?.toLowerCase().includes('order') || activity.action?.toLowerCase().includes('lr')) ? 'order' : 
                       (activity.action?.toLowerCase().includes('trip') || activity.action?.toLowerCase().includes('mission')) ? 'trip' : 
                       (activity.action?.toLowerCase().includes('payment') || activity.action?.toLowerCase().includes('revenue')) ? 'finance' : 'default';
          const config = TYPE_CONFIG[type];
          
          return (
            <div key={activity.id} className="group relative flex gap-4 p-4 rounded-2xl hover:bg-slate-50/80 transition-all duration-300">
              {idx !== activities.length - 1 && (
                <div className="absolute left-7 top-12 bottom-0 w-0.5 bg-slate-100 group-hover:bg-slate-200 transition-colors" />
              )}
              
              <div className={cn(
                "relative z-10 h-6 w-6 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                config.bg,
                config.color
              )}>
                {config.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-black text-slate-800 truncate">{activity.action}</p>
                  <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap uppercase">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold text-slate-500">{activity.user}</span>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="py-10 text-center">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No Recent Operations</p>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-slate-50/30 border-t border-slate-50">
        <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
           Live Transaction Stream
        </p>
      </div>
    </div>
  );
}
