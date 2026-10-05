// src/services/fonction.service.ts
import api from "../types/api";

export interface Fonction {
  id: number;
  nom: string;
  statut: boolean;
}

export interface FonctionPayload {
  nom: string;
  statut: boolean;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  last: boolean;
}

export const fonctionService = {
  // Liste paginée
  getAllPaginated: async (page: number = 0, size: number = 10): Promise<PageResponse<Fonction>> => {
    const response = await api.get('/fonctions', { params: { page: page + 1, per_page: size } });
    const d = response.data;
    return {
      content: d.content || d.data || [],
      pageNumber: (d.currentPage ?? d.current_page ?? 1) - 1,
      pageSize: d.pageSize ?? d.per_page ?? size,
      totalPages: d.totalPages ?? d.last_page ?? 0,
      totalElements: d.totalElements ?? d.total ?? 0,
      last: (d.currentPage ?? d.current_page ?? 1) >= (d.totalPages ?? d.last_page ?? 0),
    };
  },

  // Liste complète (pour les dropdowns)
  getAll: async (): Promise<Fonction[]> => {
    const response = await api.get('/fonctions/all');
    return response.data;
  },

  // Création
  create: async (data: FonctionPayload): Promise<Fonction> => {
    const response = await api.post('/fonctions', data);
    return response.data;
  },

  // Mise à jour
  update: async (id: number, data: FonctionPayload): Promise<Fonction> => {
    const response = await api.put(`/fonctions/${id}`, data);
    return response.data;
  },

  // Suppression
  delete: async (id: number): Promise<void> => {
    await api.delete(`/fonctions/${id}`);
  },

  // Détail
  getById: async (id: number): Promise<Fonction> => {
    const response = await api.get(`/fonctions/${id}`);
    return response.data;
  },

  // Recherche
  search: async (keyword: string, page: number = 0, size: number = 10): Promise<PageResponse<Fonction>> => {
    const response = await api.post('/fonctions/search', { keyword, page: page + 1, per_page: size });
    const d = response.data;
    if (Array.isArray(d)) {
      return { content: d, pageNumber: 0, pageSize: size, totalPages: 1, totalElements: d.length, last: true };
    }
    return {
      content: d.content || d.data || [],
      pageNumber: (d.currentPage ?? d.current_page ?? 1) - 1,
      pageSize: d.pageSize ?? d.per_page ?? size,
      totalPages: d.totalPages ?? d.last_page ?? 0,
      totalElements: d.totalElements ?? d.total ?? 0,
      last: (d.currentPage ?? d.current_page ?? 1) >= (d.totalPages ?? d.last_page ?? 0),
    };
  },
};