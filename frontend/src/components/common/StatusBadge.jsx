import React from 'react';
import { CheckCircle2, Clock, Star } from 'lucide-react';

/**
 * StatusBadge component
 */
export function StatusBadge({ status, isFeatured = false, className = '' }) {
  if (isFeatured) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-xs ${className}`}
      >
        <Star className="w-3.5 h-3.5 fill-[#F2B705] text-amber-600" />
        <span>Unggulan</span>
      </span>
    );
  }

  const isPublished = status === 'published';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-xs ${
        isPublished
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-amber-50 text-amber-700 border-amber-200'
      } ${className}`}
    >
      {isPublished ? (
        <>
          <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
          <span>Dipublikasi</span>
        </>
      ) : (
        <>
          <Clock className="w-3 h-3 text-[#F59E0B]" />
          <span>Draft</span>
        </>
      )}
    </span>
  );
}

export default StatusBadge;
