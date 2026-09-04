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
import type { CleanedRecord } from '../types';
import { exportCleanedData } from '../lib/export';

export const Route = createFileRoute('/clean-data')({
  component: CleanDataPage,
});

function CleanDataPage() {
  const { cleanedData, rawData, isValidating, hasRunValidation, filters } = useData();

  const filtered = useMemo(() => {
    const search = filters.searchText.toLowerCase().trim();
    const ps     = filters.paymentStatus;
    const vs     = filters.validationStatus; // reuse for modified/clean

    return cleanedData.filter(row => {
      if (ps && row.Payment_Status !== ps) return false;
      if (vs === 'valid'   && row._issues_remaining.length > 0) return false;
      if (vs === 'invalid' && row._issues_remaining.length === 0) return false;
      if (search) {
        return (
          row.Order_ID.toLowerCase().includes(search) ||
          row.Customer_Name.toLowerCase().includes(search) ||
          row.Email.toLowerCase().includes(search)
        );
      }
      return true;
    });
  }, [cleanedData, filters]);

  const modified      = cleanedData.filter(r => r._was_modified).length;
  const withIssues    = cleanedData.filter(r => r._issues_remaining.length > 0).length;
  const removed       = rawData.length - cleanedData.length;

  const columns = [
    { key: 'row_number',      header: '#',              mono: true,  width: 'w-12' },
    {
      key: '_original_row',
      header: 'Orig Row',
      mono: true,
      width: 'w-16',
      render: (row: CleanedRecord) => (
        <span className="text-slate-500 font-mono text-xs">{row._original_row}</span>
      ),
    },
    {
      key: '_was_modified',
      header: 'Modified',
      sortable: false,
      render: (row: CleanedRecord) => (
        row._was_modified
          ? <Badge variant="warning">Modified</Badge>
          : <span className="text-slate-600 text-xs">—</span>
      ),
    },
    { key: 'Order_ID',        header: 'Order ID',        mono: true },
    { key: 'Customer_Name',   header: 'Customer Name'               },
    { key: 'Email',           header: 'Email',           mono: true },
    { key: 'Order_Date',      header: 'Date',            mono: true },
    { key: 'Product',         header: 'Product'                     },
    { key: 'Order_Amount',    header: 'Order Amt',       mono: true },
    { key: 'Payment_Status',  header: 'Status',
      render: (row: CleanedRecord) => {
        const VALID = new Set(['Completed','Pending','Failed','Refunded','Processing']);
        const v = String(row.Payment_Status).trim();
        if (!v) return <Badge variant="missing">blank</Badge>;
        if (!VALID.has(v)) return <Badge variant="invalid">{v}</Badge>;
        return <Badge variant="valid">{v}</Badge>;
      },
    },
    {
      key: '_issues_remaining',
      header: 'Remaining Issues',
      sortable: false,
      render: (row: CleanedRecord) => (
        row._issues_remaining.length > 0 ? (
          <span className="text-xs text-orange-400" title={row._issues_remaining.join('\n')}>
            {row._issues_remaining.length} issue{row._issues_remaining.length > 1 ? 's' : ''}
          </span>
        ) : (
          <span className="text-xs text-emerald-500">✓ Clean</span>
        )
      ),
    },
  ];

  if (isValidating) return <LoadingSpinner label="Cleaning dataset…" />;

  if (!hasRunValidation) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-500">
        <p className="text-sm">Run Validation to generate the cleaned dataset.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">

      {/* Cleaning summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Clean Records"
          value={cleanedData.length.toLocaleString()}
          subtitle="After deduplication"
          accent="text-emerald-400"
        />
        <MetricCard
          title="Rows Removed"
          value={removed.toLocaleString()}
          subtitle="Exact duplicates dropped"
          accent="text-purple-400"
        />
        <MetricCard
          title="Modified"
          value={modified.toLocaleString()}
          subtitle="Auto-corrected fields"
          accent="text-yellow-400"
        />
        <MetricCard
          title="Still Has Issues"
          value={withIssues.toLocaleString()}
          subtitle="Require manual review"
          accent="text-orange-400"
        />
      </div>

      {/* Cleaning operations banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Whitespace trimmed',            icon: '✂', color: 'text-brand-400' },
          { label: 'Names title-cased',              icon: 'Aa', color: 'text-brand-400' },
          { label: 'Dates normalized to ISO 8601',   icon: '📅', color: 'text-brand-400' },
        ].map(op => (
          <div key={op.label} className="flex items-center gap-2.5 px-3 py-2 bg-brand-600/8 border border-brand-600/15 rounded-lg">
            <span className="text-sm">{op.icon}</span>
            <span className={`text-xs ${op.color}`}>{op.label}</span>
          </div>
        ))}
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-200">Cleaned Dataset</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {filtered.length.toLocaleString()} of {cleanedData.length.toLocaleString()} records shown — original data is never modified
            </p>
          </div>
          <Button
            variant="success"
            size="sm"
            onClick={() => exportCleanedData(cleanedData)}
            id="export-cleaned-btn"
            icon={
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            }
          >
            Export Cleaned CSV
          </Button>
        </div>
        <SearchFilter showPaymentStatus showValidationStatus />
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
