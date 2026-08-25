'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import FileChip from './FileChip';
import { ACCEPTED_EXTENSIONS, ACCEPTED_FILE_TYPES, MAX_FILES } from '@/lib/utils';

interface FileUploadZoneProps {
  onSubmit: (files: File[]) => void;
  isLoading: boolean;
}

export default function FileUploadZone({ onSubmit, isLoading }: FileUploadZoneProps) {
  const t = useTranslations('upload');
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndAdd = useCallback(
    (incoming: FileList | File[]) => {
      const newErrors: string[] = [];
      const valid: File[] = [];

      Array.from(incoming).forEach((file) => {
        const ext = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!ACCEPTED_EXTENSIONS.includes(ext) && !ACCEPTED_FILE_TYPES.includes(file.type)) {
          newErrors.push(t('errors.invalidType', { name: file.name }));
        } else {
          valid.push(file);
        }
      });

      setFiles((prev) => {
        const combined = [...prev, ...valid];
        if (combined.length > MAX_FILES) {
          newErrors.push(t('errors.tooManyFiles'));
          setErrors(newErrors);
          return prev.slice(0, MAX_FILES);
        }
        setErrors(newErrors);
        return combined;
      });
    },
    [t]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      validateAndAdd(e.dataTransfer.files);
    },
    [validateAndAdd]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) validateAndAdd(e.target.files);
    e.target.value = '';
  };

  const removeFile = (file: File) => {
    setFiles((prev) => prev.filter((f) => f !== file));
  };

  const handleSubmit = () => {
    if (files.length === 0) {
      setErrors([t('errors.noFiles')]);
      return;
    }
    setErrors([]);
    onSubmit(files);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Hero text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="text-center space-y-2"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-white">
          {t('title')}
        </h2>
        <p className="text-sm text-[#64748B]">{t('subtitle')}</p>
      </motion.div>

      {/* Drop Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div
          className={`drop-zone ${isDragging ? 'active' : ''} cursor-pointer`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          id="file-drop-zone"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          style={{ padding: '40px 24px', minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}
        >
          {/* Animated upload icon */}
          <motion.div
            animate={isDragging ? { scale: 1.15, y: -4 } : { scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
              style={{
                background: isDragging
                  ? 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.15))'
                  : 'rgba(16,185,129,0.08)',
                border: `1.5px solid ${isDragging ? '#10B981' : 'rgba(16,185,129,0.2)'}`,
                boxShadow: isDragging ? '0 0 30px rgba(16,185,129,0.3)' : 'none',
                transition: 'all 0.3s ease',
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isDragging ? '#10B981' : '#64748B'}
                strokeWidth="1.5"
                style={{ transition: 'stroke 0.3s ease' }}
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
          </motion.div>

          <div className="text-center space-y-1">
            <p className="text-base font-medium text-[#CBD5E1]">
              {t('dragText')}
            </p>
            <p className="text-sm text-[#475569]">{t('orText')}</p>
          </div>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
            id="browse-files-button"
            className="btn-emerald px-6 py-2.5 text-sm font-semibold"
            style={{ minWidth: '140px' }}
          >
            {t('browseButton')}
          </button>

          <div className="flex items-center gap-4 text-xs text-[#475569]">
            <span>{t('supportedFormats')}</span>
            <span className="w-1 h-1 rounded-full bg-[#334155]" />
            <span>{t('maxFiles')}</span>
          </div>

          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={handleInputChange}
            id="file-input"
          />
        </div>
      </motion.div>

      {/* Errors */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1"
          >
            {errors.map((err, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  color: '#FCA5A5',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {err}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Chips Grid */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#64748B] uppercase tracking-widest">
                {t('filesSelected', { count: files.length })}
              </span>
              <button
                onClick={() => setFiles([])}
                className="text-xs text-[#475569] hover:text-[#EF4444] transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[240px] overflow-y-auto pr-1">
              {files.map((file, i) => (
                <motion.div
                  key={`${file.name}-${i}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15, delay: i * 0.03 }}
                >
                  <FileChip file={file} onRemove={removeFile} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <button
          id="run-audit-button"
          onClick={handleSubmit}
          disabled={isLoading || files.length === 0}
          className="btn-emerald w-full py-4 text-base font-bold flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              {t('auditButtonLoading')}
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              {t('auditButton')}
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
