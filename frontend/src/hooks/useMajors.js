import { useState, useEffect, useCallback } from 'react';
import { majorService } from '../services/majorService.js';

// Cache module-level agar tidak fetch ulang di setiap komponen
let _cachedMajors = null;
let _fetchPromise = null;
const _listeners = new Set();

function notifyListeners() {
  _listeners.forEach((fn) => fn(_cachedMajors));
}

/**
 * Hook yang mengambil daftar jurusan dari API sekali lalu meng-cache-nya.
 * Sediakan fungsi refresh() yang dipanggil setelah admin mengubah jurusan.
 *
 * @returns {{ majors: Array, majorNames: string[], isLoading: boolean, refresh: function }}
 */
export function useMajors() {
  const [majors, setMajors] = useState(_cachedMajors ?? []);
  const [isLoading, setIsLoading] = useState(_cachedMajors === null);

  // Daftarkan listener agar state ikut update saat cache berubah
  useEffect(() => {
    const listener = (data) => {
      setMajors(data ?? []);
      setIsLoading(false);
    };
    _listeners.add(listener);
    return () => _listeners.delete(listener);
  }, []);

  // Fetch pertama kali jika cache belum ada
  useEffect(() => {
    if (_cachedMajors !== null) {
      setMajors(_cachedMajors);
      setIsLoading(false);
      return;
    }
    if (!_fetchPromise) {
      _fetchPromise = majorService.getMajors().then((res) => {
        _cachedMajors = res.success ? (res.data || []) : [];
        _fetchPromise = null;
        notifyListeners();
      }).catch(() => {
        _cachedMajors = [];
        _fetchPromise = null;
        notifyListeners();
      });
    }
  }, []);

  /** Paksa fetch ulang dan perbarui semua komponen yang memakai hook ini. */
  const refresh = useCallback(async () => {
    _cachedMajors = null;
    _fetchPromise = null;
    setIsLoading(true);
    try {
      const res = await majorService.getMajors();
      _cachedMajors = res.success ? (res.data || []) : [];
    } catch {
      _cachedMajors = [];
    }
    notifyListeners();
  }, []);

  return {
    majors,
    /** Array nama jurusan (string) untuk dropdown */
    majorNames: majors.map((m) => m.name),
    isLoading,
    refresh,
  };
}

export default useMajors;
