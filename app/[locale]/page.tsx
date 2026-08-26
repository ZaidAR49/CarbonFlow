'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import FileUploadZone from '@/components/FileUploadZone';
import CarbonLoadingScreen from '@/components/CarbonLoadingScreen';
import AuditResultsTable from '@/components/AuditResultsTable';
import { normalizeAuditResults } from '@/lib/normalize';
import {
  getSessionAuditHistory,
  addAuditToSessionHistory,
  clearSessionAuditHistory,
} from '@/lib/session-storage';
import { AppState, AuditHistoryItem } from '@/lib/types';
import type { AuditResult } from '@/lib/types';

export default function HomePage() {
  const t = useTranslations('errors');
  const tUpload = useTranslations('upload');
  const [appState, setAppState] = useState<AppState>('upload');
  const [results, setResults] = useState<AuditResult[]>([]);
  const [history, setHistory] = useState<AuditHistoryItem[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load session history on mount
  useEffect(() => {
    const saved = getSessionAuditHistory();
    if (saved && saved.length > 0) {
      setHistory(saved);
    }
  }, []);

  const handleAudit = async (files: File[]) => {
    setIsLoading(true);
    setAppState('loading');
    setErrorMessage('');

    try {
      const formData = new FormData();
      // Send each file exactly once under the 'files' field
      files.forEach((file) => {
        formData.append('files', file);
      });

      console.log(`[Frontend] Dispatching ${files.length} unique file(s) to /api/audit`);

      const response = await fetch('/api/audit', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.details || err?.error || `Server error ${response.status}`);
      }

      const data = await response.json();
      console.log('[Audit] Response received:', data);

      const resultsArray: AuditResult[] = normalizeAuditResults(data);

      if (resultsArray.length === 0) {
        console.warn('[Audit] No structured results found in payload:', data);
      }

      // Save into session storage cache
      const updatedHistory = addAuditToSessionHistory(resultsArray, files.length);
      setHistory(updatedHistory);
      setActiveHistoryId(updatedHistory[0]?.id);
      setResults(resultsArray);
      setAppState('results');
    } catch (error) {
      console.error('[Audit] Error occurred:', error);
      const msg =
        error instanceof TypeError
          ? t('networkError')
          : error instanceof Error
          ? error.message
          : t('auditFailed');
      setErrorMessage(msg);
      setAppState('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistoryItem = (item: AuditHistoryItem) => {
    setActiveHistoryId(item.id);
    setResults(item.results);
    setAppState('results');
  };

  const handleClearHistory = () => {
    clearSessionAuditHistory();
    setHistory([]);
    setActiveHistoryId(undefined);
  };

  const handleReset = () => {
    setAppState('upload');
    setErrorMessage('');
  };

  return (
    <div
      className="min-h-screen relative"
      style={{ background: 'linear-gradient(160deg, #0F172A 0%, #042f1e 50%, #0F172A 100%)' }}
    >
      {/* Circuit grid overlay */}
      <div className="circuit-grid" />

      {/* Ambient glow spots */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center top, rgba(16,185,129,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        {/* Main content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-10">
          <AnimatePresence mode="wait">
            {/* Upload state */}
            {(appState === 'upload' || appState === 'error') && (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="w-full space-y-4"
              >
                {/* Previous session history banner if available */}
                {history.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto flex items-center justify-between p-3 px-4 rounded-xl glass-card text-xs text-[#94A3B8]"
                    style={{ border: '1px solid rgba(16,185,129,0.2)' }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                      <span>
                        {tUpload('viewHistory', { count: history.length })}
                      </span>
                    </div>

                    <button
                      onClick={() => handleSelectHistoryItem(history[0])}
                      className="text-[#34D399] hover:underline font-semibold flex items-center gap-1"
                    >
                      <span>Review last calculation ({history[0].results.length} bills)</span>
                      <span>→</span>
                    </button>
                  </motion.div>
                )}

                <FileUploadZone onSubmit={handleAudit} isLoading={isLoading} />

                {/* Error state banner */}
                {appState === 'error' && errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 max-w-3xl mx-auto px-5 py-4 rounded-xl flex items-center gap-3"
                    style={{
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.25)',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p className="text-sm text-[#FCA5A5]">{errorMessage}</p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Loading state */}
            {appState === 'loading' && (
              <motion.div
                key="loading-wrapper"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex items-center justify-center"
              >
                <CarbonLoadingScreen />
              </motion.div>
            )}

            {/* Results state */}
            {appState === 'results' && (
              <motion.div
                key="results-wrapper"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <AuditResultsTable
                  results={results}
                  history={history}
                  activeHistoryId={activeHistoryId}
                  onSelectHistoryItem={handleSelectHistoryItem}
                  onClearHistory={handleClearHistory}
                  onReset={handleReset}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="relative z-10 text-center pb-8 px-4">
          <div
            className="mb-4 h-px max-w-2xl mx-auto"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.2), transparent)' }}
          />
          <p className="text-xs text-[#334155] font-mono">
            EcoAudit ·{' '}
            <span className="text-[#10B981]">Scope 1 & 2 Emission Intelligence</span>
            {' · '}
            Powered by AI OCR
          </p>
        </footer>
      </div>
    </div>
  );
}
