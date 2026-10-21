import React from 'react';

/**
 * StatCard component for summary numbers
 */
export function StatCard({
  title,
  value,
  icon: Icon,
  badgeText,
  badgeColor = 'blue', // 'blue', 'amber', 'emerald', 'indigo'
  description,
  className = '',
}) {
  const badgeStyles = {
    blue: 'bg-blue-50 text-[#0B2E6B]',
    amber: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-[#16A34A]',
    indigo: 'bg-indigo-50 text-indigo-700',
  };

  const iconBgStyles = {
    blue: 'bg-blue-100 text-[#0B2E6B]',
    amber: 'bg-amber-100 text-amber-600',
    emerald: 'bg-emerald-100 text-[#16A34A]',
    indigo: 'bg-indigo-100 text-indigo-600',
  };

  return (
    <div
      className={`bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-extrabold text-[#0F172A] mt-2 font-heading tracking-tight">
            {value}
          </h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${iconBgStyles[badgeColor] || iconBgStyles.blue}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {(badgeText || description) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          {description && <span>{description}</span>}
          {badgeText && (
            <span
              className={`font-medium px-2 py-0.5 rounded-full ${
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
