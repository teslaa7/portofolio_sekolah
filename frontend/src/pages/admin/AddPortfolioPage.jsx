import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { portfolioService } from '../../services/portfolioService.js';
import { categoryService } from '../../services/categoryService.js';
import { PortfolioForm } from '../../components/forms/PortfolioForm.jsx';
import { useToast } from '../../hooks/useToast.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSkeleton.jsx';

export function AddPortfolioPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryService.getCategories();
        setCategories(res.data || []);
      } catch (err) {
        toast.error('Gagal mengambil daftar kategori');
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, [toast]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const res = await portfolioService.createPortfolio(formData);
      if (res.success) {
        toast.success(res.message || 'Portofolio berhasil ditambahkan!');
        navigate('/admin/portofolio');
      } else {
        toast.error(res.message || 'Gagal menambahkan portofolio');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Mempersiapkan formulir karya baru..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back & Breadcrumb */}
      <div>
        <Link
          to="/admin/portofolio"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#0B2E6B] transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Daftar Portofolio</span>
        </Link>
        <h2 className="text-2xl font-bold text-[#0F172A] font-heading">
          Tambah Portofolio Karya Baru
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Formulir untuk mempublikasikan proyek hasil karya murid ke dalam etalase resmi sekolah.
        </p>
      </div>

      <PortfolioForm
        categories={categories}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        isEdit={false}
      />
    </div>
  );
}

export default AddPortfolioPage;
