// src/services/missions.service.ts
import api from '../types/api';

export interface Mission {
  id: number;
  idAgent: number;
  agentNom?: string;
  agentPrenom?: string;
  lieu: string;
  motif: string;
  dateDepart: string;
  dateRetour?: string;
  reference: string;
}

export interface MissionPayload {
  idAgent: number;
  lieu: string;
  motif: string;
  dateDepart: string;
  dateRetour?: string;
  reference: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const missionsService = {
  async getAll(page: number = 0, size: number = 10, keyword: string = ''): Promise<PageResponse<Mission>> {
    let url = `/missions?page=${page + 1}&per_page=${size}`;
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

  async create(data: MissionPayload): Promise<Mission> {
    const response = await api.post('/missions', data);
    return response.data;
  },

  async update(id: number, data: Partial<MissionPayload>): Promise<Mission> {
    const response = await api.put(`/missions/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/missions/${id}`);
  },
};