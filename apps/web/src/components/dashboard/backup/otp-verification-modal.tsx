'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Loader2, X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface OtpVerificationModalProps {
  purpose: string;
  onClose: () => void;
  onVerified: (token: string) => void;
}

const OPERATION_LABELS: Record<string, string> = {
  BACKUP_CREATE: 'create a manual database backup',
  BACKUP_DELETE: 'permanently delete this backup',
  BACKUP_DOWNLOAD: 'generate a signed download link for this backup',
  BACKUP_RESTORE: 'restore the database from this snapshot',
  BACKUP_SCHEDULE_CHANGE: 'modify the automatic backup schedule settings',
};

export function OtpVerificationModal({ purpose, onClose, onVerified }: OtpVerificationModalProps) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Request OTP immediately on load
  const triggerSendOtp = async () => {
    setSending(true);
    try {
      const res = await fetch('/api/v1/backups/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose }),
      });
      const data = await res.json();
      if (data.success) {
        setVerificationId(data.verificationId);
        setCooldown(60); // 60 seconds resend cooldown
        toast.success('Verification code sent to your email.');
      } else {
        toast.error(data.error || 'Failed to send OTP code.');
      }
    } catch {
      toast.error('Network error requesting verification code.');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    triggerSendOtp();
  }, [purpose]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return; // Allow numbers only

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input field
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter all 6 digits of the code.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/backups/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose, otp: otpCode }),
      });
      const data = await res.json();
      if (data.success && data.authToken) {
        onVerified(data.authToken);
      } else {
        toast.error(data.error || 'Invalid verification code.');
      }
    } catch {
      toast.error('Network error verifying code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <ShieldCheck className="h-4.5 w-4.5 text-blue-600" />
            </div>
            <span className="font-black text-slate-950 text-sm tracking-tight">Security Check</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleVerify} className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-black text-slate-950 tracking-tight">Verification Code Required</h3>
            <p className="text-xs text-slate-400 font-bold leading-relaxed px-2">
              To {OPERATION_LABELS[purpose] || 'perform this operation'}, we have sent a 6-digit OTP code to your registered email address.
            </p>
          </div>

          {/* OTP inputs */}
          <div className="flex justify-center gap-2.5">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={loading || sending}
                className="w-12 h-14 text-center text-xl font-black text-slate-800 bg-slate-50 border border-slate-150 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            ))}
          </div>

          {/* Verification / Action */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading || sending || otp.join('').length < 6}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Code'}
            </button>

            {/* Resend button */}
            <div className="text-center">
              {cooldown > 0 ? (
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Resend code in {cooldown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={triggerSendOtp}
                  disabled={sending || loading}
                  className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 tracking-wider disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={cn("h-3 w-3", sending && "animate-spin")} />
                  Resend Email Code
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
