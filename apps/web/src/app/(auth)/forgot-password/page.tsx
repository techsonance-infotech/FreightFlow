import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { AuthPanel } from '@/components/auth/auth-panel';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password — FreightFlow',
  description: 'Reset your FreightFlow account password.',
};

export default function ForgotPasswordPage() {
  return (
    <div className="w-full lg:grid lg:h-screen lg:grid-cols-2 bg-white overflow-hidden">
      {/* Left Panel — Branding */}
      <AuthPanel />

      {/* Right Panel — Forgot Password Form */}
      <div className="flex items-center justify-center py-12 bg-white h-screen relative overflow-y-auto lg:overflow-hidden">
        {/* Subtle background decorative element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32" />

        <div className="mx-auto grid w-full max-w-[500px] gap-8 px-8 relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-6">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl border border-slate-100 p-2">
              <Image src="/logo.png" alt="FreightFlow Logo" width={24} height={24} className="object-contain" />
            </div>
            <span className="text-xl font-bold text-[#0B1E3A]">FreightFlow</span>
          </div>

          {/* Forgot Password Form */}
          <ForgotPasswordForm />


        </div>
      </div>
    </div>
  );
}
