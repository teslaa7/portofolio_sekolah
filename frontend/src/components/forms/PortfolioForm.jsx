import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save,
  X,
  Plus,
  Image as ImageIcon,
  ExternalLink,
  Github,
  Sparkles,
  Upload,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { Input } from '../common/Input.jsx';
import { Select } from '../common/Select.jsx';
import { Button } from '../common/Button.jsx';
import { MAJORS } from '../../constants/roles.js';
import { validatePortfolioForm } from '../../utils/validators.js';
import {
  validateImageFile,
  fileToOptimizedDataUrl,
  IMAGE_ACCEPT,
} from '../../utils/imageFile.js';

export function PortfolioForm({
  initialData = {},
  categories = [],
  onSubmit,
  isSubmitting = false,
  isEdit = false,
}) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: initialData.title || '',
    student_name: initialData.student_name || '',
    class_name: initialData.class_name || '',
    major: initialData.major || MAJORS[0],
    category_id: initialData.category_id || (categories[0]?.id || 1),
    short_description: initialData.short_description || '',
    description: initialData.description || '',
    year: initialData.year || new Date().getFullYear(),
    project_url: initialData.project_url || '',
    repo_url: initialData.repo_url || '',
    thumbnail_url: initialData.thumbnail_url || '',
    tech_stack: initialData.tech_stack || ['React', 'Tailwind CSS'],
    screenshots: initialData.screenshots || [],
    status: initialData.status || 'published',
    is_featured: Boolean(initialData.is_featured),
  });

  const [errors, setErrors] = useState({});
  const [techInput, setTechInput] = useState('');
  // Ref untuk input file tersembunyi
  const thumbnailInputRef = useRef(null);
  const screenshotInputRef = useRef(null);
  // State error upload gambar (terpisah dari form errors)
  const [imageErrors, setImageErrors] = useState({ thumbnail: null, screenshot: null });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Tech stack tag management
  const handleAddTech = (e) => {
    e?.preventDefault();
    const tag = techInput.trim();
    if (tag && !formData.tech_stack.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tech_stack: [...prev.tech_stack, tag],
      }));
      setTechInput('');
    }
  };

  const handleRemoveTech = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tech_stack: prev.tech_stack.filter((_, i) => i !== indexToRemove),
    }));
  };

  // Screenshot file upload management
  const handleScreenshotFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Reset input agar file yang sama bisa dipilih ulang
    e.target.value = '';

    const newUrls = [];
    let firstError = null;

    for (const file of files) {
      const { valid, error } = validateImageFile(file);
      if (!valid) {
        firstError = error;
        continue;
      }
      try {
        const dataUrl = await fileToOptimizedDataUrl(file);
        newUrls.push(dataUrl);
      } catch {
        firstError = 'Gagal membaca file gambar. Coba file lain.';
      }
    }

    if (firstError) {
      setImageErrors((prev) => ({ ...prev, screenshot: firstError }));
    } else {
      setImageErrors((prev) => ({ ...prev, screenshot: null }));
    }

    if (newUrls.length > 0) {
      setFormData((prev) => ({
        ...prev,
        screenshots: [...prev.screenshots, ...newUrls],
      }));
    }
  };

  const handleRemoveScreenshot = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== indexToRemove),
    }));
  };

  // Thumbnail file upload handler
  const handleThumbnailFileChange = async (e) => {
    const file = e.target.files?.[0];
    // Reset input agar file yang sama bisa dipilih ulang
    e.target.value = '';
    if (!file) return;

    const { valid, error } = validateImageFile(file);
    if (!valid) {
      setImageErrors((prev) => ({ ...prev, thumbnail: error }));
      return;
    }

    try {
      const dataUrl = await fileToOptimizedDataUrl(file);
      setFormData((prev) => ({ ...prev, thumbnail_url: dataUrl }));
      setImageErrors((prev) => ({ ...prev, thumbnail: null }));
      if (errors.thumbnail_url) {
        setErrors((prev) => ({ ...prev, thumbnail_url: null }));
      }
    } catch {
      setImageErrors((prev) => ({ ...prev, thumbnail: 'Gagal membaca file gambar. Coba file lain.' }));
    }
  };

  const handleRemoveThumbnail = () => {
    setFormData((prev) => ({ ...prev, thumbnail_url: '' }));
    setImageErrors((prev) => ({ ...prev, thumbnail: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validatePortfolioForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      // Scroll to top of form
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    onSubmit(formData);
  };

  const majorOptions = MAJORS.map((m) => ({ value: m, label: m }));
  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Kartu 1: Informasi Dasar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-[#0F172A] font-heading">Informasi Utama Karya</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Lengkapi data judul, deskripsi, dan identitas siswa pembuat karya.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Input
              label="Judul Portofolio / Proyek"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Contoh: Website Koperasi Siswa Kopmart"
              required
              error={errors.title}
            />
          </div>

          <Input
            label="Nama Pembuat / Tim Siswa"
            name="student_name"
            value={formData.student_name}
            onChange={handleChange}
            placeholder="Contoh: Ahmad Fauzi & Tim"
            required
            error={errors.student_name}
          />

          <Input
            label="Kelas"
            name="class_name"
            value={formData.class_name}
            onChange={handleChange}
            placeholder="Contoh: XII RPL 1"
            required
            error={errors.class_name}
          />

          <Select
            label="Jurusan Keahlian"
            name="major"
            value={formData.major}
            onChange={handleChange}
            options={majorOptions}
            required
            error={errors.major}
          />

          <Select
            label="Kategori Karya"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            options={categoryOptions}
            required
            error={errors.category_id}
          />

          <Input
            label="Tahun Pembuatan"
            name="year"
            type="number"
            min="2020"
            max="2030"
            value={formData.year}
            onChange={handleChange}
            required
            error={errors.year}
          />

          <Select
            label="Status Publikasi"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={[
              { value: 'published', label: 'Published (Tampil di website publik)' },
              { value: 'draft', label: 'Draft (Hanya disimpan di admin)' },
            ]}
          />
        </div>

        {/* Short Description */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm font-medium text-slate-700">
              Deskripsi Singkat (Ringkasan Kartu) <span className="text-red-500">*</span>
            </label>
            <span
              className={`text-xs ${
                formData.short_description.length > 150
                  ? 'text-red-600 font-bold'
                  : 'text-slate-400'
              }`}
            >
              {formData.short_description.length} / 150 karakter
            </span>
          </div>
          <textarea
            name="short_description"
            rows={2}
            value={formData.short_description}
            onChange={handleChange}
            maxLength={180}
            placeholder="Ringkasan 1-2 kalimat untuk ditampilkan di kartu portofolio..."
            className={`block w-full rounded-xl border bg-white p-3 text-sm text-[#0F172A] placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 ${
              errors.short_description
                ? 'border-red-400 focus:ring-red-200'
                : 'border-slate-300 focus:border-[#0B2E6B] focus:ring-blue-100 hover:border-slate-400'
            }`}
          />
          {errors.short_description && (
            <p className="mt-1.5 text-xs text-[#DC2626] font-medium">{errors.short_description}</p>
          )}
        </div>

        {/* Full Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Deskripsi Lengkap Proyek <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            rows={5}
            value={formData.description}
            onChange={handleChange}
            placeholder="Jelaskan fitur utama, latar belakang pembuatan, solusi yang diberikan, dan tantangan yang diselesaikan..."
            className={`block w-full rounded-xl border bg-white p-3 text-sm text-[#0F172A] placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 ${
              errors.description
                ? 'border-red-400 focus:ring-red-200'
                : 'border-slate-300 focus:border-[#0B2E6B] focus:ring-blue-100 hover:border-slate-400'
            }`}
          />
          {errors.description && (
            <p className="mt-1.5 text-xs text-[#DC2626] font-medium">{errors.description}</p>
          )}
        </div>

        {/* Is Featured Checkbox */}
        <div className="pt-2">
          <label className="inline-flex items-center gap-3 cursor-pointer select-none p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 hover:bg-amber-50 transition-colors">
            <input
              type="checkbox"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
              className="w-4 h-4 rounded text-[#F2B705] focus:ring-[#F2B705] border-amber-300"
            />
            <div>
              <span className="text-sm font-bold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Tandai sebagai Karya Unggulan (Featured)
              </span>
              <span className="text-xs text-amber-700 block">
                Karya ini akan ditampilkan di baris teratas Beranda publik.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Kartu 2: Tech Stack & Tautan Proyek */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-[#0F172A] font-heading">Teknologi & Tautan Proyek</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tambahkan bahasa pemrograman/framework dan tautan demo website.
          </p>
        </div>

        {/* Tech Stack Tags Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Tech Stack / Alat yang Digunakan
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTech();
                }
              }}
              placeholder="Ketik teknologi (contoh: React, Fastify, Figma) lalu tekan Enter..."
              className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-[#0F172A] focus:border-[#0B2E6B] focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <Button type="button" variant="outline" size="sm" onClick={handleAddTech} icon={Plus}>
              Tambah
            </Button>
          </div>

          {/* Tag Badges */}
          <div className="flex flex-wrap gap-2 mt-3 min-h-8">
            {formData.tech_stack.map((tech, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-[#0B2E6B] border border-blue-200"
              >
                <span>{tech}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTech(index)}
                  className="hover:text-red-600 transition-colors"
                  aria-label={`Hapus tag ${tech}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {formData.tech_stack.length === 0 && (
              <span className="text-xs text-slate-400 italic">Belum ada teknologi ditambahkan</span>
            )}
          </div>
        </div>

        {/* Project URLs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="URL Website / Demo Proyek"
            name="project_url"
            value={formData.project_url}
            onChange={handleChange}
            placeholder="https://contoh-karya-siswa.vercel.app"
            leftIcon={ExternalLink}
            error={errors.project_url}
            helperText="Link langsung ke website yang sudah dideploy."
          />

          <Input
            label="URL Repository GitHub (Opsional)"
            name="repo_url"
            value={formData.repo_url}
            onChange={handleChange}
            placeholder="https://github.com/username/repo-project"
            leftIcon={Github}
            error={errors.repo_url}
            helperText="Kode sumber di GitHub atau GitLab."
          />
        </div>
      </div>

      {/* Kartu 3: Media & Gambar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-[#0F172A] font-heading">Gambar & Tangkapan Layar</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload gambar dari komputer. Format JPG, PNG, atau WebP — maks {5} MB per file.
          </p>
        </div>

        {/* ── Thumbnail Upload ── */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Gambar Thumbnail Utama
          </label>

          {/* Input file tersembunyi */}
          <input
            ref={thumbnailInputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            className="hidden"
            onChange={handleThumbnailFileChange}
            aria-label="Upload gambar thumbnail"
          />

          {formData.thumbnail_url ? (
            /* ── Preview thumbnail ── */
            <div className="flex items-start gap-4">
              <div className="w-48 h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs shrink-0">
                <img
                  src={formData.thumbnail_url}
                  alt="Preview Thumbnail"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://picsum.photos/600/400?grayscale';
                  }}
                />
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={RefreshCw}
                  onClick={() => thumbnailInputRef.current?.click()}
                >
                  Ganti Gambar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  onClick={handleRemoveThumbnail}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  Hapus
                </Button>
              </div>
            </div>
          ) : (
            /* ── Dropzone / area klik ── */
            <button
              type="button"
              onClick={() => thumbnailInputRef.current?.click()}
              className={`w-full flex flex-col items-center justify-center gap-2 px-4 py-8 rounded-xl border-2 border-dashed transition-colors ${
                imageErrors.thumbnail
                  ? 'border-red-300 bg-red-50 hover:bg-red-100'
                  : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-[#0B2E6B]'
              }`}
              aria-label="Klik untuk memilih gambar thumbnail"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                <ImageIcon className="w-5 h-5 text-slate-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-700">
                  Klik untuk pilih gambar
                </p>
                <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, WebP — maks 5 MB</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#0B2E6B] font-semibold">
                <Upload className="w-3.5 h-3.5" />
                <span>Pilih File</span>
              </div>
            </button>
          )}

          {/* Error upload thumbnail */}
          {imageErrors.thumbnail && (
            <p className="mt-1.5 text-xs text-red-600 font-medium">{imageErrors.thumbnail}</p>
          )}
          {errors.thumbnail_url && (
            <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.thumbnail_url}</p>
          )}
          <p className="mt-1.5 text-xs text-slate-400">
            Kosongkan jika ingin sistem membuat placeholder otomatis dari slug judul.
          </p>
        </div>

        {/* ── Screenshot Upload ── */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Screenshot Tambahan (Galeri)
          </label>

          {/* Input file tersembunyi — multiple */}
          <input
            ref={screenshotInputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            multiple
            className="hidden"
            onChange={handleScreenshotFileChange}
            aria-label="Upload screenshot tambahan"
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={() => {
              setImageErrors((prev) => ({ ...prev, screenshot: null }));
              screenshotInputRef.current?.click();
            }}
          >
            Tambah Gambar
          </Button>

          {/* Error upload screenshot */}
          {imageErrors.screenshot && (
            <p className="mt-1.5 text-xs text-red-600 font-medium">{imageErrors.screenshot}</p>
          )}

          {/* Grid preview screenshot */}
          {formData.screenshots.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
              {formData.screenshots.map((src, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100"
                >
                  <img
                    src={src}
                    alt={`Screenshot ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://picsum.photos/800/500?grayscale';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveScreenshot(idx)}
                    className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-md opacity-90 hover:opacity-100 transition-opacity shadow-xs"
                    title="Hapus gambar ini"
                    aria-label={`Hapus screenshot ${idx + 1}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {formData.screenshots.length === 0 && (
            <p className="mt-2 text-xs text-slate-400 italic">Belum ada screenshot ditambahkan.</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => navigate('/admin/portofolio')}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          icon={Save}
          isLoading={isSubmitting}
        >
          {isEdit ? 'Simpan Perubahan' : 'Terbitkan Portofolio'}
        </Button>
      </div>
    </form>
  );
}

export default PortfolioForm;
