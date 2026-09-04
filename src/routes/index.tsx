import React, { useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useData } from '../store/dataStore';
import { MetricCard } from '../components/ui/Card';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ScoreGauge } from '../components/ui/ScoreGauge';
import { QualityOverviewChart } from '../components/charts/QualityOverviewChart';
import { IssueTypesChart } from '../components/charts/IssueTypesChart';
import { ReconciliationChart } from '../components/charts/ReconciliationChart';
import { Badge } from '../components/ui/Badge';

export const Route = createFileRoute('/')({
  component: DashboardPage,
});

function DashboardPage() {
  const {
    metrics, isValidating, hasRunValidation,
    rawData, validationResults, reconciliationSummary,
    errorLog, importSummary,
  } = useData();

  // ─── Issue type breakdown for charts ──────────────────────────────────────
  const issueBreakdown = useMemo(() => {
    const counts = { missing: 0, invalid: 0, duplicate: 0, warning: 0 };
    validationResults.forEach(rv => {
      rv.fields.forEach(f => {
        if (f.issueType !== 'valid') {
          counts[f.issueType as keyof typeof counts] =
            (counts[f.issueType as keyof typeof counts] ?? 0) + 1;
        }
      });
    });
    return counts;
  }, [validationResults]);

  // ─── Quality overview chart data ──────────────────────────────────────────
  const qualityChartData = useMemo(() => [
    { name: 'Clean',     count: metrics?.cleanRecords          ?? 0, color: '#10b981' },
    { name: 'Missing',   count: metrics?.missingValues         ?? 0, color: '#ef4444' },
    { name: 'Invalid',   count: metrics?.invalidValues         ?? 0, color: '#f97316' },
    { name: 'Duplicate', count: metrics?.duplicateRecords      ?? 0, color: '#a855f7' },
    { name: 'Warning',   count: validationResults.filter(r => r.overallStatus === 'warning').length, color: '#eab308' },
  ], [metrics, validationResults]);

  // ─── Issue types pie data ─────────────────────────────────────────────────
  const issueTypesData = useMemo(() => [
    { name: 'Missing',   value: issueBreakdown.missing,   color: '#ef4444' },
    { name: 'Invalid',   value: issueBreakdown.invalid,   color: '#f97316' },
    { name: 'Duplicate', value: issueBreakdown.duplicate, color: '#a855f7' },
    { name: 'Warning',   value: issueBreakdown.warning,   color: '#eab308' },
  ], [issueBreakdown]);

  if (isValidating || (!hasRunValidation && rawData.length > 0)) {
    return <LoadingSpinner size="lg" label="Running validation on dataset…" />;
  }

  if (!hasRunValidation) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-500">
        <div className="h-16 w-16 rounded-full bg-brand-600/10 flex items-center justify-center">
          <svg className="h-8 w-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-sm">Upload a CSV or click "Run Validation" to get started</p>
      </div>
    );
  }

  const m = metrics!;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* ── Import summary banner ──────────────────────────────────────── */}
      {importSummary && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-brand-600/10 border border-brand-600/20 rounded-xl">
          <div className="flex items-center gap-2 text-sm">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">{importSummary.fileName}</span>
            <span className="text-slate-500">—</span>
            <span className="text-slate-400">{importSummary.parsedRows.toLocaleString()} records imported</span>
            <span className="text-slate-600 hidden sm:inline">
              · {new Date(importSummary.importedAt).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* ── KPI Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Records"
          value={m.totalRecords.toLocaleString()}
          subtitle="In current dataset"
          accent="text-brand-400"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h7" />
            </svg>
          }
        />
        <MetricCard
          title="Clean Records"
          value={m.cleanRecords.toLocaleString()}
          subtitle={`${((m.cleanRecords / m.totalRecords) * 100).toFixed(1)}% of total`}
          accent="text-emerald-400"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <MetricCard
          title="Requiring Review"
          value={m.recordsRequiringReview.toLocaleString()}
          subtitle="Have at least 1 issue"
          accent="text-yellow-400"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
        <MetricCard
          title="Open Issues"
          value={errorLog.filter(e => e.status === 'open').length.toLocaleString()}
          subtitle="In error log"
          accent="text-red-400"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Duplicates"
          value={m.duplicateRecords.toLocaleString()}
          subtitle="Duplicate rows detected"
          accent="text-purple-400"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          }
        />
        <MetricCard
          title="Missing Values"
          value={m.missingValues.toLocaleString()}
          subtitle="Rows with blank fields"
          accent="text-red-400"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M20 12H4" />
            </svg>
          }
        />
        <MetricCard
          title="Invalid Values"
          value={m.invalidValues.toLocaleString()}
          subtitle="Rows with invalid fields"
          accent="text-orange-400"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          }
        />
        <MetricCard
          title="Payment Mismatches"
          value={m.paymentMismatches.toLocaleString()}
          subtitle="Order ≠ Payment amount"
          accent="text-orange-400"
          icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* ── Quality Score + Charts ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Quality Score gauge */}
        <Card className="flex flex-col items-center justify-center gap-4 py-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Data Quality Score</p>
          <ScoreGauge score={m.qualityScore} size={150} />
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { label: 'Clean',   count: m.cleanRecords,           color: 'text-emerald-400' },
              { label: 'Issues',  count: m.recordsRequiringReview, color: 'text-red-400' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className={`font-semibold ${item.color}`}>{item.count.toLocaleString()}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quality overview bar chart */}
        <Card className="lg:col-span-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Records by Status</p>
          <QualityOverviewChart data={qualityChartData} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Issue types pie */}
        <Card>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Issue Type Distribution</p>
          <IssueTypesChart data={issueTypesData} />
        </Card>

        {/* Reconciliation bar */}
        <Card>
          <div className="flex items-start justify-between mb-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Payment Reconciliation</p>
            {reconciliationSummary && (
              <div className="text-right">
                <p className="text-xs text-slate-500">Total Mismatch Amount</p>
                <p className="text-sm font-semibold text-orange-400">
                  ${reconciliationSummary.totalMismatchAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
          </div>
          {reconciliationSummary ? (
            <ReconciliationChart
              matched={reconciliationSummary.matched}
              mismatched={reconciliationSummary.mismatched}
              missingPayment={reconciliationSummary.missingPayment}
            />
          ) : (
            <div className="flex items-center justify-center h-[220px] text-slate-500 text-sm">No data</div>
          )}
        </Card>
      </div>

      {/* ── Recent errors quick list ─────────────────────────────────── */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Recent Issues</p>
          <a href="/errors" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
            View all →
          </a>
        </div>
        <div className="space-y-2">
          {errorLog.slice(0, 5).map(e => (
            <div key={e.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
              <span className="font-mono text-xs text-slate-500 w-12 shrink-0">#{e.row}</span>
              <span className="font-mono text-xs text-slate-400 w-28 shrink-0 truncate">{e.Order_ID || '—'}</span>
              <span className="text-xs text-slate-400 w-24 shrink-0">{e.field}</span>
              <Badge variant={e.issueType}>{e.issueType}</Badge>
              <span className="text-xs text-slate-500 flex-1 truncate hidden sm:block">{e.suggestedAction}</span>
            </div>
          ))}
          {errorLog.length === 0 && (
            <p className="text-sm text-slate-500 py-4 text-center">No issues found — dataset looks clean!</p>
          )}
        </div>
      </Card>
    </div>
  );
}
