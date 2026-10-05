// src/services/sanctions.service.ts
import api from '../types/api';

export interface Sanction {
  id: number;
  idAgent: number;
  agentNom?: string;
  agentPrenom?: string;
  typeSanction: string;
  motif: string;
  dateSanction: string;
  reference?: string;
}

export interface SanctionPayload {
  idAgent: number;
  typeSanction: string;
  motif: string;
  dateSanction: string;
  reference?: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const sanctionsService = {
  async getAll(page: number = 0, size: number = 10, agentName: string = ''): Promise<PageResponse<Sanction>> {
    let url = `/sanctions?page=${page + 1}&per_page=${size}`;
    if (agentName) {
      url += `&agentName=${encodeURIComponent(agentName)}`;
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

  async getAllWithoutPagination(): Promise<Sanction[]> {
    const response = await api.get('/sanctions/all');
    return response.data;
  },

  async getById(id: number): Promise<Sanction> {
    const response = await api.get(`/sanctions/${id}`);
    return response.data;
  },

  async create(data: SanctionPayload): Promise<Sanction> {
    const response = await api.post('/sanctions', data);
    return response.data;
  },

  async update(id: number, data: Partial<SanctionPayload>): Promise<Sanction> {
    const response = await api.put(`/sanctions/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/sanctions/${id}`);
  },
};