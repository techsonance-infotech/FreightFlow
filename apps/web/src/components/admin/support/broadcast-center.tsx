'use client';

import React, { useState } from 'react';
import { 
  Megaphone, Shield, 
  Send, X, Zap, Loader2,
  Users, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function GlobalBroadcast() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tier, setTier] = useState('all');
  const [message, setMessage] = useState('');

  const handleBroadcast = async () => {
    if (!message.trim()) return;
    setLoading(true);
    // Simulation for now - would connect to a broadcast server action
    await new Promise(r => setTimeout(r, 1500));
    toast.success(`Platform broadcast dispatched to ${tier} tier.`);
    setIsOpen(false);
    setLoading(false);
    setMessage('');
  };

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="h-14 px-8 bg-slate-900 hover:bg-black text-white rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-slate-200 transition-all active:scale-[0.98]"
      >
        <Megaphone className="h-4 w-4" />
        Global Broadcast
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-8 animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white border border-slate-100 rounded-[3.5rem] p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2.5 bg-blue-600" />
        
        <button onClick={() => setIsOpen(false)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-900 transition-colors">
          <X className="h-7 w-7" />
        </button>

        <div className="flex flex-col items-center text-center mb-10">
          <div className="h-20 w-20 bg-slate-900 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-slate-500/20 rotate-6">
            <Globe className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter">System Broadcast</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">Platform-Wide Governance Alert</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Target Tiers</label>
            <div className="grid grid-cols-2 gap-4">
              {['all', 'enterprise', 'pro', 'starter'].map((t) => (
                <button 
                  key={t}
                  onClick={() => setTier(t)}
                  className={cn(
                    "h-12 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all",
                    tier === t ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-200"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Alert Message</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type system-level announcement..."
              className="w-full min-h-[120px] bg-slate-50 border-slate-100 text-slate-900 rounded-2xl p-6 font-bold text-sm focus:ring-0 focus:border-blue-600 outline-none shadow-inner resize-none"
            />
          </div>

          <Button 
            onClick={handleBroadcast}
            disabled={loading || !message.trim()}
            className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/30 transition-all active:scale-[0.98]"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            Dispatch Broadcast
          </Button>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
