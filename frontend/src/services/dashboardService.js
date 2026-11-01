import { apiClient } from './apiClient.js';

export const dashboardService = {
  /** Ringkasan statistik dashboard (admin). */
  async getSummary() {
    return apiClient.get('/dashboard/summary');
  },
};

export default dashboardService;
