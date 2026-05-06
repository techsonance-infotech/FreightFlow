'use client';

import React, { useState } from 'react';
import { Shield, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { adminLogin } from '@/app/actions/admin/auth';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await adminLogin(email, password);
      if (res.success) {
        toast.success('Admin access granted');
        router.push('/admin/dashboard');
      } else {
        toast.error(res.error || 'Invalid admin credentials');
      }
    } catch (err) {
      toast.error('System authentication failure');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-blue-500 selection:text-white">
      {/* Background patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="h-20 w-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/20 rotate-3 group hover:rotate-0 transition-transform duration-500">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Platform Control</h1>
            <p className="mt-3 text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
              Secure Super Admin Entry
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Admin Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                <Input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@freightflow.com"
                  className="pl-12 h-14 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                <Input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="pl-12 h-14 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-lg shadow-xl shadow-blue-500/10 flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  Authenticate Access
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="mt-8 text-center text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
          FreightFlow Enterprise Platform &bull; v2.0.0
        </p>
      </div>
    </div>
  );
}
