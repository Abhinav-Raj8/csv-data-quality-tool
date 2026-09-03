import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  hover?: boolean;
}

export function Card({ children, className = '', padding = true, hover = false }: CardProps) {
  return (
    <div
      className={`
        bg-surface-100 border border-white/8 rounded-xl
        ${padding ? 'p-5' : ''}
        ${hover ? 'hover:border-brand-500/40 hover:bg-surface-50 transition-all duration-200 cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  accent?: string;
  trend?: { value: number; label: string };
}

export function MetricCard({ title, value, subtitle, icon, accent = 'text-brand-400', trend }: MetricCardProps) {
  return (
    <Card className="flex flex-col gap-3 animate-fade-in">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{title}</p>
        {icon && (
          <div className={`p-2 rounded-lg bg-white/5 ${accent}`}>
            {icon}
          </div>
        )}
      </div>
      <div>
        <p className={`text-3xl font-bold ${accent}`}>{value}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        {trend && (
          <p className={`text-xs mt-1 ${trend.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)} {trend.label}
          </p>
        )}
      </div>
    </Card>
  );
}
