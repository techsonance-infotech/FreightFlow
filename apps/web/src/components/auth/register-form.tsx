'use client';

import { useState, useEffect } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { register } from '@/app/actions/auth';
import { Check, X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
          Creating Account…
        </>
      ) : (
        'Create Account'
      )}
    </button>
  );
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${met ? 'text-emerald-500' : 'text-slate-400'}`}>
      {met ? <Check className="h-3 w-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
      <span>{text}</span>
    </div>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(register, null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validation
  const isFirstNameValid = firstName.trim().length >= 2;
  const isLastNameValid = lastName.trim().length >= 2;
  const isUsernameValid = /^[a-zA-Z0-9_]{3,20}$/.test(username);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneValid = /^\d{10}$/.test(phone);

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isPasswordStrong = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
  const passwordsMatch = password === confirmPassword && confirmPassword !== '';

  const isFormValid = isFirstNameValid && isLastNameValid && isUsernameValid && isEmailValid && isPhoneValid && isPasswordStrong && passwordsMatch;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
    setPhone(value);
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const getInputClass = (isValid: boolean, field: string, value: string) => {
    const base =
      'w-full h-11 px-4 bg-[#F9FAFB] border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-300 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10';
    if (!touched[field] || value === '') return `${base} border-[#E5E7EB] focus:border-[#3B82F6]`;
    return isValid
      ? `${base} border-emerald-500/30 focus:border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.05)]`
      : `${base} border-rose-500/30 focus:border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.05)]`;
  };

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => router.push('/login'), 3000);
      return () => clearTimeout(timer);
    }
  }, [state, router]);

  // Show success state
  if (state?.success) {
    return (
      <div className="text-center py-12 px-6 bg-emerald-50/50 border border-emerald-500/10 rounded-2xl animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20">
          <Check className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-3">Verification Email Sent!</h3>
        <p className="text-slate-600 font-medium max-w-sm mx-auto leading-relaxed mb-8">
          We've sent a verification link to <span className="text-emerald-600 font-bold">{email}</span>. Please check your inbox and click the link to activate your account.
        </p>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs font-bold uppercase tracking-widest">Waiting for verification…</span>
          </div>
          <Link
            href="/login"
            className="text-sm font-bold text-[#3B82F6] hover:text-[#2563EB] transition-colors"
          >
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
      {/* First Name */}
      <div className="grid gap-1.5">
        <label htmlFor="reg-firstName" className="text-[13px] font-bold text-slate-700 ml-1">
          First Name <span className="text-rose-500">*</span>
        </label>
        <input
          id="reg-firstName"
          name="firstName"
          type="text"
          placeholder="John"
          required
          autoFocus
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          onBlur={() => handleBlur('firstName')}
          className={getInputClass(isFirstNameValid, 'firstName', firstName)}
        />
      </div>

      {/* Last Name */}
      <div className="grid gap-1.5">
        <label htmlFor="reg-lastName" className="text-[13px] font-bold text-slate-700 ml-1">
          Last Name <span className="text-rose-500">*</span>
        </label>
        <input
          id="reg-lastName"
          name="lastName"
          type="text"
          placeholder="Doe"
          required
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          onBlur={() => handleBlur('lastName')}
          className={getInputClass(isLastNameValid, 'lastName', lastName)}
        />
      </div>

      {/* Username */}
      <div className="grid gap-1.5">
        <label htmlFor="reg-username" className="text-[13px] font-bold text-slate-700 ml-1">
          Username <span className="text-rose-500">*</span>
        </label>
        <input
          id="reg-username"
          name="username"
          type="text"
          placeholder="john_doe"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onBlur={() => handleBlur('username')}
          className={getInputClass(isUsernameValid, 'username', username)}
        />
        {touched.username && username && !isUsernameValid && (
          <p className="text-[10px] text-rose-500 ml-1">Min 3 chars, letters/numbers/_</p>
        )}
      </div>

      {/* Phone */}
      <div className="grid gap-1.5">
        <label htmlFor="reg-phone" className="text-[13px] font-bold text-slate-700 ml-1">
          Phone <span className="text-rose-500">*</span>
        </label>
        <input
          id="reg-phone"
          name="phone"
          type="tel"
          placeholder="10-digit mobile"
          required
          value={phone}
          onChange={handlePhoneChange}
          onBlur={() => handleBlur('phone')}
          className={getInputClass(isPhoneValid, 'phone', phone)}
        />
        {touched.phone && phone && !isPhoneValid && (
          <p className="text-[10px] text-rose-500 ml-1">Exactly 10 digits required</p>
        )}
      </div>

      {/* Email */}
      <div className="grid gap-1.5 md:col-span-2">
        <label htmlFor="reg-email" className="text-[13px] font-bold text-slate-700 ml-1">
          Email Address <span className="text-rose-500">*</span>
        </label>
        <input
          id="reg-email"
          name="email"
          type="email"
          placeholder="you@company.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => handleBlur('email')}
          className={getInputClass(isEmailValid, 'email', email)}
        />
        {touched.email && email && !isEmailValid && (
          <p className="text-[10px] text-rose-500 ml-1">Please enter a valid email</p>
        )}
      </div>

      {/* Password */}
      <div className="grid gap-1.5">
        <label htmlFor="reg-password" className="text-[13px] font-bold text-slate-700 ml-1">
          Password <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <input
            id="reg-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min. 8 characters"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => handleBlur('password')}
            className={`${getInputClass(isPasswordStrong, 'password', password)} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {password && !isPasswordStrong && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 ml-1">
            <PasswordRequirement met={hasMinLength} text="8+ chars" />
            <PasswordRequirement met={hasUppercase} text="Upper" />
            <PasswordRequirement met={hasLowercase} text="Lower" />
            <PasswordRequirement met={hasNumber} text="Num" />
            <PasswordRequirement met={hasSpecial} text="Sym" />
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div className="grid gap-1.5">
        <label htmlFor="reg-confirmPassword" className="text-[13px] font-bold text-slate-700 ml-1">
          Confirm <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <input
            id="reg-confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Repeat password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => handleBlur('confirmPassword')}
            className={`${getInputClass(passwordsMatch, 'confirmPassword', confirmPassword)} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {touched.confirmPassword && confirmPassword && !passwordsMatch && (
          <p className="text-[10px] text-rose-500 ml-1">Doesn't match</p>
        )}
      </div>

      {/* Error Message */}
      {state?.error && (
        <div className="md:col-span-2 flex items-center gap-3 bg-rose-50 border border-rose-500/20 text-rose-700 text-[13px] px-4 py-3 rounded-xl animate-in slide-in-from-top-1 duration-200">
          <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-[10px]">!</div>
          {state.error}
        </div>
      )}

      {/* Submit Button */}
      <div className="md:col-span-2 mt-2">
        <SubmitButton disabled={!isFormValid} />
      </div>
    </form>
  );
}
