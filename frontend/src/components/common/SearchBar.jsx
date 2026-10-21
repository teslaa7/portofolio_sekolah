import React from 'react';
import { Search, X } from 'lucide-react';

/**
 * SearchBar component
 */
export function SearchBar({
  value,
  onChange,
  placeholder = 'Cari judul, teknologi, nama murid...',
  className = '',
  onSubmit,
}) {
  const handleClear = () => {
    onChange('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(value);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative flex items-center ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
        <Search className="h-4 w-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-9 text-sm text-[#0F172A] placeholder-slate-400 transition-colors focus:border-[#0B2E6B] focus:outline-none focus:ring-2 focus:ring-blue-100 hover:border-slate-400 shadow-xs"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Bersihkan pencarian"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}

export default SearchBar;
