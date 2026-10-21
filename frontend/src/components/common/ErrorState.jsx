import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button.jsx';

/**
 * ErrorState component
 */
export function ErrorState({
  title = 'Gagal Memuat Data',
  message = 'Terjadi gangguan saat mengambil data. Silakan coba beberapa saat lagi.',
  onRetry,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl bg-rose-50/50 border border-rose-200 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-rose-100 text-[#DC2626] flex items-center justify-center mb-4">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 font-heading mb-1.5">{title}</h3>
      <p className="text-sm text-slate-600 max-w-md mb-6">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} icon={RefreshCw} variant="outline" size="sm">
          Coba Lagi
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
