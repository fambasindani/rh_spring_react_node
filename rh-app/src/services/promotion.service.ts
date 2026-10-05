import api from "../types/api";

export interface Promotion {
  id?: number;
  idAgent: number;
  idGrade: number;
  dateDebut: string;
  dateFin?: string | null;
  reference: string;
  agentNom: string;
  agentPostnom: string;
  agentPrenom: string;
  gradeSigle: string;
  gradeNom: string;
}

export type PromotionPayload = Omit<Promotion, 'id'> & { id?: number };

const toBackend = (data: PromotionPayload) => ({
  idAgent: data.idAgent,
  idGrade: data.idGrade,
  dateDebut: data.dateDebut,
  dateFin: data.dateFin,
  reference: data.reference,
});

export const promotionService = {
  create: async (data: PromotionPayload): Promise<Promotion> => {
    const response = await api.post('/promotions', toBackend(data));
    return response.data;
  },

  update: async (id: number, data: PromotionPayload): Promise<Promotion> => {
    const response = await api.put(`/promotions/${id}`, toBackend(data));
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/promotions/${id}`);
  },

  getAll: async (): Promise<Promotion[]> => {
    const response = await api.get('/promotions/all');
    return response.data;
  },

  getById: async (id: number): Promise<Promotion> => {
    const response = await api.get(`/promotions/${id}`);
    return response.data;
  },
};