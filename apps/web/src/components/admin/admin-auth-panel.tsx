import { Shield } from 'lucide-react';
import Image from 'next/image';

/**
 * Redesigned left panel for Super Admin auth page.
 * Uses the same premium aesthetic as the owner-side but with Admin branding.
 */
export function AdminAuthPanel() {
  return (
    <div className="hidden lg:flex lg:flex-col relative min-h-screen overflow-hidden bg-[#0B1E3A]">
      {/* Full Panel Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/dashboard-graphic.png"
          alt="FreightFlow Dashboard Background"
          fill
          className="object-cover object-left opacity-50"
          priority
        />
        {/* Deep navy overlay to integrate the image and ensure text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1E3A]/90 via-[#0B1E3A]/50 to-[#0F2A4D]/95 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[#0B1E3A]/20" />
      </div>

      {/* Subtle radial glow for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_70%)] z-10 pointer-events-none" />

      {/* Top-left branding */}
      <div className="pt-10 px-10 flex items-center gap-4 relative z-20">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 rotate-3">
          <Shield className="h-7 w-7 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight leading-tight">FreightFlow</h2>
          <p className="text-[10px] text-blue-400 font-bold tracking-[0.3em] uppercase">Super Admin Portal</p>
        </div>
      </div>

      {/* Spacer to push typography to bottom */}
      <div className="flex-1" />

      {/* Typography (Bottom-Left - Compact) */}
      <div className="pb-10 px-10 relative z-20">
        <div className="max-w-[400px]">
          <h3 className="text-3xl font-bold leading-tight tracking-tight mb-4 drop-shadow-lg text-white">
            Platform Governance. <br />
            <span className="text-blue-500">Unrestricted Control.</span>
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed font-semibold drop-shadow-md opacity-90">
            Monitor global performance, manage multi-tenant lifecycles, and maintain system integrity from the centralized command interface.
          </p>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="px-10 py-4 border-t border-white/5 relative z-20 flex items-center justify-between bg-black/10 backdrop-blur-sm">
        <p className="text-[9px] text-white/40 uppercase tracking-[0.4em] font-bold">
          Enterprise Governance Edition
        </p>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Secure Core</span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
