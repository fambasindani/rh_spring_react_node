// src/services/agentFormations.service.ts
import api from '../types/api';

export interface AgentFormation {
  id: number;
  idAgent: number;
  agentNom?: string;
  agentPrenom?: string;
  idFormation: number;
  formationIntitule?: string;
  resultat?: string;
  observation?: string;
}

export interface AgentFormationPayload {
  idAgent: number;
  idFormation: number;
  resultat?: string;
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

export const agentFormationsService = {
  async getAll(page: number = 0, size: number = 10, keyword: string = ''): Promise<PageResponse<AgentFormation>> {
    let url = `/agent-formations?page=${page + 1}&per_page=${size}`;
    if (keyword) {
      url += `&keyword=${encodeURIComponent(keyword)}`;
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

    // ✅ Récupérer les inscriptions d'un agent spécifique (pour la page "Mes formations")
  async getByAgent(agentId: number, page: number = 0, size: number = 10, keyword: string = ''): Promise<PageResponse<AgentFormation>> {
    let url = `/agent-formations?page=${page + 1}&per_page=${size}&agentId=${agentId}`;
    if (keyword) {
      url += `&keyword=${encodeURIComponent(keyword)}`;
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

   async getAllFormations(): Promise<AgentFormation[]> {
    // Si votre backend n'a pas d'endpoint sans pagination, vous pouvez utiliser un paramètre size très grand
    // ou créer un endpoint dédié. Ici on suppose que /agent-formations/all existe.
    const response = await api.get('/agent-formations/all');
    return response.data;
  },

  async create(data: AgentFormationPayload): Promise<AgentFormation> {
    const response = await api.post('/agent-formations', data);
    return response.data;
  },

  async update(id: number, data: Partial<AgentFormationPayload>): Promise<AgentFormation> {
    const response = await api.put(`/agent-formations/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/agent-formations/${id}`);
  },
};