'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Package, Truck, IndianRupee, AlertCircle, 
  CheckCircle2, UserPlus, FileText, Info
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'order' | 'trip' | 'finance' | 'system' | 'hr';
  action: string;
  user: string;
  timestamp: Date;
  metadata?: string;
}

const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: '1',
    type: 'order',
    action: 'New LR #10294 created',
    user: 'Deepak Sharma',
    timestamp: new Date(Date.now() - 15 * 60000), // 15 mins ago
    metadata: 'Dealer: Reliance Industries',
  },
  {
    id: '2',
    type: 'trip',
    action: 'Trip #TR-492 Started',
    user: 'Amit Singh',
    timestamp: new Date(Date.now() - 45 * 60000), // 45 mins ago
    metadata: 'Vehicle: UP-14-BT-1234',
  },
  {
    id: '3',
    type: 'finance',
    action: 'Payment received (₹42,500)',
    user: 'Accounting Dept',
    timestamp: new Date(Date.now() - 120 * 60000), // 2 hours ago
    metadata: 'Client: Tata Steel',
  },
  {
    id: '4',
    type: 'system',
    action: 'System Maintenance scheduled',
    user: 'FreightFlow Bot',
    timestamp: new Date(Date.now() - 300 * 60000), // 5 hours ago
  },
];

const TYPE_CONFIG = {
  order: { icon: <Package className="h-3 w-3" />, color: 'text-blue-600', bg: 'bg-blue-50' },
  trip: { icon: <Truck className="h-3 w-3" />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  finance: { icon: <IndianRupee className="h-3 w-3" />, color: 'text-amber-600', bg: 'bg-amber-50' },
  system: { icon: <Info className="h-3 w-3" />, color: 'text-slate-600', bg: 'bg-slate-50' },
  hr: { icon: <UserPlus className="h-3 w-3" />, color: 'text-purple-600', bg: 'bg-purple-50' },
};

export function ActivityFeed() {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent Activity</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Live Operations Log</p>
        </div>
        <button className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors">
          View All Feed →
        </button>
      </div>
      
      <div className="p-2 space-y-1">
        {MOCK_ACTIVITIES.map((activity, idx) => {
          const config = TYPE_CONFIG[activity.type];
          return (
            <div key={activity.id} className="group relative flex gap-4 p-4 rounded-2xl hover:bg-slate-50/80 transition-all duration-300">
              {/* Timeline Connector */}
              {idx !== MOCK_ACTIVITIES.length - 1 && (
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
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold text-slate-500">{activity.user}</span>
                  {activity.metadata && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] font-medium text-slate-400 italic truncate">{activity.metadata}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="p-4 bg-slate-50/30 border-t border-slate-50">
        <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
          Showing last 4 entries • Auto-updates enabled
        </p>
      </div>
    </div>
  );
}
