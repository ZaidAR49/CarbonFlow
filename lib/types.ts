export interface AuditResult {
  fileName: string;
  status: 'success' | 'error';
  co2e_kg?: number;
  original_value?: number;
  unit?: string;
  scope?: 'Scope 1' | 'Scope 2';
  error?: string;
}

export interface AuditResponse {
  results: AuditResult[];
}

export type Locale = 'en' | 'ar';

export type AppState = 'upload' | 'loading' | 'results' | 'error';
