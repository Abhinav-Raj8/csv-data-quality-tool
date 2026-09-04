import type { RowValidation, DashboardMetrics } from '../types';

export function computeQualityScore(validationResults: RowValidation[]): number {
  if (!validationResults.length) return 0;
  const valid = validationResults.filter(r => r.overallStatus === 'valid').length;
  return parseFloat(((valid / validationResults.length) * 100).toFixed(1));
}

export function computeMetrics(
  rawData: { length: number },
  validationResults: RowValidation[],
  duplicateCount: number,
  paymentMismatchCount: number,
): DashboardMetrics {
  const total   = rawData.length;
  const missing = validationResults.filter(r =>
    r.fields.some(f => f.issueType === 'missing'),
  ).length;
  const invalid = validationResults.filter(r =>
    r.fields.some(f => f.issueType === 'invalid'),
  ).length;
  const clean   = validationResults.filter(r => r.overallStatus === 'valid').length;
  const review  = validationResults.filter(r =>
    r.overallStatus !== 'valid',
  ).length;
  const score   = computeQualityScore(validationResults);

  return {
    totalRecords:          total,
    duplicateRecords:      duplicateCount,
    missingValues:         missing,
    invalidValues:         invalid,
    paymentMismatches:     paymentMismatchCount,
    qualityScore:          score,
    cleanRecords:          clean,
    recordsRequiringReview: review,
  };
}
