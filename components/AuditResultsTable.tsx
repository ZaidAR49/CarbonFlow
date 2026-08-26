'use client';

import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { AuditHistoryItem, AuditResult } from '@/lib/types';
import {
  formatNumber,
  parseNumber,
} from '@/lib/utils';

interface AuditResultsTableProps {
  results: AuditResult[];
  history: AuditHistoryItem[];
  activeHistoryId?: string;
  onSelectHistoryItem: (item: AuditHistoryItem) => void;
  onClearHistory: () => void;
  onReset: () => void;
}

const TYPE_ICON: Record<string, string> = {
  water: '💧',
  fuel: '⛽',
  gas: '🔥',
  diesel: '⛽',
  petrol: '⛽',
  oil: '🛢️',
  electricity: '⚡',
  solar: '☀️',
  waste: '🗑️',
  utility: '📄',
};

const TYPE_COLOR: Record<string, string> = {
  water: '#38BDF8',
  fuel: '#F59E0B',
  gas: '#FB923C',
  diesel: '#EA580C',
  petrol: '#F59E0B',
  oil: '#D97706',
  electricity: '#10B981',
  solar: '#FBBF24',
  waste: '#A855F7',
  utility: '#94A3B8',
};

export default function AuditResultsTable({
  results,
  history,
  activeHistoryId,
  onSelectHistoryItem,
  onClearHistory,
  onReset,
}: AuditResultsTableProps) {
  const t = useTranslations('results');

  // Summary calculations derived strictly from the active response
  const totalCO2e = results.reduce((sum, r) => sum + parseNumber(r.total_co2e), 0);
  const primaryCO2eUnit = results[0]?.co2e_unit || 'kg';

  // Total cost aggregated cleanly per currency
  const costByCurrency: Record<string, number> = {};
  results.forEach((r) => {
    const curr = (r.currency || 'USD').toUpperCase();
    costByCurrency[curr] = (costByCurrency[curr] || 0) + parseNumber(r.cost_amount);
  });

  // Type counts breakdown for the bills card
  const typeCounts: Record<string, number> = {};
  results.forEach((r) => {
    const typeKey = (r.type || 'utility').toLowerCase();
    typeCounts[typeKey] = (typeCounts[typeKey] || 0) + 1;
  });

  // Unique emission regions
  const uniqueRegions = Array.from(
    new Set(results.map((r) => r.emission_region).filter((reg) => reg && reg !== '—'))
  );

  return (
    <motion.div
      key="results"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-6xl mx-auto space-y-6"
    >
      {/* Top Action Bar & Session History Switcher */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{t('title')}</h2>
          <p className="text-sm text-[#64748B] mt-0.5">{t('subtitle')}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="new-audit-button"
            onClick={onReset}
            className="btn-emerald px-5 py-2.5 text-sm font-semibold flex items-center gap-2"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            {t('newAudit')}
          </button>
        </div>
      </div>

      {/* Session History Tabs Bar */}
      {history.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-3 flex items-center justify-between flex-wrap gap-3"
          style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
        >
          <div className="flex items-center gap-2 flex-wrap flex-1">
            <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] font-medium px-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{t('historyTab')}:</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {history.map((item, idx) => {
                const isActive = item.id === activeHistoryId || (!activeHistoryId && idx === 0);
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectHistoryItem(item)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
                    style={{
                      background: isActive
                        ? 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(5,150,105,0.15))'
                        : 'rgba(30, 41, 59, 0.6)',
                      border: `1px solid ${isActive ? '#10B981' : 'rgba(51, 65, 85, 0.6)'}`,
                      color: isActive ? '#34D399' : '#94A3B8',
                      boxShadow: isActive ? '0 0 15px rgba(16,185,129,0.25)' : 'none',
                    }}
                  >
                    <span className="font-bold">
                      #{history.length - idx}
                    </span>
                    <span className="text-[10px] text-[#64748B]">({item.dateStr})</span>
                    <span className="w-1 h-1 rounded-full bg-[#475569]" />
                    <span dir="ltr">{item.fileCount} bill{item.fileCount > 1 ? 's' : ''}</span>
                    <span className="w-1 h-1 rounded-full bg-[#475569]" />
                    <span dir="ltr" className="font-bold text-[#F8FAFC]">
                      {formatNumber(item.totalCO2e)} {item.co2eUnit}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={onClearHistory}
            className="text-[11px] text-[#64748B] hover:text-[#EF4444] transition-colors px-2 py-1"
          >
            {t('clearHistory')}
          </button>
        </motion.div>
      )}

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total CO2e */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="stat-card flex flex-col justify-between"
          style={{ minHeight: '140px' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#94A3B8] font-semibold uppercase tracking-wider">
              {t('totalCO2e')}
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(16,185,129,0.12)] border border-[rgba(16,185,129,0.25)] text-sm">
              ⚡
            </div>
          </div>

          <div className="flex items-baseline gap-2 flex-wrap" dir="ltr">
            <span className="text-3xl sm:text-4xl font-black neon-text font-mono tracking-tight">
              {formatNumber(totalCO2e)}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[rgba(16,185,129,0.15)] text-[#34D399] border border-[rgba(16,185,129,0.3)]">
              {primaryCO2eUnit} CO₂e
            </span>
          </div>

          <p className="text-[11px] text-[#475569] mt-2">Verified carbon emissions</p>
        </motion.div>

        {/* Card 2: Bills Analyzed */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="stat-card flex flex-col justify-between"
          style={{ minHeight: '140px' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#94A3B8] font-semibold uppercase tracking-wider">
              {t('filesAnalyzed')}
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(56,189,248,0.12)] border border-[rgba(56,189,248,0.25)] text-sm">
              📄
            </div>
          </div>

          <div className="flex items-baseline gap-2" dir="ltr">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono">
              {results.length}
            </span>
            <span className="text-xs text-[#64748B]">records</span>
          </div>

          {/* Type breakdown pills */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {Object.entries(typeCounts).map(([type, count]) => {
              const icon = TYPE_ICON[type] || '📄';
              const color = TYPE_COLOR[type] || '#94A3B8';
              return (
                <span
                  key={type}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-mono font-medium"
                  style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
                >
                  <span>{icon}</span>
                  <span className="capitalize">{type}: {count}</span>
                </span>
              );
            })}
          </div>
        </motion.div>

        {/* Card 3: Total Cost (Separated by Currency) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="stat-card flex flex-col justify-between"
          style={{ minHeight: '140px' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#94A3B8] font-semibold uppercase tracking-wider">
              {t('totalCost')}
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(245,158,11,0.12)] border border-[rgba(245,158,11,0.25)] text-sm">
              💳
            </div>
          </div>

          {/* Clean Currency Badges */}
          <div className="flex flex-wrap gap-2 pt-0.5">
            {Object.keys(costByCurrency).length > 0 ? (
              Object.entries(costByCurrency).map(([curr, amt]) => (
                <div
                  key={curr}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.25)]"
                >
                  <span className="text-xs font-bold text-[#F59E0B] font-mono">{curr}</span>
                  <span dir="ltr" className="text-base font-black text-white font-mono">
                    {formatNumber(amt)}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-xl font-bold text-[#64748B]">—</span>
            )}
          </div>

          <p className="text-[11px] text-[#475569] mt-2">Billed utility costs</p>
        </motion.div>

        {/* Card 4: Emission Regions */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          className="stat-card flex flex-col justify-between"
          style={{ minHeight: '140px' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#94A3B8] font-semibold uppercase tracking-wider">
              {t('regionsCount')}
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(168,85,247,0.12)] border border-[rgba(168,85,247,0.25)] text-sm">
              📍
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {uniqueRegions.length > 0 ? (
              uniqueRegions.map((reg) => (
                <span
                  key={reg}
                  className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded-lg bg-[rgba(56,189,248,0.1)] text-[#38BDF8] border border-[rgba(56,189,248,0.25)] font-semibold"
                >
                  📍 {reg}
                </span>
              ))
            ) : (
              <span className="text-base font-mono text-[#64748B]">Global</span>
            )}
          </div>

          <p className="text-[11px] text-[#475569] mt-2">Emission calculation zones</p>
        </motion.div>
      </div>

      {/* Main Results Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card overflow-hidden border border-[rgba(16,185,129,0.18)]"
      >
        <div className="overflow-x-auto">
          <table className="audit-table">
            <thead>
              <tr>
                <th>{t('table.type')}</th>
                <th>{t('table.company')}</th>
                <th>{t('table.consumption')}</th>
                <th>{t('table.cost')}</th>
                <th>{t('table.co2e')}</th>
                <th>{t('table.region')}</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, i) => {
                const typeKey = (result.type || 'utility').toLowerCase();
                const icon = TYPE_ICON[typeKey] ?? '📄';
                const color = TYPE_COLOR[typeKey] ?? '#94A3B8';
                const itemCO2e = parseNumber(result.total_co2e);

                return (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.04 }}
                  >
                    {/* Type */}
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm shadow-sm"
                          style={{ background: `${color}18`, border: `1px solid ${color}35` }}
                        >
                          {icon}
                        </div>
                        <span
                          className="font-semibold capitalize text-sm tracking-wide"
                          style={{ color }}
                        >
                          {result.type || '—'}
                        </span>
                      </div>
                    </td>

                    {/* Company */}
                    <td>
                      <span
                        className="text-[#E2E8F0] font-medium max-w-[240px] truncate block"
                        title={result.company_name}
                      >
                        {result.company_name || '—'}
                      </span>
                    </td>

                    {/* Consumption */}
                    <td>
                      <div dir="ltr" className="inline-flex items-baseline gap-1.5 font-mono">
                        <span className="text-[#F1F5F9] font-bold text-sm">
                          {formatNumber(result.consumption_value)}
                        </span>
                        <span className="text-[#94A3B8] text-xs font-normal">
                          {result.consumption_unit || ''}
                        </span>
                      </div>
                    </td>

                    {/* Cost */}
                    <td>
                      <div dir="ltr" className="inline-flex items-baseline gap-1.5 font-mono">
                        <span className="text-[#F1F5F9] font-bold text-sm">
                          {formatNumber(result.cost_amount)}
                        </span>
                        <span className="text-[#F59E0B] text-xs font-semibold">
                          {result.currency || ''}
                        </span>
                      </div>
                    </td>

                    {/* CO2e */}
                    <td>
                      <div dir="ltr" className="inline-flex items-baseline gap-1.5 font-mono">
                        <span className="font-bold neon-text text-base">
                          {formatNumber(itemCO2e)}
                        </span>
                        <span className="text-[#34D399] text-xs font-normal">
                          {result.co2e_unit || 'kg'}
                        </span>
                      </div>
                    </td>

                    {/* Region */}
                    <td>
                      {result.emission_region && result.emission_region !== '—' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded bg-[#1E293B] text-[#94A3B8] border border-[#334155]">
                          📍 {result.emission_region}
                        </span>
                      ) : (
                        <span className="text-[#475569]">—</span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
