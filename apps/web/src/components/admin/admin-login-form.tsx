'use client';

import { useState } from 'react';
import { adminLogin } from '@/app/actions/admin/auth';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';

export function AdminLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 1;
  const isFormValid = isEmailValid && isPasswordValid;

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setIsLoading(true);
    try {
      const res = await adminLogin(email, password);
      if (res.success) {
        toast.success('Admin access granted');
        window.location.href = '/admin/dashboard';
      } else {
        toast.error(res.error || 'Invalid admin credentials');
      }
    } catch (err) {
      toast.error('System authentication failure');
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClass = (isValid: boolean, field: string, value: string) => {
    const base =
      'w-full h-12 px-4 bg-[#F9FAFB] border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-300 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10';
    if (!touched[field] || value === '') return `${base} border-[#E5E7EB] focus:border-[#3B82F6]`;
    return isValid
      ? `${base} border-emerald-500/30 focus:border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.05)]`
      : `${base} border-rose-500/30 focus:border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.05)]`;
  };

  return (
    <form onSubmit={handleLogin} className="grid gap-6">
      {/* Email Field */}
      <div className="grid gap-2">
        <label htmlFor="login-email" className="text-[13px] font-bold text-slate-700 ml-1">
          Admin Identifier <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <input
            id="login-email"
            name="email"
            type="email"
            placeholder="admin@freightflow.com"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => handleBlur('email')}
            className={`${getInputClass(isEmailValid, 'email', email)} pr-4`}
          />
        </div>
        {touched.email && email && !isEmailValid && (
          <p className="text-[10px] text-rose-500 ml-1">Please enter a valid email address</p>
        )}
      </div>

      {/* Password Field */}
      <div className="grid gap-2">
        <label htmlFor="login-password" className="text-[13px] font-bold text-slate-700 ml-1">
          Governance Key <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <input
            id="login-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••••••"
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

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !isFormValid}
        className="w-full h-14 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:from-[#2563EB] hover:to-[#1D4ED8] text-white text-sm font-bold rounded-xl shadow-[0_10px_20px_-10px_rgba(37,99,235,0.4)] hover:shadow-[0_15px_25px_-10px_rgba(37,99,235,0.5)] transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Authenticating...
          </>
        ) : (
          'Verify Credentials'
        )}
      </button>
    </form>
  );
}
