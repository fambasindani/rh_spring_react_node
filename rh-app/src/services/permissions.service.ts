// src/services/permissions.service.ts
import api from '../types/api';

export interface Permission {
  id: number;
  idAgent: number;
  agentNom?: string;
  agentPrenom?: string;
  datePermission: string;
  heureSortie?: string;
  heureRetour?: string;
  motif?: string;
  statut: string; // EN_ATTENTE, ACCEPTE, REFUSE, ANNULE
}

export interface PermissionPayload {
  idAgent: number;
  datePermission: string;
  heureSortie?: string;
  heureRetour?: string;
  motif?: string;
  statut?: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const permissionsService = {
  async getAllPaginated(page: number = 0, size: number = 10, agentName: string = ''): Promise<PageResponse<Permission>> {
    let url = `/permissions?page=${page + 1}&per_page=${size}`;
    if (agentName) {
      url += `&search=${encodeURIComponent(agentName)}`;
    }
    const response = await api.get(url);
    const d = response.data;
    if (d.data) {
      return {
        content: d.data || [],
        pageNumber: (d.current_page ?? 1) - 1,
        pageSize: d.per_page ?? size,
        totalElements: d.total ?? 0,
        totalPages: d.last_page ?? 0,
        last: d.current_page >= d.last_page,
      };
    }
    return d;
  },

  async getAll(): Promise<Permission[]> {
    const response = await api.get('/permissions/all');
    return response.data;
  },

  async create(data: PermissionPayload): Promise<Permission> {
    const response = await api.post('/permissions', data);
    return response.data;
  },

  async update(id: number, data: Partial<PermissionPayload>): Promise<Permission> {
    const response = await api.put(`/permissions/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/permissions/${id}`);
  },
};