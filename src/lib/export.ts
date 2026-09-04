import Papa from 'papaparse';
import type { OrderRecord, CleanedRecord, ErrorLogEntry, ReconciliationEntry } from '../types';

type CsvRow = Record<string, string | number | boolean | null | undefined>;

function download(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportCleanedData(records: CleanedRecord[]): void {
  const rows: CsvRow[] = records.map(r => ({
    Row:            r.row_number,
    Original_Row:  r._original_row,
    Was_Modified:  r._was_modified ? 'Yes' : 'No',
    Issues_Remaining: r._issues_remaining.join('; '),
    Order_ID:       r.Order_ID,
    Customer_ID:    r.Customer_ID,
    Customer_Name:  r.Customer_Name,
    Email:          r.Email,
    Phone:          r.Phone,
    Order_Date:     r.Order_Date,
    Product:        r.Product,
    Quantity:       r.Quantity,
    Unit_Price:     r.Unit_Price,
    Order_Amount:   r.Order_Amount,
    Payment_ID:     r.Payment_ID,
    Payment_Amount: r.Payment_Amount,
    Payment_Status: r.Payment_Status,
  }));

  const csv = Papa.unparse(rows);
  download(csv, `cleaned_data_${timestamp()}.csv`);
}

export function exportErrorLog(entries: ErrorLogEntry[]): void {
  const rows: CsvRow[] = entries.map(e => ({
    Row:              e.row,
    Order_ID:         e.Order_ID,
    Field:            e.field,
    Issue_Type:       e.issueType,
    Original_Value:   e.originalValue,
    Message:          e.message,
    Suggested_Action: e.suggestedAction,
    Status:           e.status,
  }));

  const csv = Papa.unparse(rows);
  download(csv, `error_log_${timestamp()}.csv`);
}

export function exportReconciliation(entries: ReconciliationEntry[]): void {
  const rows: CsvRow[] = entries.map(e => ({
    Row:            e.row_number,
    Order_ID:       e.Order_ID,
    Customer_Name:  e.Customer_Name,
    Order_Date:     e.Order_Date,
    Payment_ID:     e.Payment_ID,
    Order_Amount:   e.Order_Amount,
    Payment_Amount: e.Payment_Amount,
    Difference:     e.Difference,
    Status:         e.status,
  }));

  const csv = Papa.unparse(rows);
  download(csv, `reconciliation_report_${timestamp()}.csv`);
}

export function exportRawData(records: OrderRecord[]): void {
  const csv = Papa.unparse(records as unknown as CsvRow[]);
  download(csv, `raw_data_${timestamp()}.csv`);
}

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}
