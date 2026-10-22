import React from 'react';
import { Filter, RotateCcw, ArrowUpDown } from 'lucide-react';
import { SearchBar } from '../common/SearchBar.jsx';
import { Select } from '../common/Select.jsx';
import { Button } from '../common/Button.jsx';
import { MAJORS } from '../../constants/roles.js';

export function PortfolioFilter({
  filters,
  categories = [],
  onFilterChange,
  onReset,
}) {
  const majorOptions = [
    { value: '', label: 'Semua Jurusan' },
    ...MAJORS.map((m) => ({ value: m, label: m })),
  ];

  const categoryOptions = [
    { value: '', label: 'Semua Kategori' },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const yearOptions = [
    { value: '', label: 'Semua Tahun' },
    { value: '2025', label: '2025' },
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
  ];

  const sortOptions = [
    { value: 'latest', label: 'Terbaru' },
    { value: 'oldest', label: 'Terlama' },
    { value: 'a-z', label: 'Judul (A - Z)' },
    { value: 'z-a', label: 'Judul (Z - A)' },
    { value: 'rating', label: 'Rating Tertinggi' },
  ];

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.major ||
      filters.category_id ||
      filters.year ||
      (filters.sortBy && filters.sortBy !== 'latest')
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4 mb-8">
      {/* Top row: Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        <SearchBar
          value={filters.search || ''}
          onChange={(val) => onFilterChange('search', val)}
          placeholder="Cari karya berdasarkan judul, teknologi, atau pembuat..."
          className="flex-1"
        />

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="md"
            icon={RotateCcw}
            onClick={onReset}
            className="text-slate-500 hover:text-rose-600 self-center shrink-0"
          >
            Reset Filter
          </Button>
        )}
      </div>

      {/* Bottom row: Filters & Sorter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
        <Select
          value={filters.major || ''}
          onChange={(e) => onFilterChange('major', e.target.value)}
          options={majorOptions}
          placeholder=""
        />

        <Select
          value={filters.category_id || ''}
          onChange={(e) => onFilterChange('category_id', e.target.value)}
          options={categoryOptions}
          placeholder=""
        />

        <Select
          value={filters.year || ''}
          onChange={(e) => onFilterChange('year', e.target.value)}
          options={yearOptions}
          placeholder=""
        />

        <Select
          value={filters.sortBy || 'latest'}
          onChange={(e) => onFilterChange('sortBy', e.target.value)}
          options={sortOptions}
          placeholder=""
        />
      </div>
    </div>
  );
}

export default PortfolioFilter;
