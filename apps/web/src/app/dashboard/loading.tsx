import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-neutral-100 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-neutral-50 rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-neutral-100 rounded-lg animate-pulse" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 bg-white rounded-xl border border-neutral-100 shadow-sm space-y-3">
            <div className="h-4 w-24 bg-neutral-100 rounded animate-pulse" />
            <div className="h-8 w-32 bg-neutral-200 rounded animate-pulse" />
            <div className="h-3 w-20 bg-neutral-50 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Card Skeleton */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-100 shadow-sm p-6 space-y-4">
          <div className="flex justify-between">
            <div className="h-5 w-40 bg-neutral-100 rounded animate-pulse" />
            <div className="h-5 w-20 bg-neutral-50 rounded animate-pulse" />
          </div>
          <div className="h-64 w-full bg-neutral-50/50 rounded-lg animate-pulse" />
        </div>

        {/* Small Card Skeleton */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 space-y-4">
          <div className="h-5 w-40 bg-neutral-100 rounded animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3 items-center">
                <div className="w-8 h-8 bg-neutral-100 rounded-full animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-full bg-neutral-100 rounded animate-pulse" />
                  <div className="h-2 w-2/3 bg-neutral-50 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
