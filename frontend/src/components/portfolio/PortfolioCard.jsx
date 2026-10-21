import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Star, User, Calendar, Tag } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge.jsx';

/**
 * PortfolioCard component
 */
export function PortfolioCard({ portfolio, categoryName = '' }) {
  const {
    title,
    slug,
    short_description,
    student_name,
    class_name,
    major,
    tech_stack = [],
    thumbnail_url,
    year,
    is_featured,
  } = portfolio;

  return (
    <article className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Thumbnail Area */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        <img
          src={thumbnail_url || `https://picsum.photos/seed/${slug}/600/400`}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = `https://picsum.photos/seed/${slug}/600/400`;
          }}
        />

        {/* Featured Tag Overlay */}
        {is_featured && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F2B705] text-[#0B2E6B] shadow-md">
              <Star className="w-3.5 h-3.5 fill-[#0B2E6B]" />
              Karya Unggulan
            </span>
          </div>
        )}

        {/* Category Badge Overlay */}
        {categoryName && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/90 backdrop-blur-md text-[#0B2E6B] shadow-sm">
              {categoryName}
            </span>
          </div>
        )}

        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900/60 backdrop-blur-md text-white">
            {year}
          </span>
        </div>
      </div>

      {/* Body Area */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Major */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span className="truncate">{major}</span>
          </div>

          {/* Title */}
          <h3 className="font-heading font-bold text-lg text-[#0F172A] group-hover:text-[#0B2E6B] transition-colors line-clamp-2 leading-snug">
            <Link to={`/portofolio/${slug}`} className="focus:outline-none">
              {title}
            </Link>
          </h3>

          {/* Short Description */}
          <p className="text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">
            {short_description}
          </p>
        </div>

        {/* Tech Stack Badges */}
        {tech_stack && tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tech_stack.slice(0, 3).map((tech, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700"
              >
                {tech}
              </span>
            ))}
            {tech_stack.length > 3 && (
              <span className="px-1.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-500">
                +{tech_stack.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer Meta: Student & Class */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 truncate pr-2">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-700 truncate">{student_name}</span>
            <span className="text-slate-300">•</span>
            <span className="truncate text-slate-500">{class_name}</span>
          </div>

          <Link
            to={`/portofolio/${slug}`}
            className="text-[#0B2E6B] font-semibold hover:text-[#1E40AF] inline-flex items-center gap-1 shrink-0"
          >
            <span>Detail</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default PortfolioCard;
