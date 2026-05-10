'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// This is a Client Component that handles the dynamic import with ssr: false
// This is perfectly valid as long as this file itself is a Client Component
export const DashboardChartsLazy = dynamic(
  () => import('./dashboard-charts').then(mod => mod.DashboardCharts),
  { 
    ssr: false,
    loading: () => <Skeleton className="h-[450px] w-full rounded-3xl" />
  }
);
