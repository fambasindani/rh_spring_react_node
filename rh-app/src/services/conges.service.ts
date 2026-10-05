// src/services/conges.service.ts
import type { Agent } from '../types/agent';
import api from '../types/api';


export interface TypeConge {
  id: number;
  nom: string;
  nombreJours: number;
  description?: string;
  statut: boolean;
}

export interface Conge {
  id: number;
  idAgent: number;
  agentNom?: string;
  agentPrenom?: string;
  idTypeConge: number;
  typeCongeNom?: string;
  dateDebut: string;
  dateFin: string;
  nombreJours: number;
  motif?: string;
  statut: 'EN_ATTENTE' | 'ACCEPTE' | 'REFUSE' | 'ANNULE';
  observation?: string;
  dateDemande: string;
}


// src/services/conges.service.ts
export interface CongePayload {
  idAgent: number;
  idTypeConge: number;
  dateDebut: string;
  dateFin: string;
  motif?: string;
}

export interface CongeRequest {
  idAgent: number;
  idTypeConge: number;
  dateDebut: string;
  dateFin: string;
  motif?: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// src/services/conges.service.ts
export const congesService = {
  async getAll(page: number = 0, size: number = 10, agentName: string = ''): Promise<PageResponse<Conge>> {
    let url = `/conges?page=${page + 1}&per_page=${size}`;
    if (agentName && agentName.trim()) {
      url += `&search=${encodeURIComponent(agentName)}`;
    }
    const response = await api.get(url);
    const d = response.data;
    return {
      content: d.data || [],
      pageNumber: (d.current_page ?? 1) - 1,
      pageSize: d.per_page ?? size,
      totalElements: d.total ?? 0,
      totalPages: d.last_page ?? 0,
      last: d.current_page >= d.last_page,
    };
  },

// src/services/conges.service.ts
async updateStatus(id: number, statut: string): Promise<Conge> {
  const response = await api.patch(`/conges/${id}/status`, { statut });
  return response.data;
},



  async getById(id: number): Promise<Conge> {
    const response = await api.get(`/conges/${id}`);
    return response.data;
  },

  async create(data: CongeRequest): Promise<Conge> {
    const response = await api.post('/conges', data);
    return response.data;
  },

  async update(id: number, data: Partial<CongeRequest>): Promise<Conge> {
    const response = await api.put(`/conges/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/conges/${id}`);
  },

  async searchAgents(keyword: string, page: number = 0, size: number = 10): Promise<PageResponse<Agent>> {
  const response = await api.post('/agents/search', { keyword, page, size });
  return response.data;
},

  async getTypesConge(): Promise<TypeConge[]> {
    const response = await api.get('/types-conge');
    const data = response.data;
    const list = Array.isArray(data) ? data : data.data || [];
    return list.map((t: any) => ({
      id: t.id,
      nom: t.libelle || t.nom || '',
      nombreJours: t.dureeMaxJours ?? t.nombreJours ?? 0,
      description: t.description,
      statut: true,
    }));
  }
};