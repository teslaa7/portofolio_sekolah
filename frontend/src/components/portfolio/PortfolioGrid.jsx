import React from 'react';
import { PortfolioCard } from './PortfolioCard.jsx';
import { SkeletonCard } from '../common/LoadingSkeleton.jsx';
import { EmptyState } from '../common/EmptyState.jsx';

/**
 * PortfolioGrid component
 */
export function PortfolioGrid({
  portfolios = [],
  categories = [],
  isLoading = false,
  emptyTitle,
  emptyDescription,
  onResetFilter,
}) {
  const categoryMap = categories.reduce((acc, cat) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!portfolios || portfolios.length === 0) {
    return (
      <EmptyState
        title={emptyTitle || 'Karya Belum Tersedia'}
        description={
          emptyDescription ||
          'Tidak ditemukan portofolio yang cocok dengan kriteria pencarian atau filter yang dipilih.'
        }
        actionLabel={onResetFilter ? 'Reset Filter' : undefined}
        onAction={onResetFilter}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {portfolios.map((item) => (
        <PortfolioCard
          key={item.id}
          portfolio={item}
          categoryName={categoryMap[item.category_id]}
        />
      ))}
    </div>
  );
}

export default PortfolioGrid;
