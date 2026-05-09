'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Loader2, User, Shield, 
  CheckCircle2, AlertCircle, Zap,
  Building2, Users, Truck,
  Camera, Image as ImageIcon, X, 
  CreditCard, QrCode, ArrowRight,
  ExternalLink, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { createLicenseRequest, sendSupportMessage, submitPaymentProof } from '@/app/actions/license-request';
import { toast } from 'sonner';
import { PaymentProofCard } from '@/components/admin/support/shared-cards';

interface Message {
  id: string;
  message: string;
  isAction: boolean;
  createdAt: any;
  sender?: { name: string; role: string } | null;
  admin?: { email: string; role: string } | null;
}

interface LicenseRequest {
  id: string;
  planType: string;
  status: string;
  messages: Message[];
}

interface LicenseChatProps {
  initialRequest: LicenseRequest | null;
}

const PLANS = [
  { id: 'starter', name: 'Starter', price: '₹4,999/mo', icon: <Building2 className="h-5 w-5" />, features: ['Up to 5 Users', 'Up to 10 Vehicles', 'Basic Reporting'] },
  { id: 'pro', name: 'Professional', price: '₹9,999/mo', icon: <Truck className="h-5 w-5" />, features: ['Unlimited Users', 'Up to 50 Vehicles', 'Advanced Analytics'] },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom', icon: <Shield className="h-5 w-5" />, features: ['Custom Fleet Size', 'Priority Support', 'Full Integration'] },
];

export function LicenseChat({ initialRequest }: LicenseChatProps) {
  const [request, setRequest] = useState<LicenseRequest | null>(initialRequest);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showProofForm, setShowProofForm] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [request?.messages]);

  const handleRequestLicense = async (planId: string) => {
    setIsLoading(true);
    try {
      const res = await createLicenseRequest(planId);
      if (res.success) {
        toast.success('License request submitted!');
        // Ideally we'd fetch the full request here, but for now we'll reload
        window.location.reload();
      } else {
        toast.error(res.error);
      }
    } catch (err) {
      toast.error('Failed to submit request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !request) return;

    const text = message.trim();
    setMessage('');
    
    try {
      const res = await sendSupportMessage(request.id, text);
      if (!res.success) {
        toast.error('Failed to send message');
      }
    } catch (err) {
      toast.error('Connection error');
    }
  };

  if (!request) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {PLANS.map((plan) => (
          <div key={plan.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group">
            <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              {plan.icon}
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{plan.name}</h3>
            <div className="text-2xl font-black text-blue-600 mb-6">{plan.price}</div>
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-500 font-bold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button 
              onClick={() => handleRequestLicense(plan.id)}
              disabled={isLoading}
              className="w-full h-12 bg-slate-900 hover:bg-blue-600 rounded-xl font-bold"
            >
              Select Plan
            </Button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col h-[600px]">
      {/* Chat Header */}
      <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 tracking-tight">Active Request: {request.planType.toUpperCase()}</h3>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Support Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
            request.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
          )}>
            Status: {request.status}
          </span>
        </div>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6">
        {request.messages.map((msg: any) => {
          const isSystem = msg.isAction;
          const isAdmin = !!msg.admin;
          
          if (msg.type === 'PAYMENT_INFO') {
            return <TenantPaymentCard key={msg.id} payload={msg.payload} timestamp={msg.createdAt} isMounted={isMounted} />;
          }

          if (msg.type === 'PAYMENT_PROOF') {
            return <PaymentProofCard key={msg.id} msg={msg} isMounted={isMounted} isAdminView={false} />;
          }

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center">
                <div className="bg-slate-50 px-4 py-2 rounded-full border border-slate-100 flex items-center gap-2">
                  <Zap className="h-3 w-3 text-amber-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{msg.message}</span>
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className={cn(
              "flex flex-col max-w-[80%]",
              isAdmin ? "self-start" : "self-end items-end"
            )}>
              <div className={cn(
                "p-4 rounded-2xl shadow-sm border",
                isAdmin 
                  ? "bg-white border-slate-100 text-slate-700 rounded-tl-none" 
                  : "bg-blue-600 border-blue-600 text-white rounded-tr-none"
              )}>
                <p className="text-sm font-bold leading-relaxed">{msg.message}</p>
              </div>
              <span className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                {isAdmin ? 'Super Admin' : 'You'} • {isMounted ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Input area */}
      <div className="p-6 border-t border-slate-50 bg-white">
        <div className="flex items-center gap-3 mb-4 ml-1">
          <button 
            onClick={() => setShowProofForm(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all"
          >
            <Camera className="h-3 w-3" />
            Attach Payment Proof
          </button>
        </div>
        <form onSubmit={handleSendMessage} className="flex gap-4">
          <Input 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 h-12 bg-slate-50 border-slate-100 rounded-xl font-bold"
          />
          <Button 
            type="submit" 
            disabled={!message.trim()}
            className="h-12 w-12 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>

      {showProofForm && (
        <ProofSubmissionModal 
          requestId={request.id} 
          onClose={() => setShowProofForm(false)} 
        />
      )}
    </div>
  );
}

function TenantPaymentCard({ payload, timestamp, isMounted }: any) {
  return (
    <div className="flex flex-col items-center w-full my-6 animate-in slide-in-from-left-4 duration-500">
      <div className="w-full max-w-lg bg-white border border-slate-100 rounded-[2.5rem] p-10 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16" />
        
        <div className="flex items-center gap-4 mb-10">
          <div className="h-14 w-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h4 className="text-xl font-black text-slate-900 tracking-tight">Payment Instructions</h4>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600">Official Platform Disbursement</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Bank Name</p>
            <p className="text-sm font-black text-slate-900">{payload.bankName}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Account Holder</p>
            <p className="text-sm font-black text-slate-900">{payload.accountHolder}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">A/C Number</p>
            <p className="text-sm font-black text-slate-900 font-mono tracking-wider">{payload.accountNumber}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">IFSC Code</p>
            <p className="text-sm font-black text-slate-900 font-mono">{payload.ifscCode}</p>
          </div>
        </div>

        <div className="flex items-center gap-6 p-6 bg-blue-600 rounded-[2rem] text-white shadow-xl shadow-blue-100 group cursor-pointer hover:bg-blue-700 transition-all">
          <div className="h-12 w-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0 border border-white/20">
            <QrCode className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">UPI ID: {payload.upiId}</p>
            <p className="text-[9px] font-bold text-blue-100 uppercase tracking-widest">Click to view QR Scanner</p>
          </div>
          <ArrowRight className="h-5 w-5 text-blue-200 group-hover:translate-x-1 transition-transform" />
        </div>

        <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Verified Governance Card</span>
          </div>
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
            {isMounted ? new Date(timestamp).toLocaleTimeString() : '--:--'}
          </span>
        </div>
      </div>
    </div>
  );
}

function ProofSubmissionModal({ requestId, onClose }: { requestId: string, onClose: () => void }) {
  const [transactionId, setTransactionId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!imageUrl) {
      toast.error('Please attach a screenshot or provide an image URL');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitPaymentProof(requestId, imageUrl, transactionId);
      if (res.success) {
        toast.success('Payment proof submitted for verification');
        onClose();
        window.location.reload();
      }
    } catch (err) {
      toast.error('Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-8 animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white border border-slate-100 rounded-[3.5rem] p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2.5 bg-emerald-500" />
        
        <button onClick={onClose} className="absolute top-10 right-10 text-slate-300 hover:text-slate-900 transition-colors">
          <X className="h-7 w-7" />
        </button>

        <div className="flex flex-col items-center text-center mb-10">
          <div className="h-20 w-20 bg-emerald-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/20 rotate-6">
            <Camera className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Submit Proof</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">Payment Verification Matrix</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Transaction ID (Optional)</label>
            <Input 
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="UPI/Ref Number"
              className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Screenshot URL</label>
            <Input 
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold"
            />
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-2 italic">* Uploading support coming soon. Please provide a direct image link for now.</p>
          </div>

          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full h-16 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/30 transition-all active:scale-[0.98]"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
            Confirm Submission
          </Button>
        </div>
      </div>
    </div>
  );
}
