'use client';

import { useState, useEffect } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { login } from '@/app/actions/auth';
import { resendVerification } from '@/app/actions/auth';
import { Eye, EyeOff, Loader2, Send } from 'lucide-react';

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
          Signing in…
        </>
      ) : (
        'Sign In'
      )}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(login, null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [resendStatus, setResendStatus] = useState<{ loading: boolean; message?: string; error?: string }>({ loading: false });

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 1;
  const isFormValid = isEmailValid && isPasswordValid;

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleResend = async () => {
    if (!state?.email) return;
    setResendStatus({ loading: true });
    const result = await resendVerification(state.email);
    if (result.success) {
      setResendStatus({ loading: false, message: result.message });
    } else {
      setResendStatus({ loading: false, error: result.error });
    }
  };

  const getInputClass = (isValid: boolean, field: string, value: string) => {
    const base =
      'w-full h-11 px-4 bg-[#F9FAFB] border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-300 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10';
    if (!touched[field] || value === '') return `${base} border-[#E5E7EB] focus:border-[#3B82F6]`;
    return isValid
      ? `${base} border-emerald-500/30 focus:border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.05)]`
      : `${base} border-rose-500/30 focus:border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.05)]`;
  };

  return (
    <form action={formAction} className="grid gap-5">
      {/* Email Field */}
      <div className="grid gap-1.5">
        <label htmlFor="login-email" className="text-[13px] font-bold text-slate-700 ml-1">
          Email Address <span className="text-rose-500">*</span>
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          placeholder="you@company.com"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => handleBlur('email')}
          className={getInputClass(isEmailValid, 'email', email)}
        />
        {touched.email && email && !isEmailValid && (
          <p className="text-[10px] text-rose-500 ml-1">Please enter a valid email address</p>
        )}
      </div>

      {/* Password Field */}
      <div className="grid gap-1.5">
        <label htmlFor="login-password" className="text-[13px] font-bold text-slate-700 ml-1">
          Password <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <input
            id="login-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => handleBlur('password')}
            className={`${getInputClass(isPasswordValid, 'password', password)} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        <div className="flex justify-end pr-1">
          <a href="/forgot-password" virtual-link="true" className="text-xs text-[#3B82F6] hover:text-[#2563EB] font-bold transition-colors">
            Forgot password?
          </a>
        </div>
      </div>

      {/* Remember Me */}
      <div className="flex items-center gap-2 ml-1 mt-1">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            id="remember-me"
            name="remember_me"
            className="h-4 w-4 rounded-md border-[#E5E7EB] text-[#3B82F6] focus:ring-[#3B82F6] cursor-pointer transition-all duration-200"
          />
        </div>
        <label htmlFor="remember-me" className="text-sm font-medium text-slate-500 cursor-pointer select-none">
          Remember me
        </label>
      </div>

      {/* Error Message & Resend Button */}
      {state?.error && (
        <div className={`grid gap-3 p-4 rounded-xl animate-in slide-in-from-top-2 duration-300 ${state.isUnverified ? 'bg-amber-50 border border-amber-200' : 'bg-rose-50 border border-rose-500/20'}`}>
          <div className="flex items-start gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-[10px] mt-0.5 ${state.isUnverified ? 'bg-amber-500' : 'bg-rose-500'}`}>!</div>
            <div className="flex-1">
              <p className={`text-[13px] font-medium leading-relaxed ${state.isUnverified ? 'text-amber-800' : 'text-rose-700'}`}>
                {state.error}
              </p>
              {state.isUnverified && !resendStatus.message && (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendStatus.loading}
                  className="mt-3 flex items-center gap-2 text-xs font-bold text-amber-900 bg-white/50 hover:bg-white border border-amber-200 px-3 py-2 rounded-lg transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {resendStatus.loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                  {resendStatus.loading ? 'Sending link...' : 'Resend Verification link'}
                </button>
              )}
              {resendStatus.message && (
                <p className="mt-2 text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-in fade-in duration-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {resendStatus.message}
                </p>
              )}
              {resendStatus.error && (
                <p className="mt-2 text-xs font-bold text-rose-600 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  {resendStatus.error}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <SubmitButton disabled={!isFormValid} />
    </form>
  );
}
