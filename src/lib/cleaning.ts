import type { OrderRecord, CleanedRecord, RowValidation } from '../types';
import { buildRowSignature } from './validation';

// ─── Date Normalizer ──────────────────────────────────────────────────────────

function normalizeDate(raw: string): string {
  const v = raw.trim();
  if (!v) return v;

  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;

  // MM/DD/YYYY or M/D/YYYY
  const mdy = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdy) {
    const [, m, d, y] = mdy;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // DD/MM/YYYY (UK style when day > 12, ambiguous otherwise — treat as M/D)
  // Using same regex, already covered above

  // DD-Mon-YYYY
  const dMonY = v.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
  if (dMonY) {
    const [, d, mon, y] = dMonY;
    const months: Record<string, string> = {
      jan:'01',feb:'02',mar:'03',apr:'04',may:'05',jun:'06',
      jul:'07',aug:'08',sep:'09',oct:'10',nov:'11',dec:'12',
    };
    const m = months[mon.toLowerCase()];
    if (m) return `${y}-${m}-${d.padStart(2, '0')}`;
  }

  // Month DD, YYYY
  const longMonth = v.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (longMonth) {
    const [, monStr, d, y] = longMonth;
    const months: Record<string, string> = {
      january:'01',february:'02',march:'03',april:'04',may:'05',june:'06',
      july:'07',august:'08',september:'09',october:'10',november:'11',december:'12',
    };
    const m = months[monStr.toLowerCase()];
    if (m) return `${y}-${m}-${d.padStart(2, '0')}`;
  }

  return v; // Return as-is if cannot parse
}

// ─── Name Normalizer ──────────────────────────────────────────────────────────

function toTitleCase(str: string): string {
  return str
    .trim()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

// ─── Main Cleaner ─────────────────────────────────────────────────────────────

export function cleanDataset(
  rawRecords: OrderRecord[],
  validationResults: RowValidation[],
): CleanedRecord[] {
  const validationMap = new Map<number, RowValidation>();
  validationResults.forEach(v => validationMap.set(v.row_number, v));

  const seenSignatures = new Set<string>();
  const cleaned: CleanedRecord[] = [];

  for (const raw of rawRecords) {
    const sig = buildRowSignature(raw);

    // Drop exact duplicate rows (keep first occurrence)
    if (seenSignatures.has(sig)) {
      continue;
    }
    seenSignatures.add(sig);

    const rowVal = validationMap.get(raw.row_number);
    const issuesRemaining: string[] = [];

    // --- Clean each field ---
    const cleanedName    = toTitleCase(raw.Customer_Name);
    const cleanedEmail   = raw.Email.trim().toLowerCase();
    const cleanedPhone   = raw.Phone.trim();
    const cleanedProduct = raw.Product.trim();
    const cleanedDate    = normalizeDate(raw.Order_Date);
    const cleanedOrderId = raw.Order_ID.trim();
    const cleanedCustomerId = raw.Customer_ID.trim();
    const cleanedStatus  = raw.Payment_Status.trim();
    const cleanedPayId   = raw.Payment_ID.trim();
    const cleanedQty     = raw.Quantity.trim();
    const cleanedUnitPrice = raw.Unit_Price.trim();
    const cleanedOrderAmt  = raw.Order_Amount.trim();
    const cleanedPayAmt    = raw.Payment_Amount.trim();

    // Missing/invalid/duplicate issues are never auto-resolved — cleaning
    // trims and reformats, it never invents a value or guesses intent.
    // Warnings (whitespace, casing, non-ISO dates) ARE resolved here, since
    // the transforms above already fix exactly those problems.
    if (rowVal) {
      for (const fv of rowVal.fields) {
        if (fv.issueType === 'missing' || fv.issueType === 'invalid' || fv.issueType === 'duplicate') {
          issuesRemaining.push(`${fv.field}: ${fv.message}`);
        }
      }
    }

    const wasModified =
      cleanedName     !== raw.Customer_Name   ||
      cleanedEmail    !== raw.Email            ||
      cleanedPhone    !== raw.Phone            ||
      cleanedProduct  !== raw.Product          ||
      cleanedDate     !== raw.Order_Date       ||
      cleanedOrderId  !== raw.Order_ID         ||
      cleanedStatus   !== raw.Payment_Status;

    cleaned.push({
      row_number:        cleaned.length + 1,
      _original_row:     raw.row_number,
      _was_modified:     wasModified,
      _issues_remaining: issuesRemaining,
      Order_ID:          cleanedOrderId,
      Customer_ID:       cleanedCustomerId,
      Customer_Name:     cleanedName,
      Email:             cleanedEmail,
      Phone:             cleanedPhone,
      Order_Date:        cleanedDate,
      Product:           cleanedProduct,
      Quantity:          cleanedQty,
      Unit_Price:        cleanedUnitPrice,
      Order_Amount:      cleanedOrderAmt,
      Payment_ID:        cleanedPayId,
      Payment_Amount:    cleanedPayAmt,
      Payment_Status:    cleanedStatus,
    });
  }

  return cleaned;
}
