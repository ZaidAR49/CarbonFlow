import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { parseNumber, normalizeAuditResults } from './normalize';
import type { AuditResult } from './types';

export { parseNumber, normalizeAuditResults };

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatNumber(val: unknown, decimals: number = 2): string {
  const num = typeof val === 'number' ? (isNaN(val) ? 0 : val) : parseNumber(val);
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

export function formatCO2e(kg: unknown, unit: string = 'kg'): string {
  const num = typeof kg === 'number' ? (isNaN(kg) ? 0 : kg) : parseNumber(kg);
  if (unit.toLowerCase() === 't' || unit.toLowerCase() === 'ton' || unit.toLowerCase() === 'tons') {
    return `${num.toLocaleString(undefined, { maximumFractionDigits: 2 })} t`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })} t`;
  }
  return `${num.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unit}`;
}

export function generateCSV(results: AuditResult[]): string {
  const headers = [
    'Type',
    'Company / Provider',
    'Consumption Value',
    'Consumption Unit',
    'Cost Amount',
    'Currency',
    'Total CO2e',
    'CO2e Unit',
    'Emission Region',
  ];
  const rows = results.map((r) => [
    r.type,
    `"${(r.company_name || '').replace(/"/g, '""')}"`,
    r.consumption_value,
    r.consumption_unit,
    r.cost_amount,
    r.currency,
    r.total_co2e,
    r.co2e_unit,
    r.emission_region,
  ]);
  return [headers, ...rows].map((row) => row.join(',')).join('\n');
}

export const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/webp',
];

export const ACCEPTED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.webp'];
export const MAX_FILES = 25;
