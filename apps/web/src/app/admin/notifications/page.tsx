'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, Send, Users, ShieldAlert, Target, Sparkles, Clock, History, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { broadcastNotification, getBroadcastHistory } from '@/app/actions/admin/notifications';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function AdminNotificationsPage() {
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'info' as any,
    priority: 'medium' as any,
    target: 'ALL' as any,
    link: '',
    expiresInDays: 7
  });
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = async () => {
    const data = await getBroadcastHistory();
    setHistory(data);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.message) return toast.error('Please fill in title and message');

    setLoading(true);
    try {
      const res = await broadcastNotification(form);
      toast.success(`Successfully broadcasted to ${res.count} users`);
      setForm({ ...form, title: '', message: '', link: '' });
      fetchHistory();
    } catch (err: any) {
      toast.error(err.message || 'Broadcast failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-4 mb-2">
        <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
          <Megaphone className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Broadcast Command Center</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Global Communication & Marketing Orchestration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Composition Form */}
        <div className="xl:col-span-2 space-y-6">
          <form onSubmit={handleBroadcast} className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Compose Message</label>
              <Input 
                placeholder="Notification Title (e.g., System Maintenance Alert)" 
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
                className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-lg"
              />
              <textarea 
                placeholder="Compose your broadcast message here. Be clear and concise..." 
                value={form.message}
                onChange={e => setForm({...form, message: e.target.value})}
                className="w-full min-h-[150px] p-6 rounded-2xl bg-slate-50 border-none font-medium text-slate-600 outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Audience</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'ALL', label: 'All Users', icon: <Users className="h-3 w-3" /> },
                    { id: 'UNLICENSED', label: 'Unlicensed', icon: <ShieldAlert className="h-3 w-3" /> },
                    { id: 'NEAR_EXPIRY', label: 'Near Expiry', icon: <Clock className="h-3 w-3" /> },
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setForm({...form, target: t.id})}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border",
                        form.target === t.id ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100" : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50"
                      )}
                    >
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Notification Type</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'info', label: 'Info', color: 'blue' },
                    { id: 'promotional', label: 'Promo', color: 'purple' },
                    { id: 'alert', label: 'Alert', color: 'rose' },
                    { id: 'maintenance', label: 'System', color: 'amber' },
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setForm({...form, type: t.id})}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                        form.type === t.id ? `bg-${t.color}-600 text-white border-${t.color}-600 shadow-lg` : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
               <div className="flex items-center gap-4 flex-1 max-w-md">
                 <Input 
                   placeholder="CTA Link (Optional)" 
                   value={form.link}
                   onChange={e => setForm({...form, link: e.target.value})}
                   className="h-12 rounded-xl bg-slate-50 border-none font-medium"
                 />
               </div>
               <Button 
                 disabled={loading}
                 className="h-14 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 flex items-center gap-3 transition-all active:scale-95"
               >
                 {loading ? 'Broadcasting...' : <>Execute Broadcast <Send className="h-4 w-4" /></>}
               </Button>
            </div>
          </form>
        </div>

        {/* Recent History Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-8 h-full">
            <div className="flex items-center gap-3 mb-6">
              <History className="h-5 w-5 text-slate-400" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Broadcasts</h3>
            </div>

            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="py-12 text-center opacity-20">
                  <Clock className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No Recent Activity</p>
                </div>
              ) : (
                history.map((h) => (
                  <div key={h.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-indigo-100 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-white border border-slate-100 uppercase text-slate-400">
                        {h.type}
                      </span>
                      <span className="text-[9px] font-bold text-slate-300">
                        {formatDistanceToNow(new Date(h.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs font-black text-slate-900 leading-tight mb-1">{h.title}</p>
                    <p className="text-[10px] text-slate-500 line-clamp-2">{h.message}</p>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[9px] font-black text-emerald-600 uppercase flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Delivered
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
