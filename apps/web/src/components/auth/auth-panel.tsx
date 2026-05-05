import { Truck } from 'lucide-react';
import Image from 'next/image';

/**
 * Shared left panel for all auth pages (Login, Register, Forgot Password).
 * Displays the FreightFlow branding with Navy gradient.
 */
export function AuthPanel() {
  return (
    <div className="hidden lg:flex lg:flex-col relative min-h-screen overflow-hidden bg-[#0B1E3A]">
      {/* Full Panel Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/dashboard-graphic.png"
          alt="FreightFlow Dashboard Background"
          fill
          className="object-cover object-left"
          priority
        />
        {/* Deep navy overlay to integrate the image and ensure text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1E3A]/80 via-[#0B1E3A]/30 to-[#0F2A4D]/90 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[#0B1E3A]/10" />
      </div>

      {/* Subtle radial glow for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)] z-10 pointer-events-none" />

      {/* Vignette effect */}
      <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.5)] z-10 pointer-events-none" />

      {/* Top-left branding */}
      <div className="pt-10 px-10 flex items-center gap-4 relative z-20">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl p-2">
          <Image
            src="/favicon_io/android-chrome-512x512.png"
            alt="FreightFlow Logo"
            width={36}
            height={36}
            className="object-contain"
            priority
          />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight leading-tight">FreightFlow</h2>
          <p className="text-[10px] text-slate-300 font-bold tracking-widest uppercase">Account. Manage. Move Ahead.</p>
        </div>
      </div>

      {/* Spacer to push typography to bottom */}
      <div className="flex-1" />

      {/* Typography (Bottom-Left - Compact) */}
      <div className="pb-0 px-10 relative z-20">
        <div className="max-w-[320px]">
          <h3 className="text-2xl font-bold leading-tight tracking-tight mb-2 drop-shadow-lg">
            <span className="text-white block">Every Trip. Every Rupee.</span>
            <span className="text-[#3B82F6] block">Every Mile — In Control.</span>
          </h3>
          <p className="text-slate-300 text-xs leading-relaxed font-semibold drop-shadow-md opacity-90">
            Manage LR bookings, fleet operations, accounting, and compliance — all from one powerful platform built for Indian transport businesses.
          </p>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="px-10 py-3 border-t border-white/5 relative z-20 flex items-center justify-between bg-black/5 backdrop-blur-sm">
        <p className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-bold">
          Enterprise Logistics Edition
        </p>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-white/30 uppercase tracking-widest font-bold">Live Status</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
