import React from 'react';
import type { IssueType, ReconciliationStatus } from '../../types';

type BadgeVariant = IssueType | ReconciliationStatus | 'open' | 'resolved' | 'flagged' | 'default';

const VARIANT_CLASSES: Record<string, string> = {
  valid:           'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  missing:         'bg-red-500/15 text-red-400 border border-red-500/30',
  invalid:         'bg-orange-500/15 text-orange-400 border border-orange-500/30',
  duplicate:       'bg-purple-500/15 text-purple-400 border border-purple-500/30',
  warning:         'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  Matched:         'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  Mismatch:        'bg-orange-500/15 text-orange-400 border border-orange-500/30',
  'Missing Payment':'bg-red-500/15 text-red-400 border border-red-500/30',
  open:            'bg-red-500/15 text-red-400 border border-red-500/30',
  resolved:        'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  flagged:         'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  default:         'bg-slate-500/15 text-slate-400 border border-slate-500/30',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  const classes = VARIANT_CLASSES[variant as string] ?? VARIANT_CLASSES.default;
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full
        text-xs font-medium tracking-wide whitespace-nowrap
        ${classes} ${className}
      `}
    >
      {children}
    </span>
  );
}
