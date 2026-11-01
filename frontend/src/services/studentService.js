import { apiClient } from './apiClient.js';

const STUDENT_QUERY_KEYS = ['search', 'is_active', 'page', 'limit'];

function buildQuery(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (STUDENT_QUERY_KEYS.includes(key) && value !== undefined && value !== null && value !== '') {
      q.append(key, value);
    }
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const studentService = {
  /** Daftar murid (admin). */
  async getStudents(params = {}) {
    return apiClient.get(`/students${buildQuery(params)}`);
  },

  /** Detail murid. */
  async getStudentById(id) {
    return apiClient.get(`/students/${id}`);
  },

  /** Tambah murid baru. */
  async createStudent(payload) {
    return apiClient.post('/students', payload);
  },

  /** Update murid (parsial; password opsional). */
  async updateStudent(id, payload) {
    return apiClient.put(`/students/${id}`, payload);
  },

  /** Hapus murid (karyanya tetap, owner_id jadi NULL). */
  async removeStudent(id) {
    return apiClient.del(`/students/${id}`);
  },
};

export default studentService;
