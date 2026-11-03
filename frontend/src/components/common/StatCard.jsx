import React from 'react';

/**
 * StatCard — kartu ringkasan statistik.
 *
 * Perbaikan layout:
 * - Ikon shrink-0 agar tidak terdesak teks pendek maupun panjang.
 * - Judul pakai min-w-0 + line-clamp-2 supaya tidak menimpa ikon.
 * - Nilai pakai whitespace-nowrap agar "4.4 ★" tidak pecah baris.
 * - Bagian bawah disusun vertikal (flex-col gap-1) sehingga deskripsi
 *   dan badge tidak saling tumpuk di kartu sempit.
 * - h-full supaya kartu dalam satu baris flex mempunyai tinggi seragam.
 */
export function StatCard({
  title,
  value,
  icon: Icon,
  badgeText,
  badgeColor = 'blue',
  description,
  className = '',
}) {
  const badgeStyles = {
    blue:    'bg-blue-50 text-[#0B2E6B]',
    amber:   'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-[#16A34A]',
    indigo:  'bg-indigo-50 text-indigo-700',
  };

  const iconBgStyles = {
    blue:    'bg-blue-100 text-[#0B2E6B]',
    amber:   'bg-amber-100 text-amber-600',
    emerald: 'bg-emerald-100 text-[#16A34A]',
    indigo:  'bg-indigo-100 text-indigo-600',
  };

  return (
    <div
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full min-w-0 ${className}`}
    >
      {/* Top row: title block + icon */}
      <div className="flex items-start gap-3">
        {/* Text block: takes remaining space, truncates gracefully */}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider leading-tight line-clamp-2">
            {title}
          </p>
          {/* Value: never wraps, scale font down on small cards */}
          <p className="text-2xl font-extrabold text-[#0F172A] mt-1.5 font-heading tracking-tight whitespace-nowrap">
            {value}
          </p>
        </div>

        {/* Icon: fixed size, never shrinks */}
        {Icon && (
          <div className={`p-2.5 rounded-xl shrink-0 ${iconBgStyles[badgeColor] || iconBgStyles.blue}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Bottom row: description then badge, stacked vertically */}
      {(description || badgeText) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-1 min-w-0">
          {description && (
            <span className="text-xs text-slate-500 truncate">{description}</span>
          )}
          {badgeText && (
            <span
              className={`self-start text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                badgeStyles[badgeColor] || badgeStyles.blue
              }`}
            >
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default StatCard;
