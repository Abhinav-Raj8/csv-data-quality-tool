import type { RowValidation, ErrorLogEntry } from '../types';

export function buildErrorLog(validationResults: RowValidation[]): ErrorLogEntry[] {
  const entries: ErrorLogEntry[] = [];
  let idCounter = 0;

  for (const row of validationResults) {
    for (const field of row.fields) {
      if (field.issueType === 'valid') continue;
      entries.push({
        id:              `err-${++idCounter}`,
        row:             row.row_number,
        Order_ID:        row.Order_ID,
        field:           field.field,
        issueType:       field.issueType,
        originalValue:   field.value,
        message:         field.message,
        suggestedAction: field.suggestedAction,
        status:          'open',
      });
    }
  }

  return entries;
}
