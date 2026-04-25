'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { forgotPassword, verifyOtp, resetPassword } from '@/app/actions/auth';
import { Loader2, Mail, Key, Lock, Check, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

type Step = 'REQUEST' | 'VERIFY' | 'RESET' | 'SUCCESS';

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('REQUEST');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'VERIFY' && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Step 1: Request OTP
  const handleRequestOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('email', email);
    
    const result = await forgotPassword(null, formData);
    setLoading(false);
    
    if (result.success) {
      setStep('VERIFY');
      setCountdown(60);
    } else {
      setError(result.error || 'Failed to send OTP.');
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const otpString = otp.join('');
    
    const result = await verifyOtp(email, otpString);
    setLoading(false);
    
    if (result.success) {
      setStep('RESET');
    } else {
      setError(result.error || 'Invalid OTP.');
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('email', email);
    formData.append('otp', otp.join(''));
    formData.append('password', password);
    
    const result = await resetPassword(formData);
    setLoading(false);
    
    if (result.success) {
      setStep('SUCCESS');
    } else {
      setError(result.error || 'Failed to reset password.');
    }
  };

  const renderStepper = () => {
    const steps: { key: Step; icon: any }[] = [
      { key: 'REQUEST', icon: Mail },
      { key: 'VERIFY', icon: Key },
      { key: 'RESET', icon: Lock },
    ];

    const isSuccess = step === 'SUCCESS';

    return (
      <div className="flex items-center justify-center mb-10 gap-2">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          const isCompleted = isSuccess || steps.findIndex((val) => val.key === step) > idx;
          const isActive = !isSuccess && s.key === step;

          return (
            <div key={s.key} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
                  isCompleted
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : isActive
                    ? 'bg-[#3B82F6] border-[#3B82F6] text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`w-10 h-0.5 mx-2 rounded-full transition-all duration-500 ${
                    isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          );
        })}
        {isSuccess && (
          <>
            <div className="w-10 h-0.5 mx-2 rounded-full bg-emerald-500" />
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white border-2 border-emerald-500">
              <Check className="h-5 w-5" />
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Back Button */}
      {step !== 'SUCCESS' && (
        <button
          onClick={() => {
            if (step === 'REQUEST') router.push('/login');
            if (step === 'VERIFY') setStep('REQUEST');
            if (step === 'RESET') setStep('VERIFY');
          }}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 text-sm font-semibold group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          {step === 'REQUEST' ? 'Back to Login' : 'Back'}
        </button>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          {step === 'REQUEST' && 'Forgot Password'}
          {step === 'VERIFY' && 'Verify OTP'}
          {step === 'RESET' && 'Reset Password'}
          {step === 'SUCCESS' && 'Success!'}
        </h1>
        <p className="text-slate-500 font-medium max-w-xs mx-auto">
          {step === 'REQUEST' && 'Enter your email to receive a password reset OTP'}
          {step === 'VERIFY' && `We sent a 6-digit OTP to ${email}`}
          {step === 'RESET' && 'Create a new secure password for your account'}
          {step === 'SUCCESS' && 'Your password has been reset successfully.'}
        </p>
      </div>

      {renderStepper()}

      {error && (
        <div className="bg-rose-50 border border-rose-500/20 text-rose-700 text-[13px] px-4 py-3 rounded-xl mb-6 flex items-center gap-3 animate-in shake duration-300">
          <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-[10px]">!</div>
          {error}
        </div>
      )}

      {step === 'REQUEST' && (
        <form onSubmit={handleRequestOtp} className="grid gap-6">
          <div className="grid gap-1.5">
            <label className="text-[13px] font-bold text-slate-700 ml-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              required
              className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !email}
            className="w-full h-12 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send OTP'}
          </button>
        </form>
      )}

      {step === 'VERIFY' && (
        <form onSubmit={handleVerifyOtp} className="grid gap-6">
          <div className="grid gap-4">
            <label className="text-[13px] font-bold text-slate-700 ml-1 text-center">Enter 6-digit OTP</label>
            <div className="flex justify-between gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { otpInputRefs.current[idx] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-11 h-12 text-center bg-white border border-slate-200 rounded-xl text-lg font-bold focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                />
              ))}
            </div>
            <p className="text-center text-xs text-slate-400">OTP expires in 10 minutes</p>
          </div>
          <button
            type="submit"
            disabled={loading || otp.some((d) => !d)}
            className="w-full h-12 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify OTP'}
          </button>
          <div className="text-center">
            {countdown > 0 ? (
              <p className="text-sm text-slate-500">Resend OTP in <span className="font-bold text-[#3B82F6]">{countdown}s</span></p>
            ) : (
              <button onClick={() => handleRequestOtp()} type="button" className="text-sm font-bold text-[#3B82F6] hover:text-[#2563EB]">Resend OTP</button>
            )}
          </div>
        </form>
      )}

      {step === 'RESET' && (
        <form onSubmit={handleResetPassword} className="grid gap-5">
          <div className="grid gap-1.5">
            <label className="text-[13px] font-bold text-slate-700 ml-1">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                className="w-full h-12 px-4 pr-12 bg-white border border-slate-200 rounded-xl text-sm focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div className="grid gap-1.5">
            <label className="text-[13px] font-bold text-slate-700 ml-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className="w-full h-12 px-4 pr-12 bg-white border border-slate-200 rounded-xl text-sm focus:border-[#3B82F6] focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !password || password !== confirmPassword}
            className="w-full h-12 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Reset Password'}
          </button>
        </form>
      )}

      {step === 'SUCCESS' && (
        <div className="text-center animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-emerald-500" />
          </div>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed max-w-xs mx-auto font-medium">
            Your password has been reset successfully. You can now login with your new password.
          </p>
          <Link
            href="/login"
            className="w-full h-12 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center mb-6"
          >
            Go to Login
          </Link>
        </div>
      )}

      {step !== 'SUCCESS' && (
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Remember your password?{' '}
            <Link href="/login" className="font-bold text-[#3B82F6] hover:text-[#2563EB] transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
