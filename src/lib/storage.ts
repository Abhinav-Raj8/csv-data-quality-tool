import type { OrderRecord, FilterState, ImportSummary } from '../types';

const KEYS = {
  RAW_DATA: 'dqrs_raw_data',
  FILTERS: 'dqrs_filters',
  IMPORT_SUMMARY: 'dqrs_import_summary',
  HAS_LOADED_DEMO: 'dqrs_has_loaded_demo',
  DEMO_DATA_VERSION: 'dqrs_demo_data_version',
} as const;

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`[Storage] Failed to save key "${key}":`, e);
  }
}

function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

// ─── Raw Data ─────────────────────────────────────────────────────────────────
export const storage = {
  getRawData: (): OrderRecord[] => safeGet<OrderRecord[]>(KEYS.RAW_DATA, []),
  setRawData: (data: OrderRecord[]): void => safeSet(KEYS.RAW_DATA, data),

  getFilters: (): FilterState =>
    safeGet<FilterState>(KEYS.FILTERS, {
      searchText: '',
      paymentStatus: '',
      validationStatus: '',
      issueType: '',
    }),
  setFilters: (filters: FilterState): void => safeSet(KEYS.FILTERS, filters),

  getImportSummary: (): ImportSummary | null => safeGet<ImportSummary | null>(KEYS.IMPORT_SUMMARY, null),
  setImportSummary: (summary: ImportSummary | null): void => safeSet(KEYS.IMPORT_SUMMARY, summary),

  getHasLoadedDemo: (): boolean => safeGet<boolean>(KEYS.HAS_LOADED_DEMO, false),
  setHasLoadedDemo: (v: boolean): void => safeSet(KEYS.HAS_LOADED_DEMO, v),

  getDemoDataVersion: (): number | null => safeGet<number | null>(KEYS.DEMO_DATA_VERSION, null),
  setDemoDataVersion: (v: number): void => safeSet(KEYS.DEMO_DATA_VERSION, v),

  clearAll: (): void => {
    Object.values(KEYS).forEach(safeRemove);
  },
};
