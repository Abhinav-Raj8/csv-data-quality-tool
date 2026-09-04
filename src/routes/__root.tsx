import React, { useState } from 'react';
import {
  createRootRoute,
  Outlet,
} from '@tanstack/react-router';
import { Sidebar } from '../components/layout/Sidebar';
import { TopBar } from '../components/layout/TopBar';
import { useLocation } from '@tanstack/react-router';

function RootComponent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
    '/':               { title: 'Overview',               subtitle: 'Data quality summary and key metrics' },
    '/raw-data':       { title: 'Raw Data',               subtitle: 'Imported dataset — unmodified' },
    '/errors':         { title: 'Error Log',              subtitle: 'All detected data quality issues' },
    '/reconciliation': { title: 'Order vs Payment Reconciliation', subtitle: 'Compare order amounts against payment records' },
    '/clean-data':     { title: 'Clean Data',             subtitle: 'Processed and deduplicated dataset' },
  };

  const { title, subtitle } = PAGE_TITLES[location.pathname] ?? { title: 'DQ&R System', subtitle: '' };

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — desktop always visible, mobile slide-in */}
      <div className={`
        fixed inset-y-0 left-0 z-40 lg:relative lg:flex lg:z-auto
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setSidebarOpen(v => !v)}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto p-5 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});
