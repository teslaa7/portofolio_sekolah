import React, { useState } from 'react';

/** Ambil inisial nama (maks 2 kata). */
function initialsOf(name) {
  const parts = (name || 'U').trim().split(/\s+/);
  return (
    parts
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || '?'
  );
}

/**
 * Avatar dengan fallback inisial berwarna jika src kosong / gagal dimuat.
 * Kompatibel dengan URL http(s) lama maupun data URL base64.
 *
 * @param {string} [src] - URL gambar atau data URL
 * @param {string} [name] - nama untuk inisial fallback
 * @param {number} [size=40] - ukuran dalam px
 * @param {string} [className] - kelas tambahan (border, ring, dll)
 */
export function Avatar({ src, name, size = 40, className = '' }) {
  const [failed, setFailed] = useState(false);
  const showImg = Boolean(src) && !failed;
  const dim = { width: size, height: size };

  if (showImg) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        style={dim}
        onError={() => setFailed(true)}
        className={`rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      style={dim}
      className={`rounded-full bg-[#0B2E6B] text-white font-bold flex items-center justify-center select-none shrink-0 ${className}`}
    >
      <span style={{ fontSize: Math.max(11, size * 0.36) }}>{initialsOf(name)}</span>
    </div>
  );
}

export default Avatar;
