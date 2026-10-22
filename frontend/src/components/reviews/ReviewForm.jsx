import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../common/Button.jsx';
import { StarRating } from './StarRating.jsx';

const MAX_COMMENT = 500;

/**
 * Form kirim ulasan.
 * @param {function} onSubmit   - (payload) => Promise — dipanggil saat valid
 * @param {object|null} currentUser - user yang sedang login (null = tamu)
 */
export function ReviewForm({ onSubmit, currentUser = null }) {
  const isLoggedIn = Boolean(currentUser);

  const [name, setName] = useState(isLoggedIn ? currentUser.name : '');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!isLoggedIn && !name.trim()) e.name = 'Nama wajib diisi.';
    if (!rating) e.rating = 'Pilih bintang rating terlebih dahulu.';
    if (!comment.trim() || comment.trim().length < 5)
      e.comment = 'Komentar minimal 5 karakter.';
    if (comment.trim().length > MAX_COMMENT)
      e.comment = `Komentar maksimal ${MAX_COMMENT} karakter.`;
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        name: isLoggedIn ? currentUser.name : name.trim(),
        rating,
        comment: comment.trim(),
        user_id: currentUser?.id ?? null,
      });
      // Reset form setelah sukses
      setComment('');
      setRating(0);
      if (!isLoggedIn) setName('');
      setErrors({});
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
      <h3 className="text-lg font-bold text-[#0F172A] font-heading mb-4">Tulis Ulasan</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nama — sembunyikan jika sudah login */}
        {!isLoggedIn && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nama Anda <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((p) => ({ ...p, name: null }));
              }}
              placeholder="Nama pengunjung atau tamu"
              className={`block w-full rounded-xl border bg-white p-3 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-slate-300 focus:border-[#0B2E6B] focus:ring-blue-100'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.name}</p>
            )}
          </div>
        )}

        {/* Rating bintang */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Rating <span className="text-red-500">*</span>
          </label>
          <StarRating
            value={rating}
            onChange={(val) => {
              setRating(val);
              if (errors.rating) setErrors((p) => ({ ...p, rating: null }));
            }}
            size="lg"
          />
          {errors.rating && (
            <p className="mt-1 text-xs text-red-600 font-medium">{errors.rating}</p>
          )}
        </div>

        {/* Komentar */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-slate-700">
              Komentar <span className="text-red-500">*</span>
            </label>
            <span
              className={`text-xs ${
                comment.length > MAX_COMMENT ? 'text-red-600 font-bold' : 'text-slate-400'
              }`}
            >
              {comment.length} / {MAX_COMMENT}
            </span>
          </div>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              if (errors.comment) setErrors((p) => ({ ...p, comment: null }));
            }}
            placeholder="Bagikan pendapat Anda tentang karya ini..."
            className={`block w-full rounded-xl border bg-white p-3 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 ${
              errors.comment
                ? 'border-red-400 focus:ring-red-200'
                : 'border-slate-300 focus:border-[#0B2E6B] focus:ring-blue-100'
            }`}
          />
          {errors.comment && (
            <p className="mt-1 text-xs text-red-600 font-medium">{errors.comment}</p>
          )}
        </div>

        {isLoggedIn && (
          <p className="text-xs text-slate-400">
            Mengirim sebagai <span className="font-semibold text-slate-600">{currentUser.name}</span>
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          size="md"
          icon={Send}
          isLoading={submitting}
        >
          Kirim Ulasan
        </Button>
      </form>
    </div>
  );
}

export default ReviewForm;
