// src/services/absences.service.ts
import api from '../types/api';

export interface Absence {
  id: number;
  idAgent: number;
  agentNom?: string;
  agentPrenom?: string;
  dateDebut: string;
  dateFin: string;
  motif?: string;
  justification?: string;
  statut: boolean; // true = actif, false = inactif
}

export interface AbsencePayload {
  idAgent: number;
  dateDebut: string;
  dateFin: string;
  motif?: string;
  justification?: string;
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

export const absencesService = {
  async getAll(page: number = 0, size: number = 10, agentName: string = ''): Promise<PageResponse<Absence>> {
    let url = `/absences?page=${page + 1}&per_page=${size}`;
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

  async getAllWithoutPagination(): Promise<Absence[]> {
    const response = await api.get('/absences/all');
    return response.data;
  },

  async getById(id: number): Promise<Absence> {
    const response = await api.get(`/absences/${id}`);
    return response.data;
  },

  async create(data: AbsencePayload): Promise<Absence> {
    const response = await api.post('/absences', data);
    return response.data;
  },

  async update(id: number, data: Partial<AbsencePayload>): Promise<Absence> {
    const response = await api.put(`/absences/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/absences/${id}`);
  },
};