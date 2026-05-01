'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Plus, Truck, FileText, IndianRupee, Users, Settings, 
  ArrowRight, CreditCard, ClipboardList 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ACTIONS = [
  {
    title: 'Create LR',
    desc: 'New Lorry Receipt',
    icon: <FileText className="h-5 w-5" />,
    href: '/dashboard/orders/new',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100 hover:border-blue-200',
  },
  {
    title: 'Start Trip',
    desc: 'Dispatch Vehicle',
    icon: <Truck className="h-5 w-5" />,
    href: '/dashboard/trips/new',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100 hover:border-emerald-200',
  },
  {
    title: 'Add Fuel',
    desc: 'Record fuel expense',
    icon: <IndianRupee className="h-5 w-5" />,
    href: '/dashboard/fuel',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100 hover:border-amber-200',
  },
  {
    title: 'New Master',
    desc: 'Vehicle, Driver, Dealer',
    icon: <Plus className="h-5 w-5" />,
    href: '/dashboard/masters',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-100 hover:border-purple-200',
  },
];

export function ActionCommandCenter() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {ACTIONS.map((action) => (
        <Link
          key={action.title}
          href={action.href}
          className={cn(
            "group relative flex flex-col p-4 rounded-2xl bg-white border transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
            action.border
          )}
        >
          <div className="flex items-start justify-between mb-3">
            <div className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
              action.bg,
              action.color
            )}>
              {action.icon}
            </div>
            <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
          </div>
          
          <h4 className="text-sm font-black text-slate-900">{action.title}</h4>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{action.desc}</p>
          
          {/* Decorative Background Icon */}
          <div className="absolute right-2 bottom-2 opacity-[0.03] scale-150 transition-transform duration-500 group-hover:scale-[2] group-hover:rotate-12">
            {action.icon}
          </div>
        </Link>
      ))}
    </div>
  );
}
