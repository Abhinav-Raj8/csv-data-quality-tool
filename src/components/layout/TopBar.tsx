import React, { useState } from 'react';
import { useData } from '../../store/dataStore';
import { Button } from '../ui/Button';
import { CsvImport } from '../CsvImport';
import {
  exportCleanedData,
  exportErrorLog,
  exportReconciliation,
} from '../../lib/export';

interface TopBarProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
}

export function TopBar({ title, subtitle, onMenuClick }: TopBarProps) {
  const {
    rawData, cleanedData, errorLog, reconciliationData,
    runValidation, resetAll, loadDemoData,
    isValidating, importSummary,
  } = useData();

  const [showImport,  setShowImport]  = useState(false);
  const [showExport,  setShowExport]  = useState(false);

  const hasData = rawData.length > 0;

  function handleExport(type: 'cleaned' | 'errors' | 'reconciliation') {
    setShowExport(false);
    if (type === 'cleaned')        exportCleanedData(cleanedData);
    if (type === 'errors')         exportErrorLog(errorLog);
    if (type === 'reconciliation') exportReconciliation(reconciliationData);
  }

  return (
    <>
      <header className="flex items-center gap-3 px-5 py-3.5 border-b border-white/8 bg-surface-50/80 backdrop-blur-sm sticky top-0 z-20">
        {/* Hamburger (mobile) */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/8 transition-colors"
          aria-label="Open menu"
          id="menu-toggle-btn"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold text-slate-100 truncate">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>}
        </div>

        {/* Data source badge */}
        {importSummary && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-surface-200 rounded-lg border border-white/8">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-400 truncate max-w-[140px]" title={importSummary.fileName}>
              {importSummary.fileName}
            </span>
            <span className="text-xs text-slate-600">
              · {importSummary.parsedRows.toLocaleString()} rows
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Upload CSV */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowImport(true)}
            id="upload-csv-btn"
            icon={
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            }
          >
            <span className="hidden sm:inline">Upload CSV</span>
          </Button>

          {/* Run Validation */}
          {hasData && (
            <Button
              variant="primary"
              size="sm"
              loading={isValidating}
              onClick={runValidation}
              id="run-validation-btn"
              icon={
                !isValidating ? (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : undefined
              }
            >
              <span className="hidden sm:inline">{isValidating ? 'Validating…' : 'Run Validation'}</span>
            </Button>
          )}

          {/* Export CSV dropdown */}
          {hasData && (
            <div className="relative">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowExport(v => !v)}
                id="export-csv-btn"
                icon={
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                }
              >
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
              {showExport && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-surface-200 border border-white/12 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                  {[
                    { key: 'cleaned',        label: 'Cleaned Data',         icon: '✓' },
                    { key: 'errors',         label: 'Error Log',            icon: '⚠' },
                    { key: 'reconciliation', label: 'Reconciliation Report', icon: '⇄' },
                  ].map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => handleExport(opt.key as 'cleaned' | 'errors' | 'reconciliation')}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/8 hover:text-slate-100 transition-colors text-left"
                      id={`export-${opt.key}-btn`}
                    >
                      <span className="text-xs">{opt.icon}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reset Demo */}
          <Button
            variant="ghost"
            size="sm"
            onClick={resetAll}
            id="reset-demo-btn"
            title="Reset to demo data"
            icon={
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            }
          >
            <span className="hidden lg:inline">Reset Demo</span>
          </Button>
        </div>

        {/* Close export dropdown on outside click */}
        {showExport && (
          <div className="fixed inset-0 z-40" onClick={() => setShowExport(false)} />
        )}
      </header>

      {/* CSV Import Modal */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) setShowImport(false); }}>
          <div className="w-full max-w-lg bg-surface-100 border border-white/10 rounded-2xl shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
              <h2 className="text-base font-semibold text-slate-100">Import CSV</h2>
              <button
                onClick={() => setShowImport(false)}
                className="text-slate-500 hover:text-slate-200 transition-colors"
                id="close-import-modal-btn"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <CsvImport onComplete={() => setShowImport(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
