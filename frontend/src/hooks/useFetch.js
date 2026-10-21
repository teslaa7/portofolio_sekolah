import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook untuk fetching data dari service
 * @param {Function} asyncFunction - Fungsi async dari service (misal: () => portfolioService.getPortfolios(...))
 * @param {Array} dependencies - Dependency array untuk auto re-fetch
 * @param {boolean} immediate - Apakah langsung fetch saat mount
 */
export function useFetch(asyncFunction, dependencies = [], immediate = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await asyncFunction(...args);
      if (response && response.success) {
        setData(response);
        return response;
      } else {
        const errorMsg = response?.message || 'Gagal memuat data';
        setError(errorMsg);
        return response;
      }
    } catch (err) {
      const errorMsg = err.message || 'Terjadi kesalahan pada server';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    data,
    loading,
    error,
    refetch: execute,
    setData,
  };
}

export default useFetch;
