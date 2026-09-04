// ─── Raw Data Types ──────────────────────────────────────────────────────────

export interface OrderRecord {
  row_number: number;
  Order_ID: string;
  Customer_ID: string;
  Customer_Name: string;
  Email: string;
  Phone: string;
  Order_Date: string;
  Product: string;
  Quantity: string;
  Unit_Price: string;
  Order_Amount: string;
  Payment_ID: string;
  Payment_Amount: string;
  Payment_Status: string;
}

// ─── Validation Types ─────────────────────────────────────────────────────────

export type IssueType = 'missing' | 'invalid' | 'duplicate' | 'warning' | 'valid';

export interface FieldValidation {
  field: string;
  value: string;
  issueType: IssueType;
  message: string;
  suggestedAction: string;
}

export interface RowValidation {
  row_number: number;
  Order_ID: string;
  fields: FieldValidation[];
  overallStatus: IssueType;
}

// ─── Error Log Types ──────────────────────────────────────────────────────────

export type ErrorStatus = 'open' | 'resolved' | 'flagged';

export interface ErrorLogEntry {
  id: string;
  row: number;
  Order_ID: string;
  field: string;
  issueType: IssueType;
  originalValue: string;
  message: string;
  suggestedAction: string;
  status: ErrorStatus;
}

// ─── Reconciliation Types ─────────────────────────────────────────────────────

export type ReconciliationStatus = 'Matched' | 'Mismatch' | 'Missing Payment';

export interface ReconciliationEntry {
  row_number: number;
  Order_ID: string;
  Customer_Name: string;
  Order_Date: string;
  Payment_ID: string;
  Order_Amount: number;
  Payment_Amount: number;
  Difference: number;
  status: ReconciliationStatus;
}

export interface ReconciliationSummary {
  total: number;
  matched: number;
  mismatched: number;
  missingPayment: number;
  totalMismatchAmount: number;
}

// ─── Cleaned Record Types ─────────────────────────────────────────────────────

export interface CleanedRecord extends Omit<OrderRecord, 'row_number'> {
  row_number: number;
  _original_row: number;
  _was_modified: boolean;
  _issues_remaining: string[];
}

// ─── Import Summary ───────────────────────────────────────────────────────────

export interface ImportSummary {
  fileName: string;
  totalRows: number;
  parsedRows: number;
  malformedRows: number;
  duplicateRows: number;
  missingFieldRows: number;
  importedAt: string;
}

// ─── Dashboard Metrics ────────────────────────────────────────────────────────

export interface DashboardMetrics {
  totalRecords: number;
  duplicateRecords: number;
  missingValues: number;
  invalidValues: number;
  paymentMismatches: number;
  qualityScore: number;
  cleanRecords: number;
  recordsRequiringReview: number;
}

// ─── Filter State ─────────────────────────────────────────────────────────────

export interface FilterState {
  searchText: string;
  paymentStatus: string;
  validationStatus: string;
  issueType: string;
}

// ─── App State ────────────────────────────────────────────────────────────────

export interface AppState {
  rawData: OrderRecord[];
  validationResults: RowValidation[];
  errorLog: ErrorLogEntry[];
  reconciliationData: ReconciliationEntry[];
  cleanedData: CleanedRecord[];
  importSummary: ImportSummary | null;
  filters: FilterState;
  isValidating: boolean;
  hasRunValidation: boolean;
}
