// src/services/presences.service.ts
import api from '../types/api';

export interface Presence {
  id: number;
  idAgent: number;
  agentNom?: string;
  agentPrenom?: string;
  datePresence: string;
  heureArrivee?: string;
  heureDepart?: string;
  statut: string;
  observation?: string;
}

export interface PresencePayload {
  idAgent: number;
  datePresence: string;
  heureArrivee?: string;
  heureDepart?: string;
  statut: string;
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

export const presencesService = {
  // Paginée avec recherche par agent (utilisée dans le composant)
  async getAllPaginated(page: number = 0, size: number = 10, agentName: string = ''): Promise<PageResponse<Presence>> {
    let url: string;
    if (agentName) {
      url = `/presences/search?keyword=${encodeURIComponent(agentName)}&page=${page + 1}&per_page=${size}`;
    } else {
      url = `/presences?page=${page + 1}&per_page=${size}`;
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

  // Récupération sans pagination (si besoin)
  async getAll(): Promise<Presence[]> {
    const response = await api.get('/presences/all');
    return response.data;
  },

  async getById(id: number): Promise<Presence> {
    const response = await api.get(`/presences/${id}`);
    return response.data;
  },

  async create(data: PresencePayload): Promise<Presence> {
    const response = await api.post('/presences', data);
    return response.data;
  },

  async update(id: number, data: Partial<PresencePayload>): Promise<Presence> {
    const response = await api.put(`/presences/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/presences/${id}`);
  },
};