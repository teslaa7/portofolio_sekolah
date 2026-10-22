import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { portfolioService } from '../../services/portfolioService.js';
import { categoryService } from '../../services/categoryService.js';
import { PortfolioForm } from '../../components/forms/PortfolioForm.jsx';
import { useToast } from '../../hooks/useToast.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSkeleton.jsx';
import { ErrorState } from '../../components/common/ErrorState.jsx';

export function EditPortfolioPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, isStudent } = useAuth();

  const [portfolio, setPortfolio] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [catRes, portRes] = await Promise.all([
          categoryService.getCategories(),
          portfolioService.getPortfolioById(id),
        ]);

        if (catRes.success) setCategories(catRes.data || []);

        if (portRes.success && portRes.data) {
          const p = portRes.data;
          // Murid tidak boleh edit karya orang lain
          if (isStudent && p.owner_id !== user?.id) {
            toast.error('Anda hanya dapat mengedit karya milik sendiri.');
            navigate('/admin/portofolio', { replace: true });
            return;
          }
          setPortfolio(p);
        } else {
          setError(portRes.message || 'Portofolio tidak ditemukan');
        }
      } catch (err) {
        setError(err.message || 'Terjadi kesalahan sistem');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, isStudent, user, navigate, toast]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const res = await portfolioService.updatePortfolio(id, formData, user);
      if (res.success) {
        toast.success(res.message || 'Portofolio berhasil diperbarui!');
        navigate('/admin/portofolio');
      } else {
        toast.error(res.message || 'Gagal memperbarui portofolio');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Memuat data portofolio untuk diedit..." />;

  if (error || !portfolio) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <ErrorState
          title="Data Tidak Ditemukan"
          message={error || 'Karya portofolio dengan ID ini tidak dapat ditemukan.'}
          onRetry={() => navigate('/admin/portofolio')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          to="/admin/portofolio"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#0B2E6B] transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Daftar Portofolio</span>
        </Link>
        <h2 className="text-2xl font-bold text-[#0F172A] font-heading">
          Edit Data Portofolio: {portfolio.title}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Perbarui rincian informasi, tautan proyek, atau status publikasi karya.
        </p>
      </div>

      <PortfolioForm
        initialData={portfolio}
        categories={categories}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        isEdit={true}
        currentUser={user}
      />
    </div>
  );
}

export default EditPortfolioPage;
