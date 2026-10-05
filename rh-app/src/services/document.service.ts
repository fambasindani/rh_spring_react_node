// src/services/document.service.ts
import api from '../types/api';
import type { DocumentPayload } from '../components/modal/DocumentModal';

export interface DocumentResponse {
  id: number;
  idAgent: number;
  agentNom: string;
  agentPostnom: string;
  agentPrenom: string;
  intitule: string;
  cheminFichier: string;
}

/**
 * Convertit un payload en FormData pour l'envoi multipart
 */
const toFormData = (payload: DocumentPayload): FormData => {
  const formData = new FormData();

  // ⚠️ IMPORTANT : doit correspondre au DTO Spring (idAgent)
  formData.append('idAgent', payload.idAgent.toString());

  formData.append('intitule', payload.intitule);

  // fichier optionnel (obligatoire en création côté backend si @NotNull)
  if (payload.fichier) {
    formData.append('fichier', payload.fichier);
  }

  return formData;
};

export const documentService = {
  /**
   * Crée un nouveau document
   */
  create: async (payload: DocumentPayload): Promise<DocumentResponse> => {
    const formData = toFormData(payload);

    const response = await api.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Met à jour un document existant
   */
  update: async (id: number, payload: DocumentPayload): Promise<DocumentResponse> => {
    const formData = toFormData(payload);

    const response = await api.put(`/documents/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Supprime un document
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },

  /**
   * Récupère un document par ID
   */
  getById: async (id: number): Promise<DocumentResponse> => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  /**
   * Liste des documents
   */
  getAll: async (params?: { page?: number; size?: number; agentId?: number }) => {
    const page = params?.page ?? 0;
    const size = params?.size ?? 10;
    const response = await api.get('/documents', { params: { ...params, page: page + 1, per_page: size } });
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

  /**
   * Génère l'URL d'accès au fichier
   */
  getFileUrl: (cheminFichier: string): string => {
    const baseUrl =
      api.defaults.baseURL?.replace(/\/api$/, '') ||
      'http://localhost:8083';

    return `${baseUrl}${cheminFichier}`;
  },
};