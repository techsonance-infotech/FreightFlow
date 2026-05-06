'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Loader2, Shield, 
  Key, Zap, User, Clock,
  Calendar, CheckCircle2, X, Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { sendAdminMessage, generateAndSendLicense } from '@/app/actions/admin/support';
import { toast } from 'sonner';

export function AdminChat({ request, adminId }: any) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [request.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      const res = await sendAdminMessage(request.id, message.trim());
      if (res.success) {
        setMessage('');
        // Reload is fine for now in this prototype
        window.location.reload();
      }
    } catch (err) {
      toast.error('Failed to send reply');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 h-[700px]">
      {/* Chat Area */}
      <div className="lg:col-span-2 bg-slate-900/30 border border-slate-900 rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">
        <div className="px-8 py-6 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-600/20 rounded-2xl flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-black text-white tracking-tight">Support Conversation</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Secure Direct Link</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowGenerator(true)}
            className="bg-blue-600 hover:bg-blue-700 rounded-xl font-black text-[10px] uppercase tracking-widest px-6 flex items-center gap-2"
          >
            <Key className="h-4 w-4" />
            Generate License
          </Button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-950/20">
          {request.messages.map((msg: any) => {
            const isSystem = msg.isAction;
            const isAdmin = !!msg.admin;
            
            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="bg-slate-900/80 px-6 py-2.5 rounded-full border border-slate-800 flex items-center gap-2 shadow-xl">
                    <Zap className="h-3 w-3 text-amber-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{msg.message}</span>
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className={cn(
                "flex flex-col max-w-[70%]",
                isAdmin ? "self-end items-end" : "self-start"
              )}>
                <div className={cn(
                  "p-6 rounded-[2rem] shadow-xl border",
                  isAdmin 
                    ? "bg-blue-600 border-blue-600 text-white rounded-tr-none" 
                    : "bg-slate-900 border-slate-800 text-slate-200 rounded-tl-none"
                )}>
                  <p className="text-sm font-bold leading-relaxed">{msg.message}</p>
                </div>
                <div className="mt-3 flex items-center gap-2 px-3">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {isAdmin ? 'You (Admin)' : request.user.name} &bull; {isMounted ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-8 border-t border-slate-800 bg-slate-900/20">
          <form onSubmit={handleSendMessage} className="flex gap-4">
            <Input 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type administrative reply..."
              className="flex-1 h-14 bg-slate-900 border-slate-800 text-white rounded-2xl font-bold focus:ring-blue-600"
            />
            <Button 
              type="submit" 
              disabled={isLoading || !message.trim()}
              className="h-14 w-14 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/10"
            >
              <Send className="h-6 w-6" />
            </Button>
          </form>
        </div>
      </div>

      {/* Info Sidebar */}
      <div className="space-y-6">
        <div className="bg-slate-900/30 border border-slate-900 rounded-[3rem] p-8">
          <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6">Tenant Dossier</h4>
          <div className="space-y-6">
            <InfoItem label="Workspace" value={request.tenant.name} icon={<Building2 className="h-4 w-4" />} />
            <InfoItem label="Primary Owner" value={request.user.name} icon={<User className="h-4 w-4" />} />
            <InfoItem label="Contact Email" value={request.user.email} icon={<Mail className="h-4 w-4" />} />
            <InfoItem label="Request Date" value={isMounted ? new Date(request.createdAt).toLocaleDateString() : 'Loading...'} icon={<Calendar className="h-4 w-4" />} />
            <InfoItem label="Requested Plan" value={request.planType.toUpperCase()} icon={<Zap className="h-4 w-4" />} />
          </div>
        </div>

        <div className="bg-blue-600/10 border border-blue-600/20 rounded-[3rem] p-8">
          <h4 className="text-sm font-black text-blue-500 uppercase tracking-widest mb-4">Admin Advisory</h4>
          <p className="text-xs font-bold text-slate-400 leading-relaxed">
            Verify payment confirmation before generating Enterprise license keys. All issued keys are final and logged in the platform audit trail.
          </p>
        </div>
      </div>

      {/* Generator Modal Overlay */}
      {showGenerator && (
        <LicenseGeneratorModal 
          request={request} 
          onClose={() => setShowGenerator(false)} 
        />
      )}
    </div>
  );
}

function InfoItem({ label, value, icon }: any) {
  return (
    <div className="flex items-start gap-4">
      <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-slate-500">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-white mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function LicenseGeneratorModal({ request, onClose }: any) {
  const [plan, setPlan] = useState(request.planType);
  const [years, setYears] = useState('1');
  const [maxUsers, setMaxUsers] = useState('10');
  const [maxVehicles, setMaxVehicles] = useState('20');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await generateAndSendLicense({
        requestId: request.id,
        tenantId: request.tenantId,
        plan,
        years: parseInt(years),
        maxUsers: parseInt(maxUsers),
        maxVehicles: parseInt(maxVehicles)
      });

      if (res.success) {
        toast.success('License Key Issued & Sent!');
        window.location.reload();
      }
    } catch (err) {
      toast.error('Failed to issue license');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600" />
        
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
          <X className="h-6 w-6" />
        </button>

        <div className="flex flex-col items-center text-center mb-10">
          <div className="h-20 w-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/20">
            <Key className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-3xl font-black text-white tracking-tight">Issue License</h3>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Cryptographic Key Generation</p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Plan Level</label>
              <select 
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full h-12 bg-slate-800 border-slate-700 text-white rounded-xl font-bold px-4 focus:ring-2 focus:ring-blue-600 outline-none"
              >
                <option value="starter">Starter</option>
                <option value="pro">Professional</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Validity (Years)</label>
              <select 
                value={years}
                onChange={(e) => setYears(e.target.value)}
                className="w-full h-12 bg-slate-800 border-slate-700 text-white rounded-xl font-bold px-4 focus:ring-2 focus:ring-blue-600 outline-none"
              >
                <option value="1">1 Year</option>
                <option value="2">2 Years</option>
                <option value="3">3 Years</option>
                <option value="5">5 Years</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Max Users</label>
              <Input 
                type="number"
                value={maxUsers}
                onChange={(e) => setMaxUsers(e.target.value)}
                className="h-12 bg-slate-800 border-slate-700 text-white rounded-xl font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Max Vehicles</label>
              <Input 
                type="number"
                value={maxVehicles}
                onChange={(e) => setMaxVehicles(e.target.value)}
                className="h-12 bg-slate-800 border-slate-700 text-white rounded-xl font-bold"
              />
            </div>
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg mt-4 flex items-center justify-center gap-3 group"
          >
            {isGenerating ? <Loader2 className="h-6 w-6 animate-spin" /> : (
              <>
                <Zap className="h-6 w-6 fill-white" />
                Finalize & Issue Key
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageSquare(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function Mail(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
