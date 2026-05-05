import React from 'react';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'link' | 'default';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  icon?: React.ReactNode;
  asChild?: boolean;
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  asChild = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95',
    default: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95',
    secondary: 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95',
    outline: 'border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-95',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20 active:scale-95',
    ghost: 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 active:scale-95',
    link: 'text-blue-600 hover:underline underline-offset-4 p-0 h-auto font-black',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-bold',
    md: 'px-5 py-2.5 text-sm font-bold',
    lg: 'px-8 py-3.5 text-base font-bold',
    icon: 'p-2',
  };

  return (
    <Comp
      className={cn(
        'inline-flex items-center justify-center rounded-xl transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-widest',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {loading ? (
        <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </Comp>
  );
}
