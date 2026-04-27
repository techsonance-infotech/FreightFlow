import { LoginForm } from '@/components/auth/login-form';
import { AuthPanel } from '@/components/auth/auth-panel';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In — FreightFlow',
  description: 'Sign in to your FreightFlow account to manage your transport operations.',
};

export default function LoginPage() {
  return (
    <div className="w-full lg:grid lg:h-screen lg:grid-cols-2 bg-white overflow-hidden">
      {/* Left Panel — Branding */}
      <AuthPanel />

      {/* Right Panel — Login Form */}
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

          {/* Header */}
          <div className="flex flex-col gap-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back!</h1>
            <p className="text-slate-500 font-medium">
              Sign in to manage your transport operations
            </p>
          </div>

          {/* Login Form */}
          <div className="grid gap-6">
            <LoginForm />
          </div>

          {/* Sign up link */}
          <div className="text-center text-sm text-slate-500 font-medium">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#3B82F6] hover:text-[#2563EB] font-bold transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
