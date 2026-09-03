import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
type ButtonSize    = 'sm' | 'md' | 'lg';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:   'bg-brand-600 hover:bg-brand-500 text-white border border-brand-500 shadow-lg shadow-brand-500/20',
  secondary: 'bg-white/8 hover:bg-white/12 text-slate-200 border border-white/12',
  danger:    'bg-red-600/80 hover:bg-red-500 text-white border border-red-500/50 shadow-lg shadow-red-500/20',
  ghost:     'bg-transparent hover:bg-white/8 text-slate-300 border border-transparent hover:border-white/12',
  success:   'bg-emerald-600/80 hover:bg-emerald-500 text-white border border-emerald-500/50 shadow-lg shadow-emerald-500/20',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm:  'px-3 py-1.5 text-xs gap-1.5',
  md:  'px-4 py-2 text-sm gap-2',
  lg:  'px-5 py-2.5 text-sm gap-2',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function Button({
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  icon,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...rest}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg
        transition-all duration-150 cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:ring-offset-2 focus:ring-offset-surface-100
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}
      `}
    >
      {loading ? (
        <span className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
