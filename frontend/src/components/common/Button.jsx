import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable Button component
 */
export function Button({
  children,
  type = 'button',
  variant = 'primary', // 'primary', 'secondary', 'outline', 'danger', 'ghost', 'accent'
  size = 'md', // 'sm', 'md', 'lg'
  isLoading = false,
  disabled = false,
  onClick,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary:
      'bg-[#0B2E6B] text-white hover:bg-[#1E40AF] active:bg-[#08204d] focus:ring-[#0B2E6B] shadow-sm hover:shadow',
    secondary:
      'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 focus:ring-slate-400',
    outline:
      'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus:ring-[#0B2E6B] shadow-xs',
    danger:
      'bg-[#DC2626] text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500 shadow-sm',
    ghost:
      'text-slate-600 hover:text-[#0B2E6B] hover:bg-blue-50 focus:ring-[#0B2E6B]',
    accent:
      'bg-[#F2B705] text-[#0B2E6B] font-semibold hover:bg-amber-400 active:bg-amber-500 focus:ring-[#F2B705] shadow-sm hover:shadow',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
        variantStyles[variant] || variantStyles.primary
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />
      )}
      <span>{children}</span>
      {!isLoading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
}

export default Button;
