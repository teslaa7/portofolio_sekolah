import { apiClient } from './apiClient.js';

export const majorService = {
  async getMajors() {
    return apiClient.get('/majors');
  },
  async createMajor(payload) {
    return apiClient.post('/majors', payload);
  },
  async updateMajor(id, payload) {
    return apiClient.put(`/majors/${id}`, payload);
  },
  async deleteMajor(id) {
    return apiClient.del(`/majors/${id}`);
  },
};

export default majorService;
