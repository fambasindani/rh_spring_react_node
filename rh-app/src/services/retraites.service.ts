// src/services/retraites.service.ts
import api from '../types/api';

export interface Retraite {
  id: number;
  idAgent: number;
  agentNom?: string;
  agentPrenom?: string;
  dateRetraite: string;
  reference: string;
  observation?: string;
}

export interface RetraitePayload {
  idAgent: number;
  dateRetraite: string;
  reference: string;
  observation?: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const retraitesService = {
  async getAll(page: number = 0, size: number = 10, keyword: string = ''): Promise<PageResponse<Retraite>> {
    let url = `/retraites?page=${page + 1}&per_page=${size}`;
    if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
    const response = await api.get(url);
    const d = response.data;
    return {
      content: d.data || [],
      pageNumber: d.current_page - 1,
      pageSize: d.per_page,
      totalElements: d.total,
      totalPages: d.last_page,
      last: d.current_page >= d.last_page,
    };
  },

  async create(data: RetraitePayload): Promise<Retraite> {
    const response = await api.post('/retraites', data);
    return response.data;
  },

  async update(id: number, data: Partial<RetraitePayload>): Promise<Retraite> {
    const response = await api.put(`/retraites/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/retraites/${id}`);
  },
};