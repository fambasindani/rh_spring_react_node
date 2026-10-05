// src/services/contrats.service.ts
import api from '../types/api';

export interface Contrat {
  id: number;
  idAgent: number;
  agentNom?: string;
  agentPrenom?: string;
  typeContrat: string;    // CDI, CDD, STAGE, CONSULTANCE
  reference: string;
  dateDebut: string;
  dateFin?: string;
  statut: string;         // ACTIF, EXPIRE, RESILIE
}

export interface ContratPayload {
  idAgent: number;
  typeContrat: string;
  reference: string;
  dateDebut: string;
  dateFin?: string;
  statut: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const contratsService = {
  async getAll(page: number = 0, size: number = 10, keyword: string = ''): Promise<PageResponse<Contrat>> {
    let url = `/contrats?page=${page + 1}&per_page=${size}`;
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

  async create(data: ContratPayload): Promise<Contrat> {
    const response = await api.post('/contrats', data);
    return response.data;
  },

  async update(id: number, data: Partial<ContratPayload>): Promise<Contrat> {
    const response = await api.put(`/contrats/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/contrats/${id}`);
  },
};