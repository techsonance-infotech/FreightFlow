import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-900 transition-all placeholder:text-slate-300 placeholder:font-medium hover:border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10",
              icon && "pl-12",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/10",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-[10px] font-bold text-red-600 px-1 uppercase tracking-wider">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
