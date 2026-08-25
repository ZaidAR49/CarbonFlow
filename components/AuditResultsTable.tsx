'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { AuditResult } from '@/lib/types';
import {
  formatCO2e,
  generateCSV,
  getTreesEquivalent,
  getCarKmEquivalent,
  getFlightsEquivalent,
} from '@/lib/utils';

interface AuditResultsTableProps {
  results: AuditResult[];
  onReset: () => void;
}

export default function AuditResultsTable({ results, onReset }: AuditResultsTableProps) {
  const t = useTranslations('results');

  // Summary calculations
  const successful = results.filter((r) => r.status === 'success');
  const totalCO2e = successful.reduce((sum, r) => sum + (r.co2e_kg ?? 0), 0);
  const scope1Total = successful
    .filter((r) => r.scope === 'Scope 1')
    .reduce((sum, r) => sum + (r.co2e_kg ?? 0), 0);
  const scope2Total = successful
    .filter((r) => r.scope === 'Scope 2')
    .reduce((sum, r) => sum + (r.co2e_kg ?? 0), 0);

  const handleDownloadCSV = () => {
    const csv = generateCSV(results);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carbon-audit-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      key="results"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-6xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">{t('title')}</h2>
          <p className="text-sm text-[#64748B] mt-0.5">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="download-csv-button"
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all"
            style={{
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.25)',
              color: '#10B981',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(16,185,129,0.18)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(16,185,129,0.1)';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {t('downloadCSV')}
          </button>
          <button
            id="new-audit-button"
            onClick={onReset}
            className="btn-emerald px-4 py-2 text-sm font-semibold flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-3.11" />
            </svg>
            {t('newAudit')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total CO2e */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="stat-card col-span-2 sm:col-span-1"
          style={{ gridColumn: 'span 1' }}
        >
          <p className="text-xs text-[#64748B] uppercase tracking-widest font-semibold mb-2">
            {t('totalCO2e')}
          </p>
          <p
            className="text-3xl font-black neon-text font-mono"
            style={{ lineHeight: 1 }}
          >
            {formatCO2e(totalCO2e)}
          </p>
          <p className="text-xs text-[#475569] mt-1 font-mono">CO₂ equivalent</p>
        </motion.div>

        {/* Bills analyzed */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="stat-card"
        >
          <p className="text-xs text-[#64748B] uppercase tracking-widest font-semibold mb-2">
            {t('filesAnalyzed')}
          </p>
          <p className="text-3xl font-black text-white font-mono" style={{ lineHeight: 1 }}>
            {results.length}
          </p>
          <p className="text-xs text-[#475569] mt-1">
            {successful.length} processed
          </p>
        </motion.div>

        {/* Scope 1 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="stat-card"
        >
          <p className="text-xs text-[#64748B] uppercase tracking-widest font-semibold mb-2">
            {t('scope1Total')}
          </p>
          <p className="text-3xl font-black text-[#F59E0B] font-mono" style={{ lineHeight: 1 }}>
            {formatCO2e(scope1Total)}
          </p>
          <p className="text-xs text-[#475569] mt-1">Direct emissions</p>
        </motion.div>

        {/* Scope 2 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="stat-card"
        >
          <p className="text-xs text-[#64748B] uppercase tracking-widest font-semibold mb-2">
            {t('scope2Total')}
          </p>
          <p className="text-3xl font-black text-[#10B981] font-mono" style={{ lineHeight: 1 }}>
            {formatCO2e(scope2Total)}
          </p>
          <p className="text-xs text-[#475569] mt-1">Indirect emissions</p>
        </motion.div>
      </div>

      {/* Equivalents bar */}
      {totalCO2e > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4 flex flex-wrap gap-6 justify-center sm:justify-start"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌳</span>
            <div>
              <p className="text-lg font-bold text-white font-mono">
                {getTreesEquivalent(totalCO2e).toLocaleString()}
              </p>
              <p className="text-xs text-[#64748B]">{t('equivalents.trees')}</p>
            </div>
          </div>
          <div className="w-px h-10 bg-[#1E293B] hidden sm:block" />
          <div className="flex items-center gap-3">
            <span className="text-2xl">✈️</span>
            <div>
              <p className="text-lg font-bold text-white font-mono">
                {getFlightsEquivalent(totalCO2e)}
              </p>
              <p className="text-xs text-[#64748B]">{t('equivalents.flights')}</p>
            </div>
          </div>
          <div className="w-px h-10 bg-[#1E293B] hidden sm:block" />
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚗</span>
            <div>
              <p className="text-lg font-bold text-white font-mono">
                {getCarKmEquivalent(totalCO2e).toLocaleString()}
              </p>
              <p className="text-xs text-[#64748B]">{t('equivalents.carKm')}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="audit-table">
            <thead>
              <tr>
                <th>{t('table.fileName')}</th>
                <th>{t('table.status')}</th>
                <th>{t('table.consumption')}</th>
                <th>{t('table.co2e')}</th>
                <th>{t('table.scope')}</th>
                <th>{t('table.equivalents')}</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                >
                  {/* File name */}
                  <td>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(16,185,129,0.1)' }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                      <span
                        className="text-[#CBD5E1] font-medium max-w-[160px] truncate"
                        title={result.fileName}
                      >
                        {result.fileName}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td>
                    <span className={result.status === 'success' ? 'badge-success' : 'badge-error'}>
                      {result.status === 'success' ? t('status.success') : t('status.error')}
                    </span>
                  </td>

                  {/* Consumption */}
                  <td>
                    {result.original_value != null ? (
                      <span className="font-mono text-[#94A3B8]">
                        {result.original_value.toLocaleString()}{' '}
                        <span className="text-[#475569] text-xs">{result.unit}</span>
                      </span>
                    ) : (
                      <span className="text-[#334155]">—</span>
                    )}
                  </td>

                  {/* CO2e */}
                  <td>
                    {result.co2e_kg != null ? (
                      <span className="font-mono font-bold neon-text">
                        {result.co2e_kg.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-[#334155]">—</span>
                    )}
                  </td>

                  {/* Scope */}
                  <td>
                    {result.scope ? (
                      <span className={result.scope === 'Scope 1' ? 'badge-scope1' : 'badge-scope2'}>
                        {result.scope}
                      </span>
                    ) : (
                      <span className="text-[#334155]">—</span>
                    )}
                  </td>

                  {/* Equivalents */}
                  <td>
                    {result.co2e_kg != null && result.co2e_kg > 0 ? (
                      <div className="flex items-center gap-2 text-xs text-[#64748B]">
                        <span>🌳 {getTreesEquivalent(result.co2e_kg)}</span>
                        <span>·</span>
                        <span>🚗 {getCarKmEquivalent(result.co2e_kg)} km</span>
                      </div>
                    ) : (
                      <span className="text-[#334155]">—</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
