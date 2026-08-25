import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatCO2e(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(2)} t`;
  return `${kg.toFixed(1)} kg`;
}

export function getTreesEquivalent(co2eKg: number): number {
  // 1 tree absorbs ~21 kg CO2/year
  return Math.ceil(co2eKg / 21);
}

export function getCarKmEquivalent(co2eKg: number): number {
  // Average car emits ~0.12 kg CO2 per km
  return Math.round(co2eKg / 0.12);
}

export function getFlightsEquivalent(co2eKg: number): number {
  // Short-haul flight ~255 kg CO2e
  return parseFloat((co2eKg / 255).toFixed(1));
}

export function generateCSV(results: import('./types').AuditResult[]): string {
  const headers = ['File Name', 'Status', 'Original Value', 'Unit', 'CO2e (kg)', 'Scope'];
  const rows = results.map((r) => [
    r.fileName,
    r.status,
    r.original_value ?? '',
    r.unit ?? '',
    r.co2e_kg ?? '',
    r.scope ?? '',
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
