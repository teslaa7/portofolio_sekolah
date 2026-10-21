import React from 'react';
import { FolderSearch, Plus } from 'lucide-react';
import { Button } from './Button.jsx';

/**
 * EmptyState component
 */
export function EmptyState({
  title = 'Tidak ada karya ditemukan',
  description = 'Coba ubah kata kunci pencarian atau bersihkan filter yang aktif.',
  icon: Icon = FolderSearch,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-white border border-dashed border-slate-300 ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0B2E6B] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-[#0F172A] font-heading mb-1.5">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} icon={Plus} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
