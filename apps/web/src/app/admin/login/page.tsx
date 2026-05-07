import React from 'react';
import Image from 'next/image';
import type { Metadata } from 'next';
import { AdminAuthPanel } from '@/components/admin/admin-auth-panel';
import { AdminLoginForm } from '@/components/admin/admin-login-form';

export const metadata: Metadata = {
  title: 'Admin Sign In — FreightFlow',
  description: 'Secure platform governance entry for FreightFlow Super Admins.',
};

export default function AdminLoginPage() {
  return (
    <div className="w-full lg:grid lg:h-screen lg:grid-cols-2 bg-white overflow-hidden">
      {/* Left Panel — Admin Branding */}
      <AdminAuthPanel />

      {/* Right Panel — Login Form */}
      <div className="flex items-center justify-center py-12 bg-white h-screen relative overflow-y-auto lg:overflow-hidden">
        {/* Subtle background decorative element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32" />
        
        <div className="mx-auto grid w-full max-w-[500px] gap-8 px-8 relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-6">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl border border-slate-100 p-2">
              <Image src="/favicon_io/android-chrome-512x512.png" alt="FreightFlow Logo" width={24} height={24} className="object-contain" />
            </div>
            <span className="text-xl font-bold text-[#0B1E3A]">FreightFlow</span>
          </div>

          {/* Header */}
          <div className="flex flex-col gap-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Access</h1>
            <p className="text-slate-500 font-medium">
              Secure Platform Governance Entry
            </p>
          </div>

          {/* Login Form */}
          <div className="grid gap-6">
            <AdminLoginForm />
          </div>

          {/* Footer Info */}
          <div className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] pt-4">
            Security Protocol v2.4 &bull; &copy; 2026 FreightFlow
          </div>
        </div>
      </div>
    </div>
  );
}
