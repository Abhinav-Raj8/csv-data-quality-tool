import React from 'react';
import { useData } from '../../store/dataStore';
import type { FilterState } from '../../types';

interface SearchFilterProps {
  showPaymentStatus?: boolean;
  showValidationStatus?: boolean;
  showIssueType?: boolean;
}

const PAYMENT_STATUSES = ['', 'Completed', 'Pending', 'Failed', 'Refunded', 'Processing'];
const VALIDATION_STATUSES = ['', 'valid', 'missing', 'invalid', 'duplicate', 'warning'];
const ISSUE_TYPES = ['', 'missing', 'invalid', 'duplicate', 'warning'];

export function SearchFilter({
  showPaymentStatus = false,
  showValidationStatus = false,
  showIssueType = false,
}: SearchFilterProps) {
  const { filters, setFilters } = useData();

  function update<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    setFilters({ ...filters, [key]: value });
  }

  const inputClass = `
    bg-surface-200 border border-white/10 rounded-lg px-3 py-2
    text-sm text-slate-200 placeholder-slate-500
    focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/30
    transition-colors duration-150 w-full
  `;

  return (
    <div className="flex flex-wrap gap-3">
      {/* Text Search */}
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            placeholder="Search Order_ID, Customer, email…"
            value={filters.searchText}
            onChange={e => update('searchText', e.target.value)}
            className={`${inputClass} pl-10`}
            id="search-filter-input"
          />
        </div>
      </div>

      {/* Payment Status */}
      {showPaymentStatus && (
        <select
          value={filters.paymentStatus}
          onChange={e => update('paymentStatus', e.target.value)}
          className={inputClass}
          style={{ minWidth: 160 }}
          id="payment-status-filter"
        >
          <option value="">All Payment Statuses</option>
          {PAYMENT_STATUSES.filter(Boolean).map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      )}

      {/* Validation Status */}
      {showValidationStatus && (
        <select
          value={filters.validationStatus}
          onChange={e => update('validationStatus', e.target.value)}
          className={inputClass}
          style={{ minWidth: 180 }}
          id="validation-status-filter"
        >
          <option value="">All Validation Statuses</option>
          {VALIDATION_STATUSES.filter(Boolean).map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      )}

      {/* Issue Type */}
      {showIssueType && (
        <select
          value={filters.issueType}
          onChange={e => update('issueType', e.target.value)}
          className={inputClass}
          style={{ minWidth: 160 }}
          id="issue-type-filter"
        >
          <option value="">All Issue Types</option>
          {ISSUE_TYPES.filter(Boolean).map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      )}

      {/* Clear button */}
      {(filters.searchText || filters.paymentStatus || filters.validationStatus || filters.issueType) && (
        <button
          onClick={() => setFilters({ searchText: '', paymentStatus: '', validationStatus: '', issueType: '' })}
          className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-2 whitespace-nowrap transition-colors"
          id="clear-filters-btn"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
