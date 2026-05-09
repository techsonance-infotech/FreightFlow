'use client';

import React from 'react';
import { LogOut } from 'lucide-react';
import { adminLogout } from '@/app/actions/admin/auth';
import { toast } from 'sonner';

export function AdminLogoutButton() {
  const handleLogout = async () => {
    try {
      await adminLogout();
      toast.success('Session Terminated');
      window.location.href = '/admin/login';
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className="flex items-center gap-3 px-5 py-4 w-full text-slate-400 hover:text-rose-500 transition-all font-black text-[10px] uppercase tracking-widest group"
    >
      <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
      Termination Session
    </button>
  );
}
