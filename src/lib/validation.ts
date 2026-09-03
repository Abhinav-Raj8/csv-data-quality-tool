import type { OrderRecord, RowValidation, FieldValidation, IssueType } from '../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_PAYMENT_STATUSES = new Set(['Completed', 'Pending', 'Failed', 'Refunded', 'Processing']);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Allows common separators (spaces, dashes, dots, parens, leading +) but the
// real check is digit count — 10 to 15 digits covers a domestic number up to
// a full E.164 international number. This is what actually distinguishes a
// real phone number from something like "555-1234" (7 digits, missing an
// area code) rather than just checking which characters are present.
const PHONE_CHAR_REGEX = /^[\d\s\-().+]+$/;
const PHONE_MIN_DIGITS = 10;
const PHONE_MAX_DIGITS = 15;

const DATE_PATTERNS: RegExp[] = [
  /^\d{4}-\d{2}-\d{2}$/,                                        // 2024-03-15
  /^\d{1,2}\/\d{1,2}\/\d{4}$/,                                  // 3/15/2024 or 03/15/2024
  /^\d{1,2}-[A-Za-z]{3}-\d{4}$/,                                // 15-Mar-2024
  /^[A-Za-z]+ \d{1,2}, \d{4}$/,                                 // March 15, 2024
];

// ─── Field Validators ─────────────────────────────────────────────────────────

function validateOrderId(value: string): Omit<FieldValidation, 'field'> {
  const v = value.trim();
  if (!v) {
    return { value, issueType: 'missing', message: 'Order_ID is blank', suggestedAction: 'Assign a unique Order_ID' };
  }
  if (!/^ORD-\d{5,}$/.test(v)) {
    return { value, issueType: 'invalid', message: `"${v}" does not match expected format ORD-XXXXX`, suggestedAction: 'Reformat to ORD-NNNNN' };
  }
  return { value, issueType: 'valid', message: 'OK', suggestedAction: '' };
}

function validateCustomerId(value: string): Omit<FieldValidation, 'field'> {
  const v = value.trim();
  if (!v) {
    return { value, issueType: 'missing', message: 'Customer_ID is blank', suggestedAction: 'Assign a Customer_ID' };
  }
  return { value, issueType: 'valid', message: 'OK', suggestedAction: '' };
}

function validateCustomerName(value: string): Omit<FieldValidation, 'field'> {
  const v = value.trim();
  if (!v) {
    return { value, issueType: 'missing', message: 'Customer_Name is blank', suggestedAction: 'Enter customer name' };
  }
  if (v !== value) {
    return { value, issueType: 'warning', message: 'Customer_Name has leading/trailing spaces', suggestedAction: 'Trim whitespace' };
  }
  const words = v.split(/\s+/);
  const isProperCase = words.every(w => w[0] === w[0].toUpperCase());
  if (!isProperCase) {
    return { value, issueType: 'warning', message: 'Inconsistent capitalization', suggestedAction: 'Apply Title Case' };
  }
  return { value, issueType: 'valid', message: 'OK', suggestedAction: '' };
}

function validateEmail(value: string): Omit<FieldValidation, 'field'> {
  const v = value.trim();
  if (!v) {
    return { value, issueType: 'missing', message: 'Email is blank', suggestedAction: 'Enter a valid email address' };
  }
  if (!EMAIL_REGEX.test(v)) {
    return { value, issueType: 'invalid', message: `"${v}" is not a valid email address`, suggestedAction: 'Correct email format to user@domain.com' };
  }
  return { value, issueType: 'valid', message: 'OK', suggestedAction: '' };
}

function validatePhone(value: string): Omit<FieldValidation, 'field'> {
  const v = value.trim();
  if (!v) {
    return { value, issueType: 'missing', message: 'Phone is blank', suggestedAction: 'Enter a phone number' };
  }
  const digitCount = (v.match(/\d/g) ?? []).length;
  const validChars  = PHONE_CHAR_REGEX.test(v);
  if (!validChars || digitCount < PHONE_MIN_DIGITS || digitCount > PHONE_MAX_DIGITS) {
    return { value, issueType: 'invalid', message: `"${v}" is not a valid phone number`, suggestedAction: 'Reformat phone number' };
  }
  return { value, issueType: 'valid', message: 'OK', suggestedAction: '' };
}

function validateOrderDate(value: string): Omit<FieldValidation, 'field'> {
  const v = value.trim();
  if (!v) {
    return { value, issueType: 'missing', message: 'Order_Date is blank', suggestedAction: 'Enter a valid date' };
  }
  const isRecognized = DATE_PATTERNS.some(p => p.test(v));
  if (!isRecognized) {
    return { value, issueType: 'invalid', message: `"${v}" is not a recognizable date format`, suggestedAction: 'Normalize to ISO 8601 (YYYY-MM-DD)' };
  }
  // Check if it's a non-ISO format (warning, not error)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    return { value, issueType: 'warning', message: `Date "${v}" is valid but non-standard format`, suggestedAction: 'Normalize to ISO 8601 (YYYY-MM-DD)' };
  }
  return { value, issueType: 'valid', message: 'OK', suggestedAction: '' };
}

function validateProduct(value: string): Omit<FieldValidation, 'field'> {
  const v = value.trim();
  if (!v) {
    return { value, issueType: 'missing', message: 'Product is blank', suggestedAction: 'Enter the product name' };
  }
  if (v !== value) {
    return { value, issueType: 'warning', message: 'Product name has extra whitespace', suggestedAction: 'Trim whitespace' };
  }
  return { value, issueType: 'valid', message: 'OK', suggestedAction: '' };
}

function validateNumericPositive(field: string, value: string): Omit<FieldValidation, 'field'> {
  const v = value.trim();
  if (!v) {
    return { value, issueType: 'missing', message: `${field} is blank`, suggestedAction: `Enter a positive number for ${field}` };
  }
  const n = Number(v);
  if (isNaN(n) || n <= 0) {
    return { value, issueType: 'invalid', message: `"${v}" is not a valid positive number`, suggestedAction: 'Enter a positive numeric value' };
  }
  return { value, issueType: 'valid', message: 'OK', suggestedAction: '' };
}

function validatePaymentId(value: string): Omit<FieldValidation, 'field'> {
  const v = value.trim();
  if (!v) {
    return { value, issueType: 'missing', message: 'Payment_ID is blank — payment may not have been recorded', suggestedAction: 'Retrieve or assign Payment_ID' };
  }
  return { value, issueType: 'valid', message: 'OK', suggestedAction: '' };
}

function validatePaymentStatus(value: string): Omit<FieldValidation, 'field'> {
  const v = value.trim();
  if (!v) {
    return { value, issueType: 'missing', message: 'Payment_Status is blank', suggestedAction: 'Set to one of: Completed, Pending, Failed, Refunded, Processing' };
  }
  if (!VALID_PAYMENT_STATUSES.has(v)) {
    return { value, issueType: 'invalid', message: `"${v}" is not a valid payment status`, suggestedAction: 'Correct to: Completed | Pending | Failed | Refunded | Processing' };
  }
  return { value, issueType: 'valid', message: 'OK', suggestedAction: '' };
}

// ─── Row Validator ────────────────────────────────────────────────────────────

export function validateRow(record: OrderRecord): RowValidation {
  const fields: FieldValidation[] = [
    { field: 'Order_ID',       ...validateOrderId(record.Order_ID) },
    { field: 'Customer_ID',    ...validateCustomerId(record.Customer_ID) },
    { field: 'Customer_Name',  ...validateCustomerName(record.Customer_Name) },
    { field: 'Email',          ...validateEmail(record.Email) },
    { field: 'Phone',          ...validatePhone(record.Phone) },
    { field: 'Order_Date',     ...validateOrderDate(record.Order_Date) },
    { field: 'Product',        ...validateProduct(record.Product) },
    { field: 'Quantity',       ...validateNumericPositive('Quantity', record.Quantity) },
    { field: 'Unit_Price',     ...validateNumericPositive('Unit_Price', record.Unit_Price) },
    { field: 'Order_Amount',   ...validateNumericPositive('Order_Amount', record.Order_Amount) },
    { field: 'Payment_ID',     ...validatePaymentId(record.Payment_ID) },
    { field: 'Payment_Amount', ...validateNumericPositive('Payment_Amount', record.Payment_Amount) },
    { field: 'Payment_Status', ...validatePaymentStatus(record.Payment_Status) },
  ];

  return {
    row_number: record.row_number,
    Order_ID: record.Order_ID,
    fields,
    overallStatus: worstStatus(fields),
  };
}

// ─── Duplicate Detection ──────────────────────────────────────────────────────

// Shared by the cleaning step so "is this row an exact duplicate" is decided
// the same way everywhere in the app — trimmed field values, same field order.
export function buildRowSignature(r: OrderRecord): string {
  return [
    r.Order_ID.trim(), r.Customer_ID.trim(), r.Customer_Name.trim(),
    r.Email.trim(), r.Phone.trim(), r.Order_Date.trim(), r.Product.trim(),
    r.Quantity.trim(), r.Unit_Price.trim(), r.Order_Amount.trim(),
    r.Payment_ID.trim(), r.Payment_Amount.trim(), r.Payment_Status.trim(),
  ].join('|');
}

export function detectDuplicates(records: OrderRecord[]): {
  duplicateOrderIds: Set<string>;
  duplicateRowNumbers: Set<number>;
} {
  const orderIdCounts = new Map<string, number[]>();

  // Count occurrences of each Order_ID
  records.forEach(r => {
    const id = r.Order_ID.trim();
    if (!id) return;
    if (!orderIdCounts.has(id)) orderIdCounts.set(id, []);
    orderIdCounts.get(id)!.push(r.row_number);
  });

  const duplicateOrderIds = new Set<string>();
  const duplicateRowNumbers = new Set<number>();

  orderIdCounts.forEach((rows, id) => {
    if (rows.length > 1) {
      duplicateOrderIds.add(id);
      rows.forEach(rn => duplicateRowNumbers.add(rn));
    }
  });

  // Exact duplicate rows — every field identical, not just the Order_ID.
  // A row can land here without its Order_ID being flagged above only when
  // the Order_ID itself is blank on both copies.
  const rowSigs = new Map<string, number>();
  records.forEach(r => {
    const sig = buildRowSignature(r);
    if (rowSigs.has(sig)) {
      duplicateRowNumbers.add(r.row_number);
      duplicateRowNumbers.add(rowSigs.get(sig)!);
    } else {
      rowSigs.set(sig, r.row_number);
    }
  });

  return { duplicateOrderIds, duplicateRowNumbers };
}

// ─── Full Dataset Validation ──────────────────────────────────────────────────

const STATUS_PRIORITY: IssueType[] = ['missing', 'invalid', 'duplicate', 'warning', 'valid'];

function worstStatus(fields: FieldValidation[]): IssueType {
  return fields.reduce<IssueType>((acc, f) => {
    return STATUS_PRIORITY.indexOf(f.issueType) < STATUS_PRIORITY.indexOf(acc) ? f.issueType : acc;
  }, 'valid');
}

export function validateDataset(records: OrderRecord[]): RowValidation[] {
  const { duplicateOrderIds, duplicateRowNumbers } = detectDuplicates(records);

  return records.map(record => {
    const rowVal = validateRow(record);

    // A duplicate Order_ID is only meaningful when the Order_ID itself was
    // actually supplied — a row that's an exact duplicate because both
    // copies have a blank Order_ID is already correctly flagged as "missing".
    if (duplicateRowNumbers.has(record.row_number) && duplicateOrderIds.has(record.Order_ID.trim())) {
      const dupField = rowVal.fields.find(f => f.field === 'Order_ID')!;
      dupField.issueType = 'duplicate';
      dupField.message = `Duplicate Order_ID "${record.Order_ID}" found in multiple rows`;
      dupField.suggestedAction = 'Assign unique Order_IDs or remove duplicate rows';
    }

    rowVal.overallStatus = worstStatus(rowVal.fields);
    return rowVal;
  });
}
