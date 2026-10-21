import React from 'react';

/**
 * Loading Skeleton elements
 */
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs animate-pulse">
      <div className="h-48 bg-slate-200 w-full" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 bg-slate-200 rounded-md w-24" />
          <div className="h-5 bg-slate-200 rounded-md w-16" />
        </div>
        <div className="h-6 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-200 rounded w-full" />
        <div className="h-4 bg-slate-200 rounded w-2/3" />
        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
          <div className="h-4 bg-slate-200 rounded w-28" />
          <div className="h-4 bg-slate-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTableRows({ count = 5 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <tr key={idx} className="border-b border-slate-100 animate-pulse">
          <td className="py-4 px-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-slate-200 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 bg-slate-200 rounded w-40" />
                <div className="h-3 bg-slate-200 rounded w-24" />
              </div>
            </div>
          </td>
          <td className="py-4 px-4">
            <div className="h-4 bg-slate-200 rounded w-28" />
          </td>
          <td className="py-4 px-4">
            <div className="h-4 bg-slate-200 rounded w-24" />
          </td>
          <td className="py-4 px-4">
            <div className="h-6 bg-slate-200 rounded-full w-20" />
          </td>
          <td className="py-4 px-4 text-right">
            <div className="h-8 bg-slate-200 rounded-lg w-24 inline-block" />
          </td>
        </tr>
      ))}
    </>
  );
}

export function LoadingSpinner({ text = 'Memuat data...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-[#0B2E6B] rounded-full animate-spin mb-4" />
      <p className="text-sm font-medium text-slate-500">{text}</p>
    </div>
  );
}

export default { SkeletonCard, SkeletonTableRows, LoadingSpinner };
