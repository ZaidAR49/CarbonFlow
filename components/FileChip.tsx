'use client';

import { useTranslations } from 'next-intl';
import { formatFileSize } from '@/lib/utils';

interface FileChipProps {
  file: File;
  onRemove: (file: File) => void;
}

export default function FileChip({ file, onRemove }: FileChipProps) {
  const t = useTranslations('upload');

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    }
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    );
  };

  return (
    <div className="file-chip flex items-center gap-2 px-3 py-2 group">
      <div className="flex-shrink-0">{getFileIcon(file.name)}</div>

      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-medium text-[#F8FAFC] truncate max-w-[140px]"
          title={file.name}
        >
          {file.name}
        </p>
        <p className="text-[10px] text-[#64748B] font-mono">{formatFileSize(file.size)}</p>
      </div>

      <button
        onClick={() => onRemove(file)}
        title={t('removeFile')}
        id={`remove-file-${file.name.replace(/[^a-z0-9]/gi, '-')}`}
        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
        style={{
          background: 'rgba(239,68,68,0.15)',
          border: '1px solid rgba(239,68,68,0.3)',
          color: '#EF4444',
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
