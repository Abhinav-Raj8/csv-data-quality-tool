import React, { useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { useData } from '../../store/dataStore';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

function NavIcon({ path }: { path: string }) {
  const icons: Record<string, React.ReactNode> = {
    '/': (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    '/raw-data': (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    '/errors': (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    '/reconciliation': (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    '/clean-data': (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };
  return <>{icons[path] ?? null}</>;
}

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const { errorLog, rawData, metrics } = useData();
  const location = useLocation();

  const navItems: NavItem[] = [
    { to: '/',               label: 'Overview',        icon: <NavIcon path="/" /> },
    { to: '/raw-data',       label: 'Raw Data',        icon: <NavIcon path="/raw-data" />,       badge: rawData.length },
    { to: '/errors',         label: 'Errors',          icon: <NavIcon path="/errors" />,          badge: errorLog.filter(e => e.status === 'open').length },
    { to: '/reconciliation', label: 'Reconciliation',  icon: <NavIcon path="/reconciliation" /> },
    { to: '/clean-data',     label: 'Clean Data',      icon: <NavIcon path="/clean-data" /> },
  ];

  return (
    <aside className="flex flex-col h-full w-60 bg-surface-50 border-r border-white/8 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/8">
        <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-100 leading-tight truncate">DQ&R System</p>
          <p className="text-[10px] text-slate-500 truncate">Data Quality Tool</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto text-slate-500 hover:text-slate-200 lg:hidden">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Quality Score mini */}
      {metrics && (
        <div className="mx-3 mt-3 p-3 bg-surface-200 rounded-lg border border-white/6">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">Quality Score</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white/10 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full transition-all duration-700"
                style={{
                  width: `${metrics.qualityScore}%`,
                  backgroundColor:
                    metrics.qualityScore >= 80 ? '#10b981' :
                    metrics.qualityScore >= 60 ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>
            <span className={`text-xs font-semibold ${
              metrics.qualityScore >= 80 ? 'text-emerald-400' :
              metrics.qualityScore >= 60 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {metrics.qualityScore}%
            </span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        <p className="px-2 mb-2 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">Navigation</p>
        <ul className="space-y-0.5">
          {navItems.map(item => {
            const isActive = location.pathname === item.to;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    text-sm font-medium transition-all duration-150 group
                    ${isActive
                      ? 'bg-brand-600/25 text-brand-300 border border-brand-600/30'
                      : 'text-slate-400 hover:bg-white/6 hover:text-slate-200'
                    }
                  `}
                  onClick={onClose}
                >
                  <span className={`shrink-0 ${isActive ? 'text-brand-400' : 'group-hover:text-slate-300'}`}>
                    {item.icon}
                  </span>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`
                      text-[10px] font-semibold px-1.5 py-0.5 rounded-full
                      ${isActive ? 'bg-brand-600/40 text-brand-300' : 'bg-white/10 text-slate-500'}
                    `}>
                      {item.badge > 9999 ? '9999+' : item.badge.toLocaleString()}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/8">
        <p className="text-[10px] text-slate-600">v1.0.0 · Browser Only</p>
      </div>
    </aside>
  );
}
