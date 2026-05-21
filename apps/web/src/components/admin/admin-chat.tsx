'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Loader2, Shield, 
  Key, Zap, User, Clock,
  Calendar, CheckCircle2, X, Building2,
  Mail, MessageSquare, ChevronDown, 
  CreditCard, Info, AlertTriangle,
  Lock, ArrowRight, Check, Image as ImageIcon,
  QrCode, ExternalLink, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { sendAdminMessage, generateAndSendLicense } from '@/app/actions/admin/support';
import { updateTicketStatus, sendInternalNote, claimTicket } from '@/app/actions/admin/support-ultimate';
import { toast } from 'sonner';
import { PaymentDispatcher } from './payment-dispatch';
import { SlaMonitor } from './support/sla-monitor';
import { PaymentProofCard } from './support/shared-cards';

export function AdminChat({ request, adminId }: any) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isInternal, setIsInternal] = useState(false);
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
      const res = isInternal 
        ? await sendInternalNote(request.id, message.trim())
        : await sendAdminMessage(request.id, message.trim());
        
      if (res.success) {
        setMessage('');
        setIsInternal(false);
        window.location.reload();
      }
    } catch (err) {
      toast.error('Failed to send reply');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 h-[750px] animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Chat Area */}
      <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[3rem] overflow-hidden flex flex-col shadow-sm">
        <div className="px-10 py-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-inner">
              <MessageSquare className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Support Stream</h3>
              <div className="flex items-center gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Active Governance Session</p>
                <span className="h-1 w-1 rounded-full bg-slate-200" />
                <TicketStatusController requestId={request.id} currentStatus={request.status} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => claimTicket(request.id).then(() => window.location.reload())}
              variant="outline"
              className="h-14 border-slate-200 rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest px-6"
            >
              Claim Ticket
            </Button>
            <Button 
              onClick={() => setShowGenerator(true)}
              className="bg-slate-900 hover:bg-black text-white rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest px-8 h-14 flex items-center gap-3 shadow-xl shadow-slate-200 transition-all active:scale-[0.98]"
            >
              <Key className="h-4 w-4" />
              Issue License
            </Button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 space-y-10 bg-[#FCFDFF]">
          {request.messages.map((msg: any) => {
            const isSystem = msg.isAction;
            const isAdmin = !!msg.admin;
            
            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="bg-white px-8 py-3 rounded-full border border-slate-100 flex items-center gap-3 shadow-sm">
                    <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{msg.message}</span>
                  </div>
                </div>
              );
            }

            if (msg.type === 'PAYMENT_INFO') {
              return <PaymentActionCard key={msg.id} payload={msg.payload} timestamp={msg.createdAt} isMounted={isMounted} />;
            }

            if (msg.type === 'PAYMENT_PROOF') {
              return <PaymentProofCard key={msg.id} msg={msg} isMounted={isMounted} isAdminView={true} />;
            }

            if (msg.type === 'INTERNAL_NOTE') {
              return (
                <div key={msg.id} className="flex flex-col items-center">
                  <div className="max-w-[80%] bg-amber-50/50 border border-amber-100/50 rounded-3xl p-6 flex gap-4 items-start">
                    <Lock className="h-4 w-4 text-amber-500 mt-1 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">Internal Admin Ledger</p>
                      <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{msg.message}"</p>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className={cn(
                "flex flex-col max-w-[75%]",
                isAdmin ? "self-end items-end" : "self-start"
              )}>
                <div className={cn(
                  "p-8 rounded-[2.5rem] shadow-sm border transition-all",
                  isAdmin 
                    ? "bg-blue-600 border-blue-600 text-white rounded-tr-none shadow-blue-200" 
                    : "bg-white border-slate-100 text-slate-700 rounded-tl-none"
                )}>
                  <p className="text-sm font-bold leading-relaxed">{msg.message}</p>
                </div>
                <div className="mt-4 flex items-center gap-3 px-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {isAdmin ? 'System Lead' : request.user.name} &bull; {isMounted ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-10 border-t border-slate-50 bg-white">
          <div className="flex items-center gap-4 mb-6 ml-2">
            <button 
              onClick={() => setIsInternal(!isInternal)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
                isInternal ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-slate-50 text-slate-400 border-slate-100"
              )}
            >
              <Lock className="h-3 w-3" />
              {isInternal ? 'Internal Ledger Mode' : 'Direct Dispatch'}
            </button>
            {isInternal && (
              <p className="text-[9px] font-bold text-amber-500/60 uppercase tracking-widest animate-pulse">Notes are hidden from tenant</p>
            )}
          </div>
          <form onSubmit={handleSendMessage} className="flex gap-6">
            <Input 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isInternal ? "Type internal discovery..." : "Type administrative dispatch..."}
              className={cn(
                "flex-1 h-16 border-slate-100 text-slate-900 rounded-[1.25rem] font-bold focus:ring-0 placeholder:text-slate-300 transition-all shadow-inner",
                isInternal ? "bg-amber-50/30 border-amber-100 focus:border-amber-400" : "bg-slate-50 focus:border-blue-600"
              )}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !message.trim()}
              className={cn(
                "h-16 w-16 rounded-[1.25rem] text-white shadow-xl flex items-center justify-center transition-all active:scale-[0.95]",
                isInternal ? "bg-amber-500 hover:bg-amber-600 shadow-amber-200" : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
              )}
            >
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (isInternal ? <Lock className="h-6 w-6" /> : <Send className="h-6 w-6" />)}
            </Button>
          </form>
        </div>
      </div>

      {/* Info Sidebar */}
      <div className="space-y-8 overflow-y-auto pr-4">
        <SlaMonitor request={request} />

        <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10 ml-2">Tenant Intelligence</h4>
          <div className="space-y-10">
            <InfoItem label="Governance Hub" value={request.tenant.name} icon={<Building2 className="h-4 w-4" />} />
            <InfoItem label="Primary Custodian" value={request.user.name} icon={<User className="h-4 w-4" />} />
            <InfoItem label="Contact Matrix" value={request.user.email} icon={<Mail className="h-4 w-4" />} />
            <InfoItem label="Initialization" value={isMounted ? new Date(request.createdAt).toLocaleDateString() : 'Syncing...'} icon={<Calendar className="h-4 w-4" />} />
            <InfoItem label="Requested Tier" value={request.planType.toUpperCase()} icon={<Zap className="h-4 w-4" />} />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-[3rem] p-10 shadow-inner">
          <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-6 ml-2">Direct Advisory</h4>
          <p className="text-xs font-bold text-slate-500 leading-loose mb-8">
            Validate transactional integrity before dispatching cryptographic access keys. All system-level mutations are logged in the immutable audit trail.
          </p>
          <PaymentDispatcher requestId={request.id} />
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
    <div className="flex items-start gap-6 group">
      <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 border border-slate-100 shadow-inner group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{label}</p>
        <p className="text-sm font-black text-slate-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function TicketStatusController({ requestId, currentStatus }: { requestId: string, currentStatus: string }) {
  const [loading, setLoading] = useState(false);
  
  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    setLoading(true);
    try {
      await updateTicketStatus(requestId, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      window.location.reload();
    } catch (error) {
      toast.error('Status update failed');
    } finally {
      setLoading(false);
    }
  };

  const statusColors: any = {
    pending: 'text-amber-500 bg-amber-50 border-amber-100',
    approved: 'text-emerald-500 bg-emerald-50 border-emerald-100',
    rejected: 'text-rose-500 bg-rose-50 border-rose-100',
  };

  return (
    <div className="relative group">
      <div className={cn(
        "flex items-center gap-3 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest cursor-pointer hover:shadow-md transition-all",
        statusColors[currentStatus]
      )}>
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <div className="h-1.5 w-1.5 rounded-full bg-current" />}
        {currentStatus}
        <ChevronDown className="h-3 w-3 opacity-50" />
      </div>
      
      <div className="absolute top-full mt-2 left-0 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl p-2 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-2 duration-300">
        {['pending', 'approved', 'rejected'].map((s) => (
          <button 
            key={s}
            onClick={() => handleStatusChange(s)}
            className="w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-all flex items-center justify-between"
          >
            {s}
            {currentStatus === s && <Check className="h-3 w-3" />}
          </button>
        ))}
      </div>
    </div>
  );
}

function PaymentActionCard({ payload, timestamp, isMounted }: any) {
  const [showQrModal, setShowQrModal] = useState(false);

  // Generate dynamic scan-to-pay QR Code URL using QR Server API
  const encodedUpiUrl = `upi://pay?pa=${encodeURIComponent(payload.upiId)}&pn=${encodeURIComponent(payload.accountHolder || 'FreightFlow')}&am=0&cu=INR`;
  const qrCodeUrl = payload.qrUrl && payload.qrUrl !== '/scanners/default_upi.png'
    ? payload.qrUrl
    : `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(encodedUpiUrl)}`;

  return (
    <>
      <div className="flex flex-col items-center w-full my-6">
        <div className="w-full max-w-lg bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl -mr-16 -mt-16" />
          
          <div className="flex items-center gap-4 mb-10">
            <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
              <CreditCard className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h4 className="text-xl font-black tracking-tight">Payment Fulfillment</h4>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Structured Disbursement</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-10">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Primary Bank</p>
              <p className="text-sm font-black tracking-tight">{payload.bankName}</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Account Number</p>
              <p className="text-sm font-black tracking-tight">{payload.accountNumber}</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">IFSC Routing</p>
              <p className="text-sm font-black tracking-tight font-mono">{payload.ifscCode}</p>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">UPI Identifier</p>
              <p className="text-sm font-black tracking-tight">{payload.upiId}</p>
            </div>
          </div>

          <div 
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-6 p-6 bg-white/5 border border-white/10 rounded-3xl group cursor-pointer hover:bg-white/10 transition-all animate-pulse"
          >
            <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-xl shadow-black/20">
              <QrCode className="h-7 w-7 text-slate-900" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">UPI QR Scanner</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Digital Matrix Attached</p>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-700 group-hover:text-blue-400 transition-colors animate-bounce" />
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Governance Verified</span>
            </div>
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
              {isMounted ? new Date(timestamp).toLocaleTimeString() : '--:--'}
            </span>
          </div>
        </div>
      </div>

      {showQrModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-8 animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-white rounded-[3rem] p-10 border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] relative overflow-hidden text-center flex flex-col items-center">
            <button 
              onClick={() => setShowQrModal(false)} 
              className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 border border-blue-100">
              <QrCode className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Dispatched QR Code</h3>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 mb-8">Scan to pay preview for tenant</p>
            
            <div className="bg-slate-50 p-4 rounded-[2rem] border border-slate-100 mb-8 flex items-center justify-center h-64 w-64 shadow-inner">
              <img 
                src={qrCodeUrl}
                alt="UPI Payment QR Code"
                className="h-56 w-56 object-contain rounded-xl"
              />
            </div>
            
            <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-900">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Account Name</p>
              <p className="text-xs font-black text-slate-700 mt-1">{payload.accountHolder || 'FreightFlow'}</p>
              <p className="text-[10px] font-black text-blue-600 mt-2">{payload.upiId}</p>
            </div>
          </div>
        </div>
      )}
    </>
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
        toast.success('Governance Key Dispatched');
        window.location.reload();
      }
    } catch (err) {
      toast.error('Dispatch Failure');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-8 animate-in fade-in duration-300">
      <div className="w-full max-w-xl bg-white border border-slate-100 rounded-[3.5rem] p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2.5 bg-blue-600" />
        
        <button onClick={onClose} className="absolute top-10 right-10 text-slate-300 hover:text-slate-900 transition-colors">
          <X className="h-7 w-7" />
        </button>

        <div className="flex flex-col items-center text-center mb-12">
          <div className="h-24 w-24 bg-blue-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/30 rotate-3">
            <Key className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Governance Access</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">Cryptographic Matrix Generation</p>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Platform Tier</label>
              <select 
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full h-14 bg-slate-50 border-slate-100 text-slate-900 rounded-2xl font-black text-sm px-6 focus:ring-0 focus:border-blue-600 outline-none shadow-inner cursor-pointer"
              >
                <option value="starter">Starter Suite</option>
                <option value="pro">Professional Core</option>
                <option value="enterprise">Enterprise Global</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Matrix Validity</label>
              <select 
                value={years}
                onChange={(e) => setYears(e.target.value)}
                className="w-full h-14 bg-slate-50 border-slate-100 text-slate-900 rounded-2xl font-black text-sm px-6 focus:ring-0 focus:border-blue-600 outline-none shadow-inner cursor-pointer"
              >
                <option value="1">12 Months</option>
                <option value="2">24 Months</option>
                <option value="3">36 Months</option>
                <option value="5">60 Months</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Node Capacity</label>
              <Input 
                type="number"
                value={maxUsers}
                onChange={(e) => setMaxUsers(e.target.value)}
                className="h-14 bg-slate-50 border-slate-100 text-slate-900 rounded-2xl font-black text-sm px-6 shadow-inner"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Fleet Integration</label>
              <Input 
                type="number"
                value={maxVehicles}
                onChange={(e) => setMaxVehicles(e.target.value)}
                className="h-14 bg-slate-50 border-slate-100 text-slate-900 rounded-2xl font-black text-sm px-6 shadow-inner"
              />
            </div>
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full h-20 bg-slate-900 hover:bg-black text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] mt-6 flex items-center justify-center gap-4 shadow-2xl shadow-slate-200 transition-all active:scale-[0.98]"
          >
            {isGenerating ? <Loader2 className="h-6 w-6 animate-spin" /> : (
              <>
                <Zap className="h-5 w-5 fill-white" />
                Dispatch Governance Key
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

