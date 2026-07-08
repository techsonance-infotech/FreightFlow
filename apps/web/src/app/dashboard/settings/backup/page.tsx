import React from 'react';
import { BackupDashboard } from '@/components/dashboard/backup/backup-dashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Secure Backup Center | FreightFlow Settings',
  description: 'Manage manual and automatic database backups, schedules, integrity verification, and restorations with multi-factor OTP validation.',
};

export default function BackupSettingsPage() {
  return <BackupDashboard />;
}
