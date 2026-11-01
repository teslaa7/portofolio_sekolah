import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, RotateCcw, UserCheck, UserX, Users } from 'lucide-react';
import { studentService } from '../../services/studentService.js';
import { Button } from '../../components/common/Button.jsx';
import { SearchBar } from '../../components/common/SearchBar.jsx';
import { Select } from '../../components/common/Select.jsx';
import { Pagination } from '../../components/common/Pagination.jsx';
import { ConfirmDialog } from '../../components/common/ConfirmDialog.jsx';
import { StudentFormModal } from '../../components/forms/StudentFormModal.jsx';
import { SkeletonTableRows } from '../../components/common/LoadingSkeleton.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { useToast } from '../../hooks/useToast.jsx';

export function ManageStudentPage() {
  const toast = useToast();

  const [students, setStudents] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState('');
  const [page, setPage] = useState(1);

  // Modal Tambah/Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Dialog Hapus
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentService.getStudents({ search, is_active: isActive, page, limit: 10 });
      if (res.success) {
        setStudents(res.data || []);
        setMeta(res.meta || { page: 1, limit: 10, total: 0, totalPages: 1 });
      } else {
        toast.error(res.message || 'Gagal memuat data murid');
      }
    } catch (err) {
      toast.error('Gagal memuat data murid');
    } finally {
      setLoading(false);
    }
  }, [search, isActive, page, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    setEditing(null);
    setServerError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (s) => {
    setEditing(s);
    setServerError('');
    setModalOpen(true);
  };

  const handleOpenDelete = (s) => {
    setDeleting(s);
    setDeleteOpen(true);
  };

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    setServerError('');
    try {
      const res = editing
        ? await studentService.updateStudent(editing.id, payload)
        : await studentService.createStudent(payload);
      if (res.success) {
        toast.success(res.message);
        setModalOpen(false);
        setEditing(null);
        loadData();
      } else if (res.statusCode === 409 || /sudah digunakan/i.test(res.message || '')) {
        // Email duplikat -> tampilkan di modal, tetap buka
        setServerError(res.message || 'Email sudah digunakan oleh akun lain.');
      } else {
        toast.error(res.message || 'Gagal menyimpan murid');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan saat menyimpan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (s) => {
    try {
      const res = await studentService.updateStudent(s.id, { is_active: !s.is_active });
      if (res.success) {
        toast.success(res.message);
        loadData();
      } else {
        toast.error(res.message || 'Gagal mengubah status');
      }
    } catch {
      toast.error('Terjadi kesalahan');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      const res = await studentService.removeStudent(deleting.id);
      if (res.success) {
        toast.success(res.message);
        setDeleteOpen(false);
        setDeleting(null);
        loadData();
      } else {
        toast.error(res.message || 'Gagal menghapus murid');
      }
    } catch {
      toast.error('Terjadi kesalahan saat menghapus');
    } finally {
      setIsDeleting(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setIsActive('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] font-heading">Kelola Murid</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola akun siswa yang dapat mengunggah karya portofolio sendiri.
          </p>
        </div>
        <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAdd}>
          Tambah Murid
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <SearchBar
          value={search}
          onChange={(val) => { setSearch(val); setPage(1); }}
          placeholder="Cari nama atau email murid..."
          className="flex-1"
        />
        <Select
          value={isActive}
          onChange={(e) => { setIsActive(e.target.value); setPage(1); }}
          options={[
            { value: '', label: 'Semua Status' },
            { value: 'true', label: 'Aktif' },
            { value: 'false', label: 'Nonaktif' },
          ]}
          className="w-full sm:w-44"
        />
        {(search || isActive) && (
          <Button
            variant="ghost"
            size="sm"
            icon={RotateCcw}
            onClick={resetFilters}
            className="text-slate-500 hover:text-rose-600"
          >
            Reset
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-[#F5F8FF] text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-6">Murid</th>
                <th className="py-3.5 px-6">Kelas &amp; Jurusan</th>
                <th className="py-3.5 px-6">Karya</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <SkeletonTableRows count={5} />
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12">
                    <EmptyState
                      icon={Users}
                      title="Belum Ada Murid"
                      description="Tambahkan akun murid pertama untuk mulai mengelola karya portofolio siswa."
                      actionLabel="Tambah Murid"
                      onAction={handleOpenAdd}
                    />
                  </td>
                </tr>
              ) : (
                students.map((s) => {
                  const initials =
                    s.name
                      .split(' ')
                      .slice(0, 2)
                      .map((w) => w[0]?.toUpperCase() || '')
                      .join('') || '?';
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Murid */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {s.avatar ? (
                            <img
                              src={s.avatar}
                              alt={s.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#0B2E6B] text-white text-sm font-bold flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate">{s.name}</p>
                            <p className="text-xs text-slate-400 truncate">{s.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Kelas & Jurusan */}
                      <td className="py-4 px-6">
                        <p className="text-xs text-slate-700">{s.class_name || '-'}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{s.major}</p>
                      </td>

                      {/* Jumlah karya */}
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#0B2E6B] border border-blue-200">
                          {s.portfolios_count} Karya
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {s.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <UserCheck className="w-3.5 h-3.5" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            <UserX className="w-3.5 h-3.5" />
                            Nonaktif
                          </span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                            title="Edit Murid"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(s)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              s.is_active
                                ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={s.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          >
                            {s.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(s)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Hapus Murid"
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

      <Pagination
        currentPage={meta.page}
        totalPages={meta.totalPages}
        totalItems={meta.total}
        itemsPerPage={meta.limit}
        onPageChange={setPage}
      />

      {/* Modal Tambah/Edit */}
      <StudentFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editing}
        isSubmitting={submitting}
        serverError={serverError}
      />

      {/* Dialog Hapus */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Hapus Murid?"
        message={`Apakah Anda yakin menghapus akun "${deleting?.name}"? Karya milik murid ini tetap ditampilkan tanpa pemilik.`}
        confirmText="Ya, Hapus"
      />
    </div>
  );
}

export default ManageStudentPage;
