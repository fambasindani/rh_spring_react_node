// src/services/statistics.service.ts
import api from '../types/api';
import type { DashboardStatistics } from '../types/dashboard';

export const statisticsService = {
  async getDashboard(): Promise<DashboardStatistics> {
    const response = await api.get('/statistics/dashboard');
    return response.data;
  },
};