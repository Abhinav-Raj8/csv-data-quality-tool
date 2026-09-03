import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import type { OrderRecord, ImportSummary } from '../types';
import { useData } from '../store/dataStore';
import { detectDuplicates } from '../lib/validation';
import { Button } from './ui/Button';

const REQUIRED_FIELDS = [
  'Order_ID','Customer_ID','Customer_Name','Email','Phone',
  'Order_Date','Product','Quantity','Unit_Price','Order_Amount',
  'Payment_ID','Payment_Amount','Payment_Status',
] as const;

interface ParsedRow {
  [key: string]: string;
}

function normalizeHeaders(raw: ParsedRow): ParsedRow {
  const normalized: ParsedRow = {};
  for (const [key, val] of Object.entries(raw)) {
    const normalKey = key.trim().replace(/\s+/g, '_');
    normalized[normalKey] = typeof val === 'string' ? val : String(val ?? '');
  }
  return normalized;
}

interface CsvImportProps {
  onComplete?: () => void;
}

export function CsvImport({ onComplete }: CsvImportProps) {
  const { importCsvData } = useData();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [parsing,  setParsing]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [summary,  setSummary]  = useState<ImportSummary | null>(null);

  function handleFile(file: File) {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file.');
      return;
    }
    setError(null);
    setParsing(true);
    setSummary(null);

    Papa.parse<ParsedRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const rawRows = result.data as ParsedRow[];

        // Normalize the header names Papa Parse found, then confirm every
        // required column is actually present before touching row data —
        // a file with the wrong schema should fail clearly, not import
        // silently with every value blank.
        const foundHeaders = new Set((result.meta.fields ?? []).map(h => h.trim().replace(/\s+/g, '_')));
        const missingColumns = REQUIRED_FIELDS.filter(f => !foundHeaders.has(f));
        if (missingColumns.length > 0) {
          setError(`CSV is missing required column${missingColumns.length > 1 ? 's' : ''}: ${missingColumns.join(', ')}`);
          setParsing(false);
          return;
        }

        const records: OrderRecord[] = [];
        let malformed = 0;

        rawRows.forEach(rawRow => {
          const row = normalizeHeaders(rawRow);

          // A structurally broken line (fewer fields than the header row)
          // is missing keys entirely, distinct from a value that's simply
          // blank — the latter is a data-quality issue the validator will
          // surface, not an import failure.
          const missingKeys = REQUIRED_FIELDS.filter(f => !(f in row));
          if (missingKeys.length > 0) {
            malformed++;
            return;
          }

          records.push({
            row_number:     records.length + 1,
            Order_ID:       row['Order_ID'],
            Customer_ID:    row['Customer_ID'],
            Customer_Name:  row['Customer_Name'],
            Email:          row['Email'],
            Phone:          row['Phone'],
            Order_Date:     row['Order_Date'],
            Product:        row['Product'],
            Quantity:       row['Quantity'],
            Unit_Price:     row['Unit_Price'],
            Order_Amount:   row['Order_Amount'],
            Payment_ID:     row['Payment_ID'],
            Payment_Amount: row['Payment_Amount'],
            Payment_Status: row['Payment_Status'],
          });
        });

        if (records.length === 0) {
          setError('No valid records found in the CSV — every row was malformed or empty.');
          setParsing(false);
          return;
        }

        const missingFieldRows = records.filter(r =>
          REQUIRED_FIELDS.some(f => !r[f].trim()),
        ).length;
        const { duplicateRowNumbers } = detectDuplicates(records);

        const importSummary: ImportSummary = {
          fileName:         file.name,
          totalRows:        rawRows.length,
          parsedRows:       records.length,
          malformedRows:    malformed,
          duplicateRows:    duplicateRowNumbers.size,
          missingFieldRows,
          importedAt:       new Date().toISOString(),
        };

        setSummary(importSummary);
        importCsvData(records, importSummary);
        setParsing(false);
        onComplete?.();
      },
      error: (err) => {
        setError(`Parse error: ${err.message}`);
        setParsing(false);
      },
    });
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={`
          border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3
          cursor-pointer transition-all duration-200
          ${dragging
            ? 'border-brand-500 bg-brand-500/10'
            : 'border-white/15 hover:border-brand-500/50 hover:bg-white/4'
          }
        `}
      >
        <div className="p-3 rounded-full bg-brand-600/20">
          <svg className="h-8 w-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div className="text-center">
          <p className="font-medium text-slate-200">
            {dragging ? 'Drop it!' : 'Drag & drop your CSV here'}
          </p>
          <p className="text-sm text-slate-500 mt-1">or click to browse — CSV files only</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={onInputChange}
          className="hidden"
          id="csv-file-input"
        />
      </div>

      {/* Required columns hint */}
      <details className="text-xs text-slate-500 cursor-pointer group">
        <summary className="hover:text-slate-300 transition-colors list-none flex items-center gap-1">
          <svg className="h-3.5 w-3.5 group-open:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Required columns
        </summary>
        <div className="mt-2 pl-4 font-mono flex flex-wrap gap-1">
          {REQUIRED_FIELDS.map(f => (
            <span key={f} className="bg-surface-200 px-1.5 py-0.5 rounded text-slate-400">{f}</span>
          ))}
        </div>
      </details>

      {/* Status */}
      {parsing && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="h-4 w-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          Parsing CSV…
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {summary && !error && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-3 text-sm text-emerald-400">
          ✓ Imported <strong>{summary.parsedRows.toLocaleString()}</strong> records from <strong>{summary.fileName}</strong>
          {summary.malformedRows > 0 && (
            <span className="text-yellow-400 ml-2">
              ({summary.malformedRows} malformed rows skipped)
            </span>
          )}
        </div>
      )}

      {/* Download sample button */}
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={downloadSample} id="download-sample-btn">
          Download sample CSV
        </Button>
      </div>
    </div>
  );
}

function downloadSample() {
  const header = 'Order_ID,Customer_ID,Customer_Name,Email,Phone,Order_Date,Product,Quantity,Unit_Price,Order_Amount,Payment_ID,Payment_Amount,Payment_Status';
  const rows = [
    'ORD-00001,CUST-1001,John Smith,john.smith@gmail.com,+1-555-123-4567,2024-01-15,Wireless Headphones,2,79.99,159.98,PAY-100001,159.98,Completed',
    'ORD-00002,CUST-1002,Jane Doe,jane.doe@outlook.com,(555) 987-6543,2024-01-16,USB-C Hub,1,49.99,49.99,PAY-100002,49.99,Completed',
    'ORD-00003,CUST-1003,Bob Johnson,,+1-555-000-0000,2024/01/17,Laptop Stand,3,34.99,104.97,PAY-100003,100.00,Pending',
  ];
  const csv  = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'sample_orders.csv';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
