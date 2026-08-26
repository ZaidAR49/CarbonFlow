import { AuditHistoryItem, AuditResult } from './types';
import { parseNumber } from './normalize';

const SESSION_STORAGE_KEY = 'carbonflow_audit_history';

/**
 * Loads the audit history stored in the current browser session.
 */
export function getSessionAuditHistory(): AuditHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to read audit history from sessionStorage:', err);
    return [];
  }
}

/**
 * Saves a new audit run into session history and returns the updated history list.
 */
export function addAuditToSessionHistory(
  results: AuditResult[],
  fileCount: number
): AuditHistoryItem[] {
  if (typeof window === 'undefined' || results.length === 0) return [];
  try {
    const history = getSessionAuditHistory();
    const totalCO2e = results.reduce((sum, r) => sum + parseNumber(r.total_co2e), 0);
    const co2eUnit = results[0]?.co2e_unit || 'kg';

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newItem: AuditHistoryItem = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      dateStr: timeStr,
      results,
      totalCO2e,
      co2eUnit,
      fileCount: fileCount || results.length,
    };

    // Store newest first, keep up to 10 in session
    const updated = [newItem, ...history].slice(0, 10);
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to save audit to sessionStorage:', err);
    return [];
  }
}

/**
 * Clears the session history.
 */
export function clearSessionAuditHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear sessionStorage:', err);
  }
}
