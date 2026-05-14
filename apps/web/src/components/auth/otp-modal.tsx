'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, X, Loader2, ArrowRight, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  title?: string;
  description?: string;
}

export function OtpModal({ 
  isOpen, 
  onClose, 
  onVerify, 
  onResend,
  title = "Verify Switch Request",
  description = "A verification code has been sent to your email. Enter the 6-digit code to authorize this change."
}: OtpModalProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRefs.current[0]?.focus(), 300);
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
    }
  }, [isOpen]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const code = otp.join('');
    if (code.length !== 6) return;

    setLoading(true);
    try {
      await onVerify(code);
    } catch (err) {
      // Error handled by parent toast
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setLoading(true);
    try {
      await onResend();
      setTimer(60);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-10 pt-10 pb-6 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-6 border border-blue-100">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{title}</h2>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            {description}
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="px-10 pb-6">
          <div className="flex justify-between gap-2 mb-8">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={el => { inputRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={e => handleChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                className="w-12 h-14 text-center text-2xl font-black bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
              />
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || otp.some(d => !d)}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
              <>
                Confirm Verification <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="px-10 py-6 bg-slate-50 border-t border-slate-100 text-center">
          <button
            onClick={handleResend}
            disabled={loading || timer > 0}
            className={cn(
              "text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 mx-auto",
              timer > 0 ? "text-slate-300" : "text-blue-600 hover:text-blue-700"
            )}
          >
            <RefreshCcw className={cn("h-3 w-3", loading && "animate-spin")} />
            {timer > 0 ? `Resend Code in ${timer}s` : "Resend Verification Code"}
          </button>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-50 text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
