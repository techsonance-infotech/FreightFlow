'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Info, Megaphone, AlertTriangle, ShieldAlert, Sparkles, Check, ExternalLink, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMyNotifications, markAsRead, markAllAsRead } from '@/app/actions/notifications';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    setLoading(true);
    const data = await getMyNotifications();
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    await markAsRead(id);
  };

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    await markAllAsRead();
    toast.success('All notifications marked as read');
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'promotional': return {
        icon: <Sparkles className="h-4 w-4 text-purple-600" />,
        bg: 'bg-purple-50',
        border: 'border-purple-100',
        dot: 'bg-purple-500'
      };
      case 'alert': return {
        icon: <AlertTriangle className="h-4 w-4 text-rose-600" />,
        bg: 'bg-rose-50',
        border: 'border-rose-100',
        dot: 'bg-rose-500'
      };
      case 'maintenance': return {
        icon: <ShieldAlert className="h-4 w-4 text-amber-600" />,
        bg: 'bg-amber-50',
        border: 'border-amber-100',
        dot: 'bg-amber-500'
      };
      case 'license': return {
        icon: <Megaphone className="h-4 w-4 text-blue-600" />,
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        dot: 'bg-blue-500'
      };
      default: return {
        icon: <Info className="h-4 w-4 text-slate-600" />,
        bg: 'bg-slate-50',
        border: 'border-slate-100',
        dot: 'bg-slate-500'
      };
    }
  };

  return (
    <div className="relative">
      <button 
        className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 transition-all hover:bg-neutral-50 hover:text-accent-600 shadow-sm active:scale-95"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-error-500 ring-4 ring-white animate-pulse" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-3 w-96 z-50 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-neutral-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-neutral-50 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Inbox</h3>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">{unreadCount} New Messages</p>
              </div>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[450px] overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-4">
                  <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Syncing Feed...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-slate-200" />
                  </div>
                  <p className="text-sm font-black text-slate-900 uppercase tracking-tight">You're All Caught Up!</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">No new system alerts at this time</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {notifications.map((notif) => {
                    const styles = getTypeStyles(notif.type);
                    return (
                      <div 
                        key={notif.id}
                        className={cn(
                          "p-5 transition-all relative group",
                          !notif.isRead ? "bg-slate-50/30" : "opacity-70"
                        )}
                      >
                        {!notif.isRead && (
                          <div className={cn("absolute left-0 top-0 bottom-0 w-1", styles.dot)} />
                        )}
                        
                        <div className="flex gap-4">
                          <div className={cn("h-10 w-10 shrink-0 rounded-xl flex items-center justify-center border shadow-sm", styles.bg, styles.border)}>
                            {styles.icon}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-black text-slate-900 leading-tight uppercase tracking-tight">{notif.title}</p>
                              <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap mt-0.5">
                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-[11px] font-medium text-slate-500 mt-1.5 leading-relaxed line-clamp-3">
                              {notif.message}
                            </p>
                            
                            <div className="flex items-center gap-4 mt-3">
                              {notif.link && (
                                <a 
                                  href={notif.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 hover:underline"
                                >
                                  Take Action <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              )}
                              {!notif.isRead && (
                                <button 
                                  onClick={() => handleMarkRead(notif.id)}
                                  className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
                                >
                                  Mark as read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] text-center">
                Platform Intelligence Center
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
