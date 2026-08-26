export interface AuditResult {
  type: string;
  company_name: string;
  consumption_value: number;
  consumption_unit: string;
  cost_amount: number;
  currency: string;
  total_co2e: number;
  co2e_unit: string;
  emission_region: string;
}

export interface AuditHistoryItem {
  id: string;
  timestamp: number;
  dateStr: string;
  results: AuditResult[];
  totalCO2e: number;
  co2eUnit: string;
  fileCount: number;
}

export interface AuditResponse {
  results: AuditResult[];
  fileCount?: number;
  errors?: string[];
  raw?: unknown;
}

export type Locale = 'en' | 'ar';

export type AppState = 'upload' | 'loading' | 'results' | 'error';
