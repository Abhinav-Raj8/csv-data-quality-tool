import React from 'react';

export function LoadingSpinner({ size = 'md', label = 'Loading…' }: { size?: 'sm' | 'md' | 'lg'; label?: string }) {
  const sizeMap = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500">
      <div
        className={`${sizeMap[size]} border-2 border-brand-500 border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label={label}
      />
      <p className="text-sm animate-pulse-slow">{label}</p>
    </div>
  );
}
