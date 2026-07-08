'use client';

import React, { useState, useEffect } from 'react';
import { 
  Database, RefreshCw, Plus, Trash2, Download, ShieldCheck, 
  Settings, Clock, HardDrive, ShieldAlert, CheckCircle, 
  XCircle, Play, FileText, Check, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';
import { OtpVerificationModal } from './otp-verification-modal';
import { BackupProgressModal } from './backup-progress-modal';
import { RestoreWarningDialog } from './restore-warning-dialog';
import { BackupDetailModal } from './backup-detail-modal';
import { ScheduleSettingsPanel } from './schedule-settings';

interface BackupJobInfo {
  id: string;
  name: string;
  type: 'manual' | 'automatic' | 'pre_restore';
  status: 'queued' | 'preparing' | 'compressing' | 'encrypting' | 'uploading' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  fileSize: string | null;
  storageProvider: string;
  createdAt: string;
  completedAt: string | null;
  errorMessage: string | null;
  encrypted: boolean;
  creator?: { name: string; email: string };
}

export function BackupDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [backups, setBackups] = useState<BackupJobInfo[]>([]);
  const [backupsLoading, setBackupsLoading] = useState(true);

  // Modals state
  const [otpModalPurpose, setOtpModalPurpose] = useState<string | null>(null);
  const [otpModalAction, setOtpModalAction] = useState<((token: string) => void) | null>(null);

  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeJobType, setActiveJobType] = useState<'backup' | 'restore'>('backup');

  const [restoreWarningBackupId, setRestoreWarningBackupId] = useState<string | null>(null);
  const [selectedBackupDetail, setSelectedBackupDetail] = useState<BackupJobInfo | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/v1/backups/stats');
      const json = await res.json();
      if (json.success) setStats(json.stats);
    } catch {
      toast.error('Failed to load backup statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchBackups = async () => {
    try {
      const res = await fetch('/api/v1/backups');
      const json = await res.json();
      if (json.data) setBackups(json.data);
    } catch {
      toast.error('Failed to load backup history');
    } finally {
      setBackupsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchBackups();
  }, []);

  const triggerRefresh = () => {
    setStatsLoading(true);
    setBackupsLoading(true);
    fetchStats();
    fetchBackups();
    toast.success('Backup dashboard updated');
  };

  const handleCreateBackup = () => {
    setOtpModalPurpose('BACKUP_CREATE');
    setOtpModalAction(() => async (token: string) => {
      try {
        const res = await fetch('/api/v1/backups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authToken: token }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success('Backup job initiated successfully');
          setActiveJobType('backup');
          setActiveJobId(data.jobId);
          fetchBackups();
        } else {
          toast.error(data.error || 'Failed to start backup');
        }
      } catch {
        toast.error('Network error during backup initialization');
      }
    });
  };

  const handleVerifyIntegrity = async (backupId: string) => {
    toast.promise(
      fetch(`/api/v1/backups/${backupId}/verify`, { method: 'POST' }).then(async (res) => {
        const data = await res.json();
        if (data.valid) return data.message;
        throw new Error(data.message || 'Integrity check failed');
      }),
      {
        loading: 'Verifying backup integrity (checksum)...',
        success: (msg) => msg,
        error: (err) => err.message,
      }
    );
  };

  const handleDownload = (backupId: string) => {
    setOtpModalPurpose('BACKUP_DOWNLOAD');
    setOtpModalAction(() => async (token: string) => {
      try {
        const res = await fetch(`/api/v1/backups/${backupId}/download`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authToken: token }),
        });
        const data = await res.json();
        if (data.success && data.downloadUrl) {
          window.open(data.downloadUrl, '_blank');
          toast.success('Signed download link generated');
        } else {
          toast.error(data.error || 'Failed to generate download url');
        }
      } catch {
        toast.error('Network error requesting download link');
      }
    });
  };

  const handleRestoreClick = (backupId: string) => {
    setRestoreWarningBackupId(backupId);
  };

  const handleConfirmRestore = (backupId: string) => {
    setRestoreWarningBackupId(null);
    setOtpModalPurpose('BACKUP_RESTORE');
    setOtpModalAction(() => async (token: string) => {
      try {
        const res = await fetch(`/api/v1/backups/${backupId}/restore`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authToken: token }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success('Restore sequence started');
          setActiveJobType('restore');
          setActiveJobId(data.restoreJobId);
          fetchBackups();
        } else {
          toast.error(data.error || 'Restore failed to initiate');
        }
      } catch {
        toast.error('Network error during restore initialization');
      }
    });
  };

  const handleDelete = (backupId: string) => {
    setOtpModalPurpose('BACKUP_DELETE');
    setOtpModalAction(() => async (token: string) => {
      try {
        const res = await fetch(`/api/v1/backups/${backupId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authToken: token }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success('Backup deleted successfully');
          fetchBackups();
          fetchStats();
        } else {
          toast.error(data.error || 'Failed to delete backup');
        }
      } catch {
        toast.error('Network error deleting backup');
      }
    });
  };

  const formatSize = (bytesStr: string | null) => {
    if (!bytesStr) return '—';
    const bytes = Number(bytesStr);
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="h-6 w-6 text-blue-600" />
            Backup & Restore Center
          </h2>
          <p className="text-slate-500 text-sm">Create, restore, schedule, and verify tenant database snapshots with security guardrails.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={triggerRefresh}
            className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-600 hover:border-slate-300"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setIsScheduleOpen(true)}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-700 font-bold text-sm"
          >
            <Settings className="h-4 w-4" />
            Schedule Settings
          </button>
          <button 
            onClick={handleCreateBackup}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            Create Backup
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Storage Used</span>
            <HardDrive className="h-4 w-4 text-blue-500" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-2">
            {statsLoading ? '...' : stats?.storageUsedFormatted || '0 B'}
          </h3>
          <p className="text-slate-400 text-xs mt-1">Supabase storage bucket</p>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Success Rate</span>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-2">
            {statsLoading ? '...' : `${stats?.successRate || 100}%`}
          </h3>
          <p className="text-slate-400 text-xs mt-1">{stats?.completedBackups || 0} of {stats?.totalBackups || 0} backups</p>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Last Backup</span>
            <Clock className="h-4 w-4 text-indigo-500" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-2">
            {statsLoading ? '...' : stats?.lastBackup ? formatDistanceToNow(new Date(stats.lastBackup.completedAt), { addSuffix: true }) : 'Never'}
          </h3>
          <p className="text-slate-400 text-xs mt-1">{stats?.lastBackup ? stats.lastBackup.name.slice(0, 18) + '...' : 'No manual backups yet'}</p>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Scheduled Status</span>
            <ShieldCheck className="h-4 w-4 text-purple-500" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mt-2">
            {statsLoading ? '...' : stats?.scheduleEnabled ? 'Active' : 'Disabled'}
          </h3>
          <p className="text-slate-400 text-xs mt-1">Retention: {stats?.retentionDays || 30} days</p>
        </div>
      </div>

      {/* Main backup list */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
          <h3 className="font-black text-slate-950 text-base">Backup Logs & Snapshots</h3>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{backups.length} snapshots total</span>
        </div>

        {backupsLoading ? (
          <div className="p-8 text-center text-slate-400">Loading backup history...</div>
        ) : backups.length === 0 ? (
          <div className="p-16 text-center">
            <Database className="h-10 w-10 text-slate-200 mx-auto mb-4" />
            <h4 className="font-bold text-slate-700 text-base">No backups found</h4>
            <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">Generate a manual snapshot using the primary button above or activate scheduled automation.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="px-6 py-4">Snapshot Name</th>
                  <th className="px-6 py-4">Trigger / Type</th>
                  <th className="px-6 py-4">Completed</th>
                  <th className="px-6 py-4">File Size</th>
                  <th className="px-6 py-4">Integrity</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      <button 
                        onClick={() => setSelectedBackupDetail(backup)}
                        className="hover:text-blue-600 hover:underline text-left block"
                      >
                        {backup.name}
                      </button>
                      {backup.creator && (
                        <span className="text-[10px] text-slate-400 block mt-0.5">By {backup.creator.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        backup.type === 'manual' && "bg-blue-50 text-blue-600 border border-blue-100",
                        backup.type === 'automatic' && "bg-purple-50 text-purple-600 border border-purple-100",
                        backup.type === 'pre_restore' && "bg-amber-50 text-amber-600 border border-amber-100"
                      )}>
                        {backup.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {backup.completedAt ? format(new Date(backup.completedAt), 'PPpp') : 'In progress...'}
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-bold font-mono">
                      {formatSize(backup.fileSize)}
                    </td>
                    <td className="px-6 py-4">
                      {backup.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs">
                          <ShieldCheck className="h-4 w-4" /> Secure
                        </span>
                      ) : backup.status === 'failed' ? (
                        <span className="inline-flex items-center gap-1 text-rose-500 font-bold text-xs" title={backup.errorMessage || ''}>
                          <XCircle className="h-4 w-4" /> Failed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-blue-500 font-bold text-xs animate-pulse">
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" /> {backup.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleVerifyIntegrity(backup.id)}
                        disabled={backup.status !== 'completed'}
                        className="text-[11px] font-black uppercase text-slate-500 hover:text-blue-600 p-1.5 hover:bg-slate-100 rounded-lg transition-all disabled:opacity-30"
                        title="Verify Integrity Checksum"
                      >
                        Verify
                      </button>
                      <button 
                        onClick={() => handleDownload(backup.id)}
                        disabled={backup.status !== 'completed'}
                        className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-slate-500 hover:text-indigo-600 p-1.5 hover:bg-slate-100 rounded-lg transition-all disabled:opacity-30"
                        title="Download Encrypted Archive"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => handleRestoreClick(backup.id)}
                        disabled={backup.status !== 'completed'}
                        className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-slate-500 hover:text-amber-600 p-1.5 hover:bg-slate-100 rounded-lg transition-all disabled:opacity-30"
                        title="Restore Snapshot"
                      >
                        <Play className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(backup.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-rose-500 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition-all"
                        title="Delete Permanently"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals & Dialogs */}
      {otpModalPurpose && (
        <OtpVerificationModal
          purpose={otpModalPurpose}
          onClose={() => {
            setOtpModalPurpose(null);
            setOtpModalAction(null);
          }}
          onVerified={(token) => {
            if (otpModalAction) otpModalAction(token);
            setOtpModalPurpose(null);
            setOtpModalAction(null);
          }}
        />
      )}

      {activeJobId && (
        <BackupProgressModal
          jobId={activeJobId}
          type={activeJobType}
          onClose={() => {
            setActiveJobId(null);
            triggerRefresh();
          }}
        />
      )}

      {restoreWarningBackupId && (
        <RestoreWarningDialog
          backupId={restoreWarningBackupId}
          onClose={() => setRestoreWarningBackupId(null)}
          onConfirm={handleConfirmRestore}
        />
      )}

      {selectedBackupDetail && (
        <BackupDetailModal
          backup={selectedBackupDetail}
          onClose={() => setSelectedBackupDetail(null)}
        />
      )}

      {isScheduleOpen && (
        <ScheduleSettingsPanel
          onClose={() => {
            setIsScheduleOpen(false);
            fetchStats();
          }}
        />
      )}
    </div>
  );
}
