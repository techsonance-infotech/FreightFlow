'use client';

import React from 'react';
import { AlertTriangle, Clock, Zap } from 'lucide-react';
import Link from 'next/link';

interface TrialBannerProps {
  daysRemaining: number;
  plan: string;
}

export function TrialBanner({ daysRemaining, plan }: TrialBannerProps) {
  const isTrial = plan === 'trial';
  
  if (daysRemaining > 14 && !isTrial) return null; // Don't show if more than 14 days on paid plan

  const isUrgent = daysRemaining <= 3;
  
  return (
    <div className={`w-full py-2.5 px-4 text-center sm:px-6 lg:px-8 border-b z-50 relative ${
      isUrgent 
        ? 'bg-gradient-to-r from-red-500 via-rose-500 to-red-600 text-white border-red-600' 
        : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white border-amber-600'
    }`}>
      <div className="flex items-center justify-center gap-x-4">
        <div className="flex items-center gap-2">
          {isUrgent ? (
            <AlertTriangle className="h-5 w-5 animate-pulse" />
          ) : (
            <Clock className="h-5 w-5" />
          )}
          <p className="text-sm font-semibold leading-6">
            {isTrial ? (
              <>Your 7-day trial expires in <span className="font-black text-lg mx-1">{daysRemaining}</span> {daysRemaining === 1 ? 'day' : 'days'}.</>
            ) : (
              <>Your {plan} license expires in <span className="font-black text-lg mx-1">{daysRemaining}</span> {daysRemaining === 1 ? 'day' : 'days'}.</>
            )}
          </p>
        </div>
        <Link 
          href="/dashboard/support" 
          className="flex-none rounded-full bg-white/10 px-3.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors flex items-center gap-1.5"
        >
          <Zap className="h-3.5 w-3.5" />
          Upgrade Now <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
