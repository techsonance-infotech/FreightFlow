'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackupProgressModalProps {
  jobId: string;
  type: 'backup' | 'restore';
  onClose: () => void;
}

export function BackupProgressModal({ jobId, type, onClose }: BackupProgressModalProps) {
  const [status, setStatus] = useState<string>('queued');
  const [progress, setProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const pollJobStatus = async () => {
      try {
        const res = await fetch(`/api/v1/backups/jobs/${jobId}?type=${type}`);
        const data = await res.json();
        
        if (data.success && data.job) {
          const { status: jobStatus, progress: jobProgress, errorMessage: jobErr } = data.job;
          setStatus(jobStatus);
          setProgress(jobProgress);
          setErrorMessage(jobErr);

          if (['completed', 'failed', 'cancelled', 'rolled_back'].includes(jobStatus)) {
            clearInterval(intervalId);
          }
        }
      } catch (err) {
        console.error('Error polling job status:', err);
      }
    };

    // Poll every 2 seconds
    pollJobStatus();
    intervalId = setInterval(pollJobStatus, 2000);

    return () => clearInterval(intervalId);
  }, [jobId, type]);

  const steps = type === 'backup' 
    ? [
        { label: 'Preparing data extraction', minProgress: 5, activeStatuses: ['queued', 'preparing'] },
        { label: 'Compressing archive', minProgress: 35, activeStatuses: ['compressing'] },
        { label: 'Encrypting backup payload', minProgress: 55, activeStatuses: ['encrypting'] },
        { label: 'Uploading to secure storage', minProgress: 75, activeStatuses: ['uploading'] },
        { label: 'Finalizing process', minProgress: 100, activeStatuses: ['completed'] }
      ]
    : [
        { label: 'Creating safety rollback snapshot', minProgress: 10, activeStatuses: ['queued', 'snapshot_creating'] },
        { label: 'Downloading & validating package', minProgress: 35, activeStatuses: ['validating'] },
        { label: 'Restoring database snapshots', minProgress: 50, activeStatuses: ['restoring'] },
        { label: 'Verifying data structures', minProgress: 85, activeStatuses: ['verifying'] },
        { label: 'Restoration finalized', minProgress: 100, activeStatuses: ['completed'] }
      ];

  const getStepState = (stepIndex: number, stepMinProgress: number, stepStatuses: string[]) => {
    if (status === 'failed') {
      // Find the step where progress stopped
      const isCurrentStep = progress >= stepMinProgress && (stepIndex === steps.length - 1 || progress < steps[stepIndex + 1].minProgress);
      if (isCurrentStep) return 'failed';
      return progress > stepMinProgress ? 'completed' : 'pending';
    }

    if (status === 'completed') return 'completed';
    if (stepStatuses.includes(status) || (progress >= stepMinProgress && (stepIndex === steps.length - 1 || progress < steps[stepIndex + 1].minProgress))) return 'active';
    return progress > stepMinProgress ? 'completed' : 'pending';
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-md w-full p-6 space-y-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Title */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-black text-slate-950 tracking-tight">
            {type === 'backup' ? 'Creating Backup Snapshot' : 'Restoring System Database'}
          </h3>
          <p className="text-xs text-slate-400 font-bold">
            Please do not close this window or navigate away while the task completes.
          </p>
        </div>

        {/* Progress Circle & Text */}
        <div className="flex flex-col items-center justify-center py-4 space-y-3">
          <div className="relative h-24 w-24 flex items-center justify-center">
            {status === 'failed' ? (
              <XCircle className="h-16 w-16 text-rose-500" />
            ) : status === 'completed' ? (
              <CheckCircle2 className="h-16 w-16 text-emerald-500" />
            ) : (
              <>
                <Loader2 className="h-16 w-16 text-blue-600 animate-spin absolute" />
                <span className="text-lg font-black text-slate-800">{progress}%</span>
              </>
            )}
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">
            Status: <span className={cn(
              status === 'completed' && "text-emerald-600",
              status === 'failed' && "text-rose-500",
              !['completed', 'failed'].includes(status) && "text-blue-500"
            )}>{status}</span>
          </span>
        </div>

        {/* Steps Roadmap */}
        <div className="space-y-4 pt-2">
          {steps.map((step, idx) => {
            const stepState = getStepState(idx, step.minProgress, step.activeStatuses);
            return (
              <div key={idx} className="flex items-center gap-3.5">
                <div className="flex items-center justify-center w-5 h-5 shrink-0">
                  {stepState === 'completed' && (
                    <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                  )}
                  {stepState === 'active' && (
                    <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    </div>
                  )}
                  {stepState === 'failed' && (
                    <div className="w-4 h-4 rounded-full bg-rose-100 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                    </div>
                  )}
                  {stepState === 'pending' && (
                    <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-slate-350" />
                    </div>
                  )}
                </div>
                <span className={cn(
                  "text-xs font-bold transition-colors",
                  stepState === 'completed' && "text-slate-500 line-through",
                  stepState === 'active' && "text-blue-600 font-extrabold",
                  stepState === 'failed' && "text-rose-500 font-extrabold",
                  stepState === 'pending' && "text-slate-400"
                )}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Error panel */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold leading-relaxed">
            {errorMessage}
          </div>
        )}

        {/* Action button */}
        {['completed', 'failed', 'cancelled', 'rolled_back'].includes(status) && (
          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
            >
              Close Window
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
