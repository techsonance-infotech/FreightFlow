import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '3xl';
}

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '3xl': 'max-w-[90vw]',
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      <div className={`relative w-full ${sizes[size]} rounded-3xl bg-white shadow-2xl shadow-slate-900/30 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-300`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-50 px-8 py-6">
          <div>
            <h3 className="text-xl font-black tracking-tight text-slate-900">{title}</h3>
            <div className="mt-1 h-1 w-10 bg-blue-600 rounded-full" />
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            ✕
          </Button>
        </div>

        {/* Content */}
        <div className="max-h-[75vh] overflow-y-auto px-8 py-8 custom-scrollbar">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-slate-50 bg-slate-50/50 px-8 py-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
