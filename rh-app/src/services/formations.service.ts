// src/services/formations.service.ts
import api from '../types/api';

export interface Formation {
  id: number;
  intitule: string;
  organisme: string;
  lieu: string;
  dateDebut: string;
  dateFin: string;
  description: string;
  statut: boolean;
}

export interface FormationPayload {
  intitule: string;
  organisme?: string;
  lieu?: string;
  dateDebut?: string;
  dateFin?: string;
  description?: string;
  statut?: boolean;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const formationsService = {
  async getAll(page: number = 0, size: number = 10, keyword: string = ''): Promise<PageResponse<Formation>> {
    let url = `/formations?page=${page + 1}&per_page=${size}`;
    if (keyword) {
      url += `&keyword=${encodeURIComponent(keyword)}`;
    }
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

  async getById(id: number): Promise<Formation> {
    const response = await api.get(`/formations/${id}`);
    return response.data;
  },

  async create(data: FormationPayload): Promise<Formation> {
    const response = await api.post('/formations', data);
    return response.data;
  },

  async update(id: number, data: Partial<FormationPayload>): Promise<Formation> {
    const response = await api.put(`/formations/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/formations/${id}`);
  },
};