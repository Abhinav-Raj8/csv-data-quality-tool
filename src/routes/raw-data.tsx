import React, { useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useData } from '../store/dataStore';
import { DataTable } from '../components/ui/DataTable';
import { Badge } from '../components/ui/Badge';
import { SearchFilter } from '../components/ui/SearchFilter';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Card } from '../components/ui/Card';
import type { OrderRecord, IssueType } from '../types';

export const Route = createFileRoute('/raw-data')({
  component: RawDataPage,
});

type RowWithStatus = OrderRecord & { _status: IssueType };

const COLUMNS = [
  { key: 'row_number',    header: '#',              mono: true,  width: 'w-12' },
  {
    key: '_status',
    header: 'Status',
    render: (row: RowWithStatus) => <Badge variant={row._status}>{row._status}</Badge>,
  },
  { key: 'Order_ID',      header: 'Order ID',        mono: true },
  { key: 'Customer_ID',   header: 'Customer ID',     mono: true },
  { key: 'Customer_Name', header: 'Customer Name'               },
  { key: 'Email',         header: 'Email',           mono: true },
  { key: 'Phone',         header: 'Phone',           mono: true },
  { key: 'Order_Date',    header: 'Date'                        },
  { key: 'Product',       header: 'Product'                     },
  { key: 'Quantity',      header: 'Qty',             mono: true },
  { key: 'Unit_Price',    header: 'Unit Price',      mono: true },
  { key: 'Order_Amount',  header: 'Order Amt',       mono: true },
  { key: 'Payment_ID',    header: 'Payment ID',      mono: true },
  { key: 'Payment_Amount',header: 'Pay Amt',         mono: true },
  { key: 'Payment_Status',header: 'Payment Status',
    render: (row: RowWithStatus) => {
      const VALID = new Set(['Completed','Pending','Failed','Refunded','Processing']);
      const v = String(row.Payment_Status).trim();
      if (!v) return <Badge variant="missing">blank</Badge>;
      if (!VALID.has(v)) return <Badge variant="invalid">{v}</Badge>;
      return <Badge variant="valid">{v}</Badge>;
    },
  },
];

function RawDataPage() {
  const { rawData, validationResults, filters, isValidating } = useData();

  const statusByRow = useMemo(() => {
    const map = new Map<number, IssueType>();
    validationResults.forEach(v => map.set(v.row_number, v.overallStatus));
    return map;
  }, [validationResults]);

  const filtered = useMemo(() => {
    const search = filters.searchText.toLowerCase().trim();
    const ps     = filters.paymentStatus;
    const vs     = filters.validationStatus;

    const rows: RowWithStatus[] = rawData.map(row => ({
      ...row,
      _status: statusByRow.get(row.row_number) ?? 'valid',
    }));

    return rows.filter(row => {
      if (ps && row.Payment_Status !== ps) return false;
      if (vs && row._status !== vs) return false;
      if (search) {
        return (
          row.Order_ID.toLowerCase().includes(search) ||
          row.Customer_Name.toLowerCase().includes(search) ||
          row.Email.toLowerCase().includes(search) ||
          row.Customer_ID.toLowerCase().includes(search)
        );
      }
      return true;
    });
  }, [rawData, filters, statusByRow]);

  if (isValidating) return <LoadingSpinner label="Loading raw data…" />;

  if (rawData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-500">
        <svg className="h-12 w-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
        <p className="text-sm">No data loaded. Upload a CSV or reset demo data.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-200">Raw Dataset</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {filtered.length.toLocaleString()} of {rawData.length.toLocaleString()} records — original, unmodified
            </p>
          </div>
        </div>
        <SearchFilter showPaymentStatus showValidationStatus />
      </Card>

      <DataTable
        columns={COLUMNS as Parameters<typeof DataTable>[0]['columns']}
        data={filtered as unknown as Record<string, unknown>[]}
        rowKey={row => String(row.row_number)}
        pageSize={50}
        emptyMessage="No records match your current filters."
        compact
      />
    </div>
  );
}
