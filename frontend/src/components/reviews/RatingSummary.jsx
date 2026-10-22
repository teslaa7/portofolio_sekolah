import React from 'react';
import { StarRating } from './StarRating.jsx';

/**
 * Ringkasan rating: angka besar, bintang, jumlah, dan bar distribusi.
 * @param {{ average: number, count: number, distribution: {1:n,...,5:n} }} summary
 */
export function RatingSummary({ summary }) {
  const { average = 0, count = 0, distribution = {} } = summary || {};

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
      <h3 className="text-lg font-bold text-[#0F172A] font-heading mb-5">Ringkasan Rating</h3>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Angka rata-rata besar */}
        <div className="flex flex-col items-center justify-center bg-[#F5F8FF] rounded-2xl p-5 min-w-[110px]">
          <span className="text-4xl font-extrabold text-[#0B2E6B] font-heading leading-none">
            {count > 0 ? average.toFixed(1) : '—'}
          </span>
          <StarRating value={average} readonly size="md" />
          <span className="text-xs text-slate-500 mt-1">
            {count > 0 ? `${count} ulasan` : 'Belum ada'}
          </span>
        </div>

        {/* Bar distribusi */}
        <div className="flex-1 space-y-2 w-full">
          {[5, 4, 3, 2, 1].map((star) => {
            const n = distribution[star] || 0;
            const pct = count > 0 ? Math.round((n / count) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-4 text-right text-slate-600 font-semibold">{star}</span>
                <span className="text-[#F2B705] text-sm">★</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#F2B705] rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-6 text-slate-500">{n}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RatingSummary;
