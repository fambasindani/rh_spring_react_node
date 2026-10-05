// src/services/agents.service.ts
import api from '../types/api';
import type { Agent, AgentDetailsResponse } from '../types/agent';

// Interface pour la réponse brute de l'API (camelCase)
interface RawAgent {
  id: number;
  matricule: string;
  nom: string;
  postnom: string;
  prenom: string;
  sexe: string;
  dateNaissance: string;
  email: string;
  telephone: string;
  etatCivil: string;
  statut: boolean;
  referenceEngagement: string;
  dateEngagement: string;
  province: string;
  territoire: string;
  village: string;
  photo: string;
  idGrade: number;
  gradeSigle: string;
  gradeNom: string;
  idFonction: number;
  fonctionNom: string;
  idDirection: number;
  directionSigle: string;
  directionNom: string;
}

// Réponse paginée (identique à celle du backend Spring Data)
import type { PageResponse } from '../types/pagination';
export type { PageResponse };

export const agentService = {
  // Récupérer tous les agents (sans pagination)
  async getAllAgents(): Promise<Agent[]> {
    const response = await api.get('/agents/all');
    const items = response.data as RawAgent[];
    return items.map((item) => ({
      id: item.id,
      matricule: item.matricule,
      nom: item.nom,
      postnom: item.postnom,
      prenom: item.prenom,
      sexe: item.sexe,
      dateNaissance: item.dateNaissance,
      email: item.email,
      telephone: item.telephone,
      etatCivil: item.etatCivil,
      statut: item.statut,
      referenceEngagement: item.referenceEngagement,
      dateEngagement: item.dateEngagement,
      province: item.province,
      territoire: item.territoire,
      village: item.village,
      photo: item.photo,
      grade: {
        id: item.idGrade,
        sigle: item.gradeSigle,
        nom: item.gradeNom,
      },
      fonction: {
        id: item.idFonction,
        nom: item.fonctionNom,
      },
      direction: {
        id: item.idDirection,
        sigle: item.directionSigle,
        nom: item.directionNom,
      },
    }));
  },

  // Récupérer les agents avec pagination
  async getAgents(page: number = 0, size: number = 10): Promise<PageResponse<Agent>> {
    const response = await api.get(`/agents?page=${page + 1}&per_page=${size}`);
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

  // Récupérer un agent par son identifiant
  async getAgentById(id: number): Promise<Agent> {
    const response = await api.get(`/agents/${id}`);
    const item = response.data as RawAgent;
    return {
      id: item.id,
      matricule: item.matricule,
      nom: item.nom,
      postnom: item.postnom,
      prenom: item.prenom,
      sexe: item.sexe,
      dateNaissance: item.dateNaissance,
      email: item.email,
      telephone: item.telephone,
      etatCivil: item.etatCivil,
      statut: item.statut,
      referenceEngagement: item.referenceEngagement,
      dateEngagement: item.dateEngagement,
      province: item.province,
      territoire: item.territoire,
      village: item.village,
      photo: item.photo,
      grade: {
        id: item.idGrade,
        sigle: item.gradeSigle,
        nom: item.gradeNom,
      },
      fonction: {
        id: item.idFonction,
        nom: item.fonctionNom,
      },
      direction: {
        id: item.idDirection,
        sigle: item.directionSigle,
        nom: item.directionNom,
      },
    };
  },

  // Détails complets d'un agent (avec relations)
  async getAgentDetails(id: number): Promise<AgentDetailsResponse> {
    const response = await api.get(`/agents/${id}/details`);
    return response.data;
  },

  // Recherche avancée (POST) – retourne une page
  async searchAgents(criteria: {
    keyword?: string;
    gradeId?: number;
    fonctionId?: number;
    directionId?: number;
    statut?: boolean;
    page?: number;
    size?: number;
  }): Promise<PageResponse<Agent>> {
    const response = await api.post('/agents/search', {
      ...criteria,
      page: (criteria.page ?? 0) + 1,
      per_page: criteria.size ?? 10,
    });
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

  // Créer un agent avec photo et affiliations
  async createAgentWithAffiliations(formData: FormData): Promise<Agent> {
    const response = await api.post('/agents/with-affiliations', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Mettre à jour un agent (sans affiliations)
  async updateAgent(id: number, formData: FormData): Promise<Agent> {
    const response = await api.put(`/agents/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Mettre à jour un agent avec ses affiliations (et photo optionnelle)
  async updateAgentWithAffiliations(id: number, formData: FormData): Promise<Agent> {
    const response = await api.put(`/agents/${id}/with-affiliations`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Supprimer un agent
  async deleteAgent(id: number): Promise<void> {
    await api.delete(`/agents/${id}`);
  },

  // Mettre à jour la photo de profil de l'utilisateur connecté
  async updatePhoto(formData: FormData): Promise<{ photo: string }> {
    const response = await api.post('/agents/me/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Mettre à jour le profil de l'utilisateur connecté
  async updateOwnProfile(formData: FormData): Promise<Agent> {
    const response = await api.put('/agents/me', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Récupérer le profil de l'utilisateur connecté
  async getProfile(): Promise<Agent> {
    const response = await api.get('/agents/me');
    return response.data;
  },

  // Changer le mot de passe
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/agents/me/password', { currentPassword, newPassword });
  },
};