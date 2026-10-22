import React, { useState } from 'react';
import { Star } from 'lucide-react';

/**
 * Komponen bintang yang dapat dipakai dalam dua mode:
 * - readonly: menampilkan nilai (mendukung setengah bintang via clip-path)
 * - interaktif: klik + hover, akses keyboard
 *
 * @param {number} value       - nilai saat ini (1–5, boleh desimal untuk readonly)
 * @param {boolean} readonly   - mode tampilan saja
 * @param {function} onChange  - dipanggil saat user klik bintang (interaktif)
 * @param {string} size        - 'sm' | 'md' | 'lg'
 */
export function StarRating({ value = 0, readonly = false, onChange, size = 'md' }) {
  const [hovered, setHovered] = useState(0);

  const sizeMap = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };
  const iconClass = sizeMap[size] || sizeMap.md;
  const gapClass = size === 'sm' ? 'gap-0.5' : 'gap-1';

  const active = readonly ? value : (hovered || value);

  return (
    <div
      className={`inline-flex items-center ${gapClass}`}
      role={readonly ? undefined : 'group'}
      aria-label={readonly ? `Rating ${value} dari 5` : 'Pilih rating'}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        // Untuk readonly: hitung fill penuh / separuh / kosong
        const fill = readonly
          ? active >= star
            ? 'full'
            : active >= star - 0.5
            ? 'half'
            : 'empty'
          : active >= star
          ? 'full'
          : 'empty';

        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            onKeyDown={(e) => {
              if (!readonly && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onChange?.(star);
              }
            }}
            aria-label={readonly ? undefined : `Beri rating ${star} bintang`}
            className={`relative focus:outline-none ${
              readonly
                ? 'cursor-default'
                : 'cursor-pointer focus:ring-2 focus:ring-[#F2B705] rounded'
            }`}
          >
            {fill === 'half' ? (
              // Setengah bintang
              <span className="relative inline-block">
                <Star className={`${iconClass} text-slate-200 fill-slate-200`} />
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: '50%' }}
                >
                  <Star className={`${iconClass} text-[#F2B705] fill-[#F2B705]`} />
                </span>
              </span>
            ) : (
              <Star
                className={`${iconClass} transition-colors ${
                  fill === 'full'
                    ? 'text-[#F2B705] fill-[#F2B705]'
                    : 'text-slate-200 fill-slate-200 hover:text-[#F2B705]'
                }`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default StarRating;
