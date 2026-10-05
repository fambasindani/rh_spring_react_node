import api from '../types/api'; // assuming this is your axios instance
import type{ AffiliationPayload } from '../components/modal/DependantModal';

export interface AffiliationResponse {
  id: number;
  idAgent: number;
  nom: string;
  postnom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  relation: string;
  etat: string;
  statut: boolean;
}

export const affiliationService = {
  // Create a new affiliation
  create: async (data: AffiliationPayload): Promise<AffiliationResponse> => {
    const response = await api.post('/affiliations', data);
    return response.data;
  },

  // Update an existing affiliation
  update: async (id: number, data: AffiliationPayload): Promise<AffiliationResponse> => {
    const response = await api.put(`/affiliations/${id}`, data);
    return response.data;
  },

  // Delete an affiliation
  delete: async (id: number): Promise<void> => {
    await api.delete(`/affiliations/${id}`);
  },

  // Get all affiliations (optional)
  getAll: async (): Promise<AffiliationResponse[]> => {
    const response = await api.get('/affiliations/all');
    return response.data;
  },

  // Get one affiliation by id
  getById: async (id: number): Promise<AffiliationResponse> => {
    const response = await api.get(`/affiliations/${id}`);
    return response.data;
  },

  // Helper: save (create or update)
  save: async (data: AffiliationPayload & { id?: number }): Promise<AffiliationResponse> => {
    if (data.id) {
      return affiliationService.update(data.id, data);
    } else {
      return affiliationService.create(data);
    }
  }
};