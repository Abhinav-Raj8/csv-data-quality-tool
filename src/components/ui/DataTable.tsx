import React, { useState, useMemo } from 'react';
import { Button } from './Button';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  mono?: boolean;
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  rowKey?: (row: T) => string;
  pageSize?: number;
  emptyMessage?: string;
  className?: string;
  compact?: boolean;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey,
  pageSize = 50,
  emptyMessage = 'No records found.',
  className = '',
  compact = false,
}: DataTableProps<T>) {
  const [page, setPage]           = useState(1);
  const [sortKey, setSortKey]     = useState<string | null>(null);
  const [sortDir, setSortDir]     = useState<'asc' | 'desc'>('asc');

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = String(a[sortKey] ?? '');
      const bv = String(b[sortKey] ?? '');
      const cmp = av.localeCompare(bv, undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage   = Math.min(page, totalPages);

  const pageData = useMemo(
    () => sorted.slice((safePage - 1) * pageSize, safePage * pageSize),
    [sorted, safePage, pageSize],
  );

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  }

  const paddingClass = compact ? 'px-3 py-2' : 'px-4 py-3';

  if (data.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 text-slate-500 ${className}`}>
        <svg className="h-10 w-10 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/8">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-white/8 bg-surface-200">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`
                    ${paddingClass} text-left text-xs font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap
                    ${col.sortable !== false ? 'cursor-pointer hover:text-slate-200 select-none' : ''}
                    ${col.width ?? ''}
                  `}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <span className="flex items-center gap-1.5">
                    {col.header}
                    {col.sortable !== false && sortKey === col.key && (
                      <span className="text-brand-400">{sortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, idx) => (
              <tr
                key={rowKey ? rowKey(row) : idx}
                className="border-b border-white/5 hover:bg-white/4 transition-colors"
              >
                {columns.map(col => (
                  <td
                    key={col.key}
                    className={`
                      ${paddingClass} text-slate-300 max-w-[250px] truncate
                      ${col.mono ? 'font-mono text-xs' : ''}
                    `}
                    title={col.render ? undefined : String(row[col.key] ?? '')}
                  >
                    {col.render ? col.render(row) : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, sorted.length)} of {sorted.length.toLocaleString()} records
          </span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setPage(1)} disabled={safePage === 1}>«</Button>
            <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}>‹</Button>
            <span className="px-3 py-1.5 text-slate-300">
              Page {safePage} / {totalPages}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>›</Button>
            <Button variant="ghost" size="sm" onClick={() => setPage(totalPages)} disabled={safePage === totalPages}>»</Button>
          </div>
        </div>
      )}
    </div>
  );
}
