import React from 'react';

export default function AuthLoading() {
  return (
    <div className="w-full max-w-md space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-3">
        <div className="h-10 w-48 bg-neutral-100 rounded-lg animate-pulse mx-auto" />
        <div className="h-4 w-64 bg-neutral-50 rounded animate-pulse mx-auto" />
      </div>
      
      <div className="bg-white p-8 rounded-2xl border border-neutral-100 shadow-sm space-y-6">
        <div className="space-y-2">
          <div className="h-4 w-20 bg-neutral-100 rounded animate-pulse" />
          <div className="h-11 w-full bg-neutral-50 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-20 bg-neutral-100 rounded animate-pulse" />
          <div className="h-11 w-full bg-neutral-50 rounded-lg animate-pulse" />
        </div>
        <div className="h-11 w-full bg-neutral-100 rounded-lg animate-pulse" />
        
        <div className="flex justify-center">
          <div className="h-4 w-40 bg-neutral-50 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
