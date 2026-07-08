'use client';

import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { OtpVerificationModal } from './otp-verification-modal';

interface ScheduleSettingsPanelProps {
  onClose: () => void;
}

export function ScheduleSettingsPanel({ onClose }: ScheduleSettingsPanelProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [frequency, setFrequency] = useState('daily');
  const [retentionDays, setRetentionDays] = useState(30);
  const [backupType, setBackupType] = useState('full');

  // OTP State
  const [isOtpOpen, setIsOtpOpen] = useState(false);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch('/api/v1/backups/schedule');
        const data = await res.json();
        if (data) {
          setEnabled(data.enabled || false);
          setFrequency(data.frequency || 'daily');
          setRetentionDays(data.retentionDays || 30);
          setBackupType(data.backupType || 'full');
        }
      } catch {
        toast.error('Failed to load backup schedule settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOtpOpen(true);
  };

  const handleVerified = async (token: string) => {
    setIsOtpOpen(false);
    setSaving(true);

    try {
      const res = await fetch('/api/v1/backups/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authToken: token,
          enabled,
          frequency,
          retentionDays: Number(retentionDays),
          backupType,
          timezone: 'Asia/Kolkata',
          cron: frequency === 'daily' ? '0 0 * * *' : frequency === 'weekly' ? '0 0 * * 0' : '0 0 1 * *',
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Backup schedule configuration updated successfully');
        onClose();
      } else {
        toast.error(data.error || 'Failed to update schedule');
      }
    } catch {
      toast.error('Network error saving schedule');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <span className="font-black text-slate-950 text-sm tracking-tight">Automated Backup Settings</span>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span>Loading schedule configurations...</span>
          </div>
        ) : (
          <form onSubmit={handleSaveClick} className="p-6 space-y-6">
            
            {/* Toggle enabled */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">Enable Auto Backups</span>
                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Runs automatically in background</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={enabled} 
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Config fields if enabled */}
            <div className={`space-y-4 transition-all duration-205 ${enabled ? 'opacity-100 pointer-events-auto' : 'opacity-40 pointer-events-none'}`}>
              {/* Frequency */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Backup Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  disabled={!enabled}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-150 rounded-xl text-sm font-bold text-slate-800 outline-none transition-all focus:bg-white focus:border-blue-500"
                >
                  <option value="daily">Daily (At 12:00 AM Kolkata)</option>
                  <option value="weekly">Weekly (Sunday at 12:00 AM Kolkata)</option>
                  <option value="monthly">Monthly (1st of month at 12:00 AM Kolkata)</option>
                </select>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Backup Scope</label>
                <select
                  value={backupType}
                  onChange={(e) => setBackupType(e.target.value)}
                  disabled={!enabled}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-150 rounded-xl text-sm font-bold text-slate-800 outline-none transition-all focus:bg-white focus:border-blue-500"
                >
                  <option value="full">Full Backup (Entire database)</option>
                  <option value="incremental">Incremental (Changes only)</option>
                </select>
              </div>

              {/* Retention */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Retention Window (Days)</label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(Number(e.target.value))}
                  disabled={!enabled}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-150 rounded-xl text-sm font-bold text-slate-800 outline-none transition-all focus:bg-white focus:border-blue-500"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 bg-slate-900 hover:bg-black disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>

      {isOtpOpen && (
        <OtpVerificationModal
          purpose="BACKUP_SCHEDULE_CHANGE"
          onClose={() => setIsOtpOpen(false)}
          onVerified={handleVerified}
        />
      )}
    </div>
  );
}
