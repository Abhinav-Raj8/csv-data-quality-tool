import React, { useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useData } from '../store/dataStore';
import { DataTable } from '../components/ui/DataTable';
import { Badge } from '../components/ui/Badge';
import { SearchFilter } from '../components/ui/SearchFilter';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Card } from '../components/ui/Card';
import { MetricCard } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import type { ErrorLogEntry } from '../types';
import { exportErrorLog } from '../lib/export';

export const Route = createFileRoute('/errors')({
  component: ErrorsPage,
});

function ErrorsPage() {
  const { errorLog, isValidating, hasRunValidation, updateErrorStatus, filters } = useData();
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = useMemo(() => {
    const search = filters.searchText.toLowerCase().trim();
    const it     = filters.issueType;

    return errorLog.filter(e => {
      if (statusFilter && e.status !== statusFilter) return false;
      if (it && e.issueType !== it) return false;
      if (search) {
        return (
          e.Order_ID.toLowerCase().includes(search) ||
          e.field.toLowerCase().includes(search) ||
          e.originalValue.toLowerCase().includes(search)
        );
      }
      return true;
    });
  }, [errorLog, filters, statusFilter]);

  // Stats
  const open     = errorLog.filter(e => e.status === 'open').length;
  const resolved = errorLog.filter(e => e.status === 'resolved').length;
  const flagged  = errorLog.filter(e => e.status === 'flagged').length;

  const columns = [
    { key: 'row',             header: 'Row',       mono: true,  width: 'w-14' },
    { key: 'Order_ID',        header: 'Order ID',  mono: true },
    { key: 'field',           header: 'Field',     mono: true },
    {
      key: 'issueType',
      header: 'Issue Type',
      render: (row: ErrorLogEntry) => <Badge variant={row.issueType}>{row.issueType}</Badge>,
    },
    {
      key: 'originalValue',
      header: 'Original Value',
      mono: true,
      render: (row: ErrorLogEntry) => (
        <span className="font-mono text-xs text-slate-400 italic">
          {row.originalValue || <span className="text-red-400 not-italic">blank</span>}
        </span>
      ),
    },
    { key: 'message',         header: 'Message' },
    { key: 'suggestedAction', header: 'Suggested Action' },
    {
      key: 'status',
      header: 'Status',
      render: (row: ErrorLogEntry) => (
        <div className="flex items-center gap-1.5">
          <Badge variant={row.status}>{row.status}</Badge>
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      sortable: false,
      render: (row: ErrorLogEntry) => (
        <div className="flex items-center gap-1">
          {row.status !== 'resolved' && (
            <button
              onClick={() => updateErrorStatus(row.id, 'resolved')}
              className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 transition-colors"
              title="Mark resolved"
            >✓</button>
          )}
          {row.status !== 'flagged' && (
            <button
              onClick={() => updateErrorStatus(row.id, 'flagged')}
              className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/40 transition-colors"
              title="Flag for review"
            >⚑</button>
          )}
          {row.status !== 'open' && (
            <button
              onClick={() => updateErrorStatus(row.id, 'open')}
              className="text-[10px] px-1.5 py-0.5 rounded bg-red-600/20 text-red-400 hover:bg-red-600/40 transition-colors"
              title="Reopen"
            >↺</button>
          )}
        </div>
      ),
    },
  ];

  if (isValidating) return <LoadingSpinner label="Building error log…" />;

  if (!hasRunValidation) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-500">
        <p className="text-sm">Run Validation to see the error log.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Total Issues"    value={errorLog.length.toLocaleString()}  accent="text-slate-300" />
        <MetricCard title="Open"            value={open.toLocaleString()}             accent="text-red-400" />
        <MetricCard title="Flagged"         value={flagged.toLocaleString()}          accent="text-yellow-400" />
        <MetricCard title="Resolved"        value={resolved.toLocaleString()}         accent="text-emerald-400" />
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-200">Error Log</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {filtered.length.toLocaleString()} of {errorLog.length.toLocaleString()} issues shown
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-surface-200 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-brand-500/60"
              id="error-status-filter"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="flagged">Flagged</option>
              <option value="resolved">Resolved</option>
            </select>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => exportErrorLog(errorLog)}
              id="export-errors-btn"
            >
              Export Log
            </Button>
          </div>
        </div>
        <SearchFilter showIssueType />
      </Card>

      <DataTable
        columns={columns as Parameters<typeof DataTable>[0]['columns']}
        data={filtered as unknown as Record<string, unknown>[]}
        rowKey={row => String(row['id'])}
        pageSize={50}
        emptyMessage="No issues match your filters."
        compact
      />
    </div>
  );
}
