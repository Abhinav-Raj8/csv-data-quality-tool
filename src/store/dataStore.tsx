import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type {
  AppState,
  OrderRecord,
  CleanedRecord,
  ErrorLogEntry,
  ReconciliationEntry,
  ReconciliationSummary,
  RowValidation,
  FilterState,
  ImportSummary,
  DashboardMetrics,
} from '../types';
import { generateDemoData, DEMO_DATASET_VERSION, DEMO_FILE_NAME, TOTAL_RECORDS } from '../lib/demoData';
import { validateDataset, detectDuplicates } from '../lib/validation';
import { cleanDataset } from '../lib/cleaning';
import { reconcilePayments } from '../lib/reconciliation';
import { buildErrorLog } from '../lib/errorLog';
import { computeMetrics } from '../lib/scoring';
import { storage } from '../lib/storage';

// ─── Context Shape ────────────────────────────────────────────────────────────

interface DataContextValue extends AppState {
  reconciliationSummary: ReconciliationSummary | null;
  metrics: DashboardMetrics | null;

  // Actions
  loadDemoData: () => void;
  importCsvData: (records: OrderRecord[], summary: ImportSummary) => void;
  runValidation: () => void;
  resetAll: () => void;
  setFilters: (filters: FilterState) => void;
  updateErrorStatus: (id: string, status: ErrorLogEntry['status']) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function DataProvider({ children }: { children: ReactNode }) {
  const [rawData,             setRawData]            = useState<OrderRecord[]>([]);
  const [validationResults,   setValidationResults]  = useState<RowValidation[]>([]);
  const [errorLog,            setErrorLog]           = useState<ErrorLogEntry[]>([]);
  const [reconciliationData,  setReconciliationData] = useState<ReconciliationEntry[]>([]);
  const [reconciliationSummary, setReconciliationSummary] = useState<ReconciliationSummary | null>(null);
  const [cleanedData,         setCleanedData]        = useState<CleanedRecord[]>([]);
  const [importSummary,       setImportSummary]      = useState<ImportSummary | null>(null);
  const [filters,             setFiltersState]       = useState<FilterState>(storage.getFilters());
  const [isValidating,        setIsValidating]       = useState(false);
  const [hasRunValidation,    setHasRunValidation]   = useState(false);
  const [metrics,             setMetrics]            = useState<DashboardMetrics | null>(null);

  // ─── Restore from localStorage on mount ──────────────────────────────────

  useEffect(() => {
    const savedRaw     = storage.getRawData();
    const savedSummary = storage.getImportSummary();
    const savedFilters = storage.getFilters();

    // A cached dataset only counts as "the demo" if its import summary says
    // so — a user-imported CSV must never be treated as stale just because
    // the demo generator changed. For demo data specifically, both the
    // version tag and the actual row count are checked: either one being
    // off (e.g. a dataset from a build that produced 2,040 rows instead of
    // 2,000) means the cached copy predates the current generator and gets
    // discarded automatically, with no manual storage-clearing required.
    const isCachedDemoData = savedSummary?.fileName === DEMO_FILE_NAME;
    const isStaleDemoData =
      isCachedDemoData &&
      (storage.getDemoDataVersion() !== DEMO_DATASET_VERSION || savedRaw.length !== TOTAL_RECORDS);

    if (savedRaw.length > 0 && !isStaleDemoData) {
      setRawData(savedRaw);
      setImportSummary(savedSummary);
      setFiltersState(savedFilters);
      runValidationOn(savedRaw);
    } else {
      storage.clearAll();
      loadDemoDataInternal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Internal helpers ─────────────────────────────────────────────────────

  function runValidationOn(records: OrderRecord[]) {
    setIsValidating(true);
    // Use setTimeout to avoid blocking the render
    setTimeout(() => {
      const valResults = validateDataset(records);
      const { duplicateRowNumbers } = detectDuplicates(records);
      const errLog     = buildErrorLog(valResults);
      const { entries, summary } = reconcilePayments(records);
      const cleaned    = cleanDataset(records, valResults);
      const m          = computeMetrics(
        records,
        valResults,
        duplicateRowNumbers.size,
        summary.mismatched,
      );

      setValidationResults(valResults);
      setErrorLog(errLog);
      setReconciliationData(entries);
      setReconciliationSummary(summary);
      setCleanedData(cleaned);
      setMetrics(m);
      setHasRunValidation(true);
      setIsValidating(false);
    }, 0);
  }

  function loadDemoDataInternal() {
    const demo = generateDemoData();
    const { duplicateRowNumbers } = detectDuplicates(demo);
    const missingFieldRows = demo.filter(r =>
      [r.Order_ID, r.Customer_ID, r.Customer_Name, r.Email, r.Phone, r.Order_Date,
       r.Product, r.Quantity, r.Unit_Price, r.Order_Amount, r.Payment_ID,
       r.Payment_Amount, r.Payment_Status].some(v => !v.trim()),
    ).length;

    const summary: ImportSummary = {
      fileName:       DEMO_FILE_NAME,
      totalRows:      demo.length,
      parsedRows:     demo.length,
      malformedRows:  0,
      duplicateRows:  duplicateRowNumbers.size,
      missingFieldRows,
      importedAt:     new Date().toISOString(),
    };

    setRawData(demo);
    setImportSummary(summary);
    storage.setRawData(demo);
    storage.setImportSummary(summary);
    storage.setHasLoadedDemo(true);
    storage.setDemoDataVersion(DEMO_DATASET_VERSION);
    runValidationOn(demo);
  }

  // ─── Public Actions ───────────────────────────────────────────────────────

  const loadDemoData = useCallback(() => {
    loadDemoDataInternal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const importCsvData = useCallback((records: OrderRecord[], summary: ImportSummary) => {
    setRawData(records);
    setImportSummary(summary);
    storage.setRawData(records);
    storage.setImportSummary(summary);
    runValidationOn(records);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runValidation = useCallback(() => {
    if (rawData.length > 0) runValidationOn(rawData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawData]);

  const resetAll = useCallback(() => {
    storage.clearAll();
    setRawData([]);
    setValidationResults([]);
    setErrorLog([]);
    setReconciliationData([]);
    setReconciliationSummary(null);
    setCleanedData([]);
    setImportSummary(null);
    setHasRunValidation(false);
    setMetrics(null);
    setFiltersState({ searchText: '', paymentStatus: '', validationStatus: '', issueType: '' });
    // Reload demo data
    loadDemoDataInternal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setFilters = useCallback((f: FilterState) => {
    setFiltersState(f);
    storage.setFilters(f);
  }, []);

  const updateErrorStatus = useCallback((id: string, status: ErrorLogEntry['status']) => {
    setErrorLog(prev => prev.map(e => e.id === id ? { ...e, status } : e));
  }, []);

  // ─── Context Value ────────────────────────────────────────────────────────

  const value: DataContextValue = {
    rawData,
    validationResults,
    errorLog,
    reconciliationData,
    cleanedData,
    importSummary,
    filters,
    isValidating,
    hasRunValidation,
    reconciliationSummary,
    metrics,
    loadDemoData,
    importCsvData,
    runValidation,
    resetAll,
    setFilters,
    updateErrorStatus,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
}
