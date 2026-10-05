import api from "../types/api";

export interface Affectation {
  id?: number;
  idAgent: number;
  idDirection: number;
  dateDebut: string;
  dateFin?: string | null;
  agentNom: string;
  agentPostnom: string;
  agentPrenom: string;
  directionSigle: string;
  directionNom: string;
}

// Payload utilisé par le formulaire (peut être identique à l'interface)
export type AffectationPayload = Omit<Affectation, 'id'> & { id?: number };

export const affectationService = {
  // Créer une affectation
  create: async (data: AffectationPayload): Promise<Affectation> => {
    const response = await api.post('/affectations', data);
    return response.data;
  },

  // Mettre à jour une affectation
  update: async (id: number, data: AffectationPayload): Promise<Affectation> => {
    const response = await api.put(`/affectations/${id}`, data);
    return response.data;
  },

  // Supprimer une affectation
  delete: async (id: number): Promise<void> => {
    await api.delete(`/affectations/${id}`);
  },

  // Optionnel : récupérer toutes les affectations (utile pour d'autres écrans)
  getAll: async (): Promise<Affectation[]> => {
    const response = await api.get('/affectations/all');
    return response.data;
  },

  // Optionnel : récupérer une affectation par son ID
  getById: async (id: number): Promise<Affectation> => {
    const response = await api.get(`/affectations/${id}`);
    return response.data;
  },
};