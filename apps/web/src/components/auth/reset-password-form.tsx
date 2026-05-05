'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { resetPassword } from '@/app/actions/auth';
import { Loader2, KeyRound, ArrowLeft, CheckCircle2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="w-full h-12 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-white text-sm font-bold rounded-xl shadow-[0_10px_20px_-10px_rgba(37,99,235,0.4)] hover:shadow-[0_15px_25px_-10px_rgba(37,99,235,0.5)] transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Resetting Password…
        </>
      ) : (
        <>
          <ShieldCheck className="h-4 w-4" />
          Reset Password
        </>
      )}
    </button>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsPending(true);
    const formData = new FormData();
    formData.append('email', email);
    formData.append('otp', otp);
    formData.append('password', password);

    const result = await resetPassword(formData);
    setIsPending(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="text-center py-10 px-6 bg-emerald-50/50 border border-emerald-500/10 rounded-2xl animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20">
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-3">Password Reset!</h3>
        <p className="text-slate-600 font-medium max-w-sm mx-auto leading-relaxed mb-8">
          Your password has been successfully updated. You can now log in with your new credentials.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#3B82F6] hover:text-[#2563EB] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
      <div className="flex flex-col gap-2 text-center lg:text-left mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Set New Password</h1>
        <p className="text-slate-500 font-medium">
          Enter the 6-digit OTP sent to {email} and your new password.
        </p>
      </div>

      <form onSubmit={handleReset} className="grid gap-5">
        <div className="grid gap-1.5">
          <label className="text-[13px] font-bold text-slate-700 ml-1">
            OTP Code <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="123456"
            maxLength={6}
            required
            autoFocus
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            className="w-full h-11 px-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-center text-xl font-bold tracking-[8px] text-slate-900 placeholder:text-slate-300 transition-all duration-300 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6]"
          />
        </div>

        <div className="grid gap-1.5 relative">
          <label className="text-[13px] font-bold text-slate-700 ml-1">
            New Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-300 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="grid gap-1.5">
          <label className="text-[13px] font-bold text-slate-700 ml-1">
            Confirm Password <span className="text-rose-500">*</span>
          </label>
          <input
            type="password"
            placeholder="••••••••"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full h-11 px-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-300 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-[#3B82F6]"
          />
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-500/20 text-rose-700 text-[13px] px-4 py-3 rounded-xl animate-in slide-in-from-top-1 duration-200">
            <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-[10px]">!</div>
            {error}
          </div>
        )}

        <div className="mt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full h-12 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-white text-sm font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {isPending ? 'Updating…' : 'Reset Password'}
          </button>
        </div>

        <Link
          href="/forgot-password"
          className="flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Request New OTP
        </Link>
      </form>
    </div>
  );
}
