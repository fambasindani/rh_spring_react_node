import api from '../types/api';
import type { PageResponse } from '../types/pagination';

export type CarteStatut = 'DEMANDE' | 'RECUE' | 'VALIDEE' | 'PERDUE';

export interface Carte {
  id: number;
  idAgent?: number;
  agentNom?: string;
  agentPostnom?: string;
  agentPrenom?: string;
  agentMatricule?: string;
  directionNom?: string;
  numeroCarte?: string;
  statut: CarteStatut;
  dateDemande?: string;
  dateReception?: string;
  dateValidation?: string;
  referenceAccuse?: string;
  datePerte?: string;
  motifPerte?: string;
  observation?: string;
}

export interface CartePayload {
  idAgent?: number;
  numeroCarte?: string;
  referenceAccuse?: string;
  observation?: string;
  motifPerte?: string;
  datePerte?: string;
}

export const cartesService = {
  getAll: async (params: { statut?: string; keyword?: string; directionId?: number | string; page?: number; size?: number } = {}): Promise<PageResponse<Carte>> => {
    const page = params.page ?? 0;
    const size = params.size ?? 10;
    const response = await api.get('/cartes', {
      params: { statut: params.statut, keyword: params.keyword, directionId: params.directionId, page: page + 1, per_page: size },
    });
    const d = response.data;
    return {
      content: d.content || d.data || [],
      pageNumber: (d.current_page ?? 1) - 1,
      pageSize: d.per_page ?? size,
      totalElements: d.total ?? 0,
      totalPages: d.last_page ?? 0,
      last: (d.current_page ?? 1) >= (d.last_page ?? 1),
    };
  },

  getAllList: async (): Promise<Carte[]> => {
    const response = await api.get('/cartes/all');
    return response.data;
  },

  stats: async (): Promise<Record<string, number>> => {
    const response = await api.get('/cartes/stats');
    return response.data;
  },

  create: async (data: CartePayload): Promise<Carte> => {
    const response = await api.post('/cartes', data);
    return response.data;
  },

  update: async (id: number, data: CartePayload): Promise<Carte> => {
    const response = await api.put(`/cartes/${id}`, data);
    return response.data;
  },

  reception: async (id: number, data: CartePayload): Promise<Carte> => {
    const response = await api.post(`/cartes/${id}/reception`, data);
    return response.data;
  },

  valider: async (id: number): Promise<Carte> => {
    const response = await api.post(`/cartes/${id}/valider`);
    return response.data;
  },

  perte: async (id: number, data: CartePayload): Promise<Carte> => {
    const response = await api.post(`/cartes/${id}/perte`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/cartes/${id}`);
  },
};
