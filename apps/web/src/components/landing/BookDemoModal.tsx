'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar } from 'lucide-react';

interface BookDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CAL_URL = "https://cal.id/techsonance-infotech/connect-with-founder?duration=15";

export default function BookDemoModal({ isOpen, onClose }: BookDemoModalProps) {
  const [mounted, setMounted] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      setIframeLoading(true);
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div
        className="relative z-10 w-full max-w-4xl h-[85vh] sm:h-[80vh] bg-[#0B1220] rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="relative px-6 sm:px-8 py-4 border-b border-white/5 bg-gradient-to-r from-[#0F1B2E] to-[#070F1E] shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3.5 pr-8">
            <div className="w-10 h-10 rounded-xl bg-ff-amber-500/10 border border-ff-amber-500/20 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-ff-amber-500" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                Schedule Your <span className="text-ff-amber-500">Free Consultation</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-white/50 font-medium mt-0.5">
                Pick a time that works for you — 15 min with our technical team.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer border border-white/5 shrink-0"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Embedded Cal.id iframe with loading state */}
        <div className="flex-1 relative bg-[#FAFBFD]">
          {iframeLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FAFBFD] z-10 gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#0F1B2E] animate-spin" />
              <p className="text-xs text-[#0F1B2E] font-semibold animate-pulse">
                Loading calendar...
              </p>
            </div>
          )}
          <iframe
            src={CAL_URL}
            title="Book a consultation with TechSonance"
            className="w-full h-full border-0"
            allow="calendar; payment"
            onLoad={() => setIframeLoading(false)}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
