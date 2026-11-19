import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Layers } from 'lucide-react';
import { majorService } from '../../services/majorService.js';
import { useMajors } from '../../hooks/useMajors.js';
import { Button } from '../../components/common/Button.jsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.jsx';
import { MajorFormModal } from '../../components/forms/MajorFormModal.jsx';
import { SkeletonTableRows } from '../../components/common/LoadingSkeleton.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { useToast } from '../../hooks/useToast.jsx';

export function ManageMajorPage() {
  const toast = useToast();
  const { majors, isLoading, refresh } = useMajors();

  // Modal Tambah/Edit
  const [modalOpen, setModalOpen]       = useState(false);
  const [editingMajor, setEditingMajor] = useState(null);
  const [submitting, setSubmitting]     = useState(false);

  // Dialog Hapus
  const [deleteDialogOpen, setDeleteDialogOpen]   = useState(false);
  const [deletingMajor, setDeletingMajor]         = useState(null);
  const [isDeleting, setIsDeleting]               = useState(false);

  const handleOpenAdd = () => {
    setEditingMajor(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (m) => {
    setEditingMajor(m);
    setModalOpen(true);
  };

  const handleOpenDelete = (m) => {
    setDeletingMajor(m);
    setDeleteDialogOpen(true);
  };

  const handleSubmitForm = async (payload) => {
    setSubmitting(true);
    try {
      const res = editingMajor
        ? await majorService.updateMajor(editingMajor.id, payload)
        : await majorService.createMajor(payload);

      if (res.success) {
        toast.success(res.message);
        setModalOpen(false);
        setEditingMajor(null);
        await refresh();
      } else if (res.statusCode === 409 || /sudah/i.test(res.message || '')) {
        toast.error(res.message || 'Nama jurusan sudah terdaftar.');
      } else {
        toast.error(res.message || 'Gagal menyimpan jurusan.');
      }
    } catch {
      toast.error('Terjadi kesalahan saat menyimpan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingMajor) return;
    setIsDeleting(true);
    try {
      const res = await majorService.deleteMajor(deletingMajor.id);
      if (res.success) {
        toast.success(res.message);
        setDeleteDialogOpen(false);
        setDeletingMajor(null);
        await refresh();
      } else {
        toast.error(res.message || 'Gagal menghapus jurusan.');
      }
    } catch {
      toast.error('Terjadi kesalahan saat menghapus.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] font-heading">Kelola Jurusan</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tambah, ubah, atau hapus jurusan keahlian. Perubahan nama otomatis menyinkronkan data murid & karya.
          </p>
        </div>
        <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAdd}>
          Tambah Jurusan
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-[#F5F8FF] text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6">Nama Jurusan</th>
                <th className="py-3.5 px-6">Kode</th>
                <th className="py-3.5 px-6">Murid</th>
                <th className="py-3.5 px-6">Karya</th>
                <th className="py-3.5 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <SkeletonTableRows count={4} />
              ) : majors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12">
                    <EmptyState
                      icon={Layers}
                      title="Belum Ada Jurusan"
                      description="Tambahkan jurusan keahlian pertama untuk mulai mengelola data murid dan karya."
                      actionLabel="Tambah Jurusan"
                      onAction={handleOpenAdd}
                    />
                  </td>
                </tr>
              ) : (
                majors.map((m) => {
                  const inUse = m.student_count > 0 || m.portfolio_count > 0;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0B2E6B] flex items-center justify-center shrink-0">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate">{m.name}</p>
                            {m.description && (
                              <p className="text-[11px] text-slate-400 truncate max-w-[260px]">{m.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {m.code ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-[#0B2E6B] border border-blue-200">
                            {m.code}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs font-semibold text-slate-700">{m.student_count}</span>
                        <span className="text-xs text-slate-400 ml-1">murid</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs font-semibold text-slate-700">{m.portfolio_count}</span>
                        <span className="text-xs text-slate-400 ml-1">karya</span>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(m)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                            title="Edit Jurusan"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => !inUse && handleOpenDelete(m)}
                            disabled={inUse}
                            className={`p-1.5 rounded-lg transition-colors ${
                              inUse
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            title={
                              inUse
                                ? `Tidak bisa dihapus: dipakai ${m.student_count} murid & ${m.portfolio_count} karya`
                                : 'Hapus Jurusan'
                            }
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

      {/* Modal Tambah/Edit */}
      <MajorFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitForm}
        initialData={editingMajor}
        isSubmitting={submitting}
      />

      {/* Dialog Hapus */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Hapus Jurusan?"
        message={`Apakah Anda yakin ingin menghapus jurusan "${deletingMajor?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus Jurusan"
      />
    </div>
  );
}

export default ManageMajorPage;
