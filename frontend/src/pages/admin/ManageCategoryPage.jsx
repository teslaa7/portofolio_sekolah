import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Tags, Layers } from 'lucide-react';
import { categoryService } from '../../services/categoryService.js';
import { portfolioService } from '../../services/portfolioService.js';
import { Button } from '../../components/common/Button.jsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.jsx';
import { CategoryFormModal } from '../../components/forms/CategoryFormModal.jsx';
import { SkeletonTableRows } from '../../components/common/LoadingSkeleton.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { useToast } from '../../hooks/useToast.jsx';

export function ManageCategoryPage() {
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [portfolioCounts, setPortfolioCounts] = useState({});
  const [loading, setLoading] = useState(true);

  // Form Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, portRes] = await Promise.all([
        categoryService.getCategories(),
        portfolioService.getPortfolios({ limit: 1000 }),
      ]);

      if (catRes.success) {
        setCategories(catRes.data || []);
      }

      // Count portfolios per category
      const counts = {};
      if (portRes.success && portRes.data) {
        portRes.data.forEach((p) => {
          counts[p.category_id] = (counts[p.category_id] || 0) + 1;
        });
      }
      setPortfolioCounts(counts);
    } catch (err) {
      toast.error('Gagal memuat kategori: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setModalOpen(true);
  };

  const handleOpenDelete = (cat) => {
    setDeletingCategory(cat);
    setDeleteDialogOpen(true);
  };

  const handleSubmitForm = async (payload) => {
    setSubmitting(true);
    try {
      if (editingCategory) {
        const res = await categoryService.updateCategory(editingCategory.id, payload);
        if (res.success) {
          toast.success(res.message);
          setModalOpen(false);
          loadData();
        } else {
          toast.error(res.message);
        }
      } else {
        const res = await categoryService.createCategory(payload);
        if (res.success) {
          toast.success(res.message);
          setModalOpen(false);
          loadData();
        } else {
          toast.error(res.message);
        }
      }
    } catch (err) {
      toast.error('Terjadi kesalahan: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    try {
      const res = await categoryService.deleteCategory(deletingCategory.id);
      if (res.success) {
        toast.success(res.message);
        setDeleteDialogOpen(false);
        setDeletingCategory(null);
        loadData();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error('Gagal menghapus kategori: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] font-heading">
            Kelola Kategori Portofolio
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur pengelompokan jenis proyek (Web App, Company Profile, E-Commerce, dsb).
          </p>
        </div>

        <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAdd}>
          Tambah Kategori
        </Button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-[#F5F8FF] text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6">ID</th>
                <th className="py-3.5 px-6">Nama Kategori</th>
                <th className="py-3.5 px-6">Slug URL</th>
                <th className="py-3.5 px-6">Jumlah Karya Terkait</th>
                <th className="py-3.5 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <SkeletonTableRows count={5} />
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12">
                    <EmptyState
                      title="Belum Ada Kategori"
                      description="Tambahkan kategori pertama untuk mengelompokkan karya portofolio siswa."
                      actionLabel="Tambah Kategori"
                      onAction={handleOpenAdd}
                    />
                  </td>
                </tr>
              ) : (
                categories.map((cat) => {
                  const count = portfolioCounts[cat.id] || 0;
                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                        #{cat.id}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B2E6B] flex items-center justify-center shrink-0">
                            <Tags className="w-4 h-4" />
                          </div>
                          <span>{cat.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs font-mono text-slate-500">
                        {cat.slug}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#0B2E6B] border border-blue-200">
                          <Layers className="w-3 h-3" />
                          <span>{count} Karya</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(cat)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                            title="Edit Kategori"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(cat)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Hapus Kategori"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Form Modal */}
      <CategoryFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitForm}
        initialData={editingCategory}
        isSubmitting={submitting}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Hapus Kategori?"
        message={`Apakah Anda yakin ingin menghapus kategori "${deletingCategory?.name}"? Pastikan tidak ada karya aktif yang bergantung pada kategori ini.`}
        confirmText="Ya, Hapus Kategori"
      />
    </div>
  );
}

export default ManageCategoryPage;
