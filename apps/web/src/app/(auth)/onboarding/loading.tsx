import React from 'react';

export default function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-accent-50/30">
      {/* Top Bar Skeleton */}
      <div className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-100 rounded-full animate-pulse border border-neutral-200" />
            <div className="space-y-1.5">
              <div className="h-4 w-24 bg-neutral-100 rounded animate-pulse" />
              <div className="h-3 w-32 bg-neutral-50 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-3 w-32 bg-neutral-100 rounded animate-pulse" />
        </div>
      </div>

      {/* Wizard Container Skeleton */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-10 space-y-3">
          <div className="h-9 w-64 bg-neutral-100 rounded-lg animate-pulse mx-auto" />
          <div className="h-4 w-80 bg-neutral-50 rounded animate-pulse mx-auto" />
        </div>

        {/* Step Indicator Skeleton */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-10 w-40 bg-neutral-100 rounded-xl animate-pulse" />
          <div className="h-4 w-4 bg-neutral-200 rounded animate-pulse" />
          <div className="h-10 w-40 bg-neutral-100 rounded-xl animate-pulse" />
        </div>

        {/* Form Skeleton */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 space-y-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-neutral-50 rounded-xl animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 w-40 bg-neutral-100 rounded animate-pulse" />
              <div className="h-3 w-64 bg-neutral-50 rounded animate-pulse" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <div className="h-4 w-28 bg-neutral-100 rounded animate-pulse" />
              <div className="h-11 w-full bg-neutral-50 rounded-lg animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-28 bg-neutral-100 rounded animate-pulse" />
              <div className="h-11 w-full bg-neutral-50 rounded-lg animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-28 bg-neutral-100 rounded animate-pulse" />
              <div className="h-11 w-full bg-neutral-50 rounded-lg animate-pulse" />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <div className="h-11 w-40 bg-neutral-100 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
