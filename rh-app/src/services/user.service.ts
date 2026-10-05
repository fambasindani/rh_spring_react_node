// src/services/user.service.ts
import api from '../types/api';
import type { AgentDetailsResponse } from '../types/agent';

export interface UpdateProfileData {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  // Ajoutez d'autres champs modifiables si besoin
  // par exemple : adresse, ville, etc.
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const userService = {
  /**
   * Récupère le profil complet de l'agent connecté
   * GET /agents/me → retourne AgentDetailsResponse
   */
  async getProfile(): Promise<AgentDetailsResponse> {
    const response = await api.get<AgentDetailsResponse>('/agents/me');
    return response.data;
  },

  /**
   * Met à jour certaines informations du profil de l'agent
   * PUT /agents/me → attend un objet partiel et retourne AgentDetailsResponse
   */
  async updateProfile(data: UpdateProfileData): Promise<AgentDetailsResponse> {
    const formData = new FormData();
    if (data.nom) formData.append('nom', data.nom);
    if (data.prenom) formData.append('prenom', data.prenom);
    if (data.email) formData.append('email', data.email);
    if (data.telephone) formData.append('telephone', data.telephone);
    const response = await api.put<AgentDetailsResponse>('/agents/me', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Change le mot de passe de l'utilisateur connecté
   * POST /auth/change-password
   */
  async changePassword(data: ChangePasswordData): Promise<void> {
    await api.put('/agents/me/password', data);
  },

  // Si vous avez besoin d'autres endpoints, ajoutez-les ici
  // Exemple : récupérer un agent par son ID (pour admin)
  // async getAgentById(id: number): Promise<AgentDetailsResponse> { ... }
};