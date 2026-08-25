'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import FileUploadZone from '@/components/FileUploadZone';
import CarbonLoadingScreen from '@/components/CarbonLoadingScreen';
import AuditResultsTable from '@/components/AuditResultsTable';
import { AppState } from '@/lib/types';
import type { AuditResult } from '@/lib/types';

export default function HomePage() {
  const t = useTranslations('errors');
  const [appState, setAppState] = useState<AppState>('upload');
  const [results, setResults] = useState<AuditResult[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAudit = async (files: File[]) => {
    setIsLoading(true);
    setAppState('loading');
    setErrorMessage('');

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/audit', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error || `Server error ${response.status}`);
      }

      const data = await response.json();

      // Handle both array and object response from n8n
      const resultsArray: AuditResult[] = Array.isArray(data)
        ? data
        : data.results ?? [];

      setResults(resultsArray);
      setAppState('results');
    } catch (error) {
      console.error('Audit error:', error);
      const msg =
        error instanceof TypeError
          ? t('networkError')
          : t('auditFailed');
      setErrorMessage(msg);
      setAppState('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAppState('upload');
    setResults([]);
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
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-12">
          <AnimatePresence mode="wait">
            {/* Upload state */}
            {(appState === 'upload' || appState === 'error') && (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="w-full"
              >
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
                <AuditResultsTable results={results} onReset={handleReset} />
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
