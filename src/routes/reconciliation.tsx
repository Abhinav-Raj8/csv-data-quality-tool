import React, { useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useData } from '../store/dataStore';
import { DataTable } from '../components/ui/DataTable';
import { Badge } from '../components/ui/Badge';
import { SearchFilter } from '../components/ui/SearchFilter';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Card } from '../components/ui/Card';
import { MetricCard } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import type { ReconciliationEntry } from '../types';
import { exportReconciliation } from '../lib/export';

export const Route = createFileRoute('/reconciliation')({
  component: ReconciliationPage,
});

function ReconciliationPage() {
  const { reconciliationData, reconciliationSummary, isValidating, hasRunValidation, filters, setFilters } = useData();

  const filtered = useMemo(() => {
    const search = filters.searchText.toLowerCase().trim();
    const ps     = filters.paymentStatus; // reuse for reconciliation status

    return reconciliationData.filter(e => {
      if (ps && e.status !== ps) return false;
      if (search) {
        return (
          e.Order_ID.toLowerCase().includes(search) ||
          e.Customer_Name.toLowerCase().includes(search) ||
          e.Payment_ID.toLowerCase().includes(search)
        );
      }
      return true;
    });
  }, [reconciliationData, filters]);

  const columns = [
    { key: 'row_number',    header: '#',              mono: true, width: 'w-12' },
    { key: 'Order_ID',      header: 'Order ID',        mono: true },
    { key: 'Customer_Name', header: 'Customer'                   },
    { key: 'Order_Date',    header: 'Date',            mono: true },
    { key: 'Payment_ID',    header: 'Payment ID',      mono: true },
    {
      key: 'Order_Amount',
      header: 'Order Amt ($)',
      mono: true,
      render: (row: ReconciliationEntry) => (
        <span>${Number(row.Order_Amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      ),
    },
    {
      key: 'Payment_Amount',
      header: 'Pay Amt ($)',
      mono: true,
      render: (row: ReconciliationEntry) => (
        <span>${Number(row.Payment_Amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      ),
    },
    {
      key: 'Difference',
      header: 'Difference ($)',
      mono: true,
      render: (row: ReconciliationEntry) => {
        const d = row.Difference;
        const cls = d > 0 ? 'text-orange-400' : d < 0 ? 'text-red-400' : 'text-emerald-400';
        return (
          <span className={`font-mono ${cls}`}>
            {d !== 0 ? (d > 0 ? '+' : '') : ''}
            ${Math.abs(d).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: ReconciliationEntry) => <Badge variant={row.status}>{row.status}</Badge>,
    },
  ];

  if (isValidating) return <LoadingSpinner label="Computing reconciliation…" />;

  if (!hasRunValidation) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-500">
        <p className="text-sm">Run Validation to see reconciliation results.</p>
      </div>
    );
  }

  const s = reconciliationSummary;

  return (
    <div className="flex flex-col gap-5 animate-fade-in">

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Orders"
          value={s?.total.toLocaleString() ?? '—'}
          accent="text-brand-400"
        />
        <MetricCard
          title="Matched"
          value={s?.matched.toLocaleString() ?? '—'}
          subtitle={s ? `${((s.matched / s.total) * 100).toFixed(1)}% of total` : ''}
          accent="text-emerald-400"
        />
        <MetricCard
          title="Mismatch"
          value={s?.mismatched.toLocaleString() ?? '—'}
          subtitle={s ? `${((s.mismatched / s.total) * 100).toFixed(1)}% of total` : ''}
          accent="text-orange-400"
        />
        <MetricCard
          title="Missing Payment"
          value={s?.missingPayment.toLocaleString() ?? '—'}
          subtitle={s ? `${((s.missingPayment / s.total) * 100).toFixed(1)}% of total` : ''}
          accent="text-red-400"
        />
      </div>

      {/* Total mismatch amount banner */}
      {s && s.totalMismatchAmount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
          <svg className="h-4 w-4 text-orange-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-orange-300">
            Total mismatch amount:{' '}
            <strong className="text-orange-200">
              ${s.totalMismatchAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </strong>
            {' '}across <strong>{s.mismatched}</strong> mismatched orders
          </p>
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-200">Reconciliation Detail</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {filtered.length.toLocaleString()} of {reconciliationData.length.toLocaleString()} records shown
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filters.paymentStatus}
              onChange={e => setFilters({ ...filters, paymentStatus: e.target.value })}
              className="bg-surface-200 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-500/60"
              id="recon-status-filter"
            >
              <option value="">All Statuses</option>
              <option value="Matched">Matched</option>
              <option value="Mismatch">Mismatch</option>
              <option value="Missing Payment">Missing Payment</option>
            </select>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => exportReconciliation(reconciliationData)}
              id="export-reconciliation-btn"
            >
              Export Report
            </Button>
          </div>
        </div>
        <SearchFilter />
      </Card>

      <DataTable
        columns={columns as Parameters<typeof DataTable>[0]['columns']}
        data={filtered as unknown as Record<string, unknown>[]}
        rowKey={row => String(row['row_number'])}
        pageSize={50}
        emptyMessage="No records match your filters."
        compact
      />
    </div>
  );
}
