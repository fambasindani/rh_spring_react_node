// src/services/userAdmin.service.ts
import api from '../types/api';
import type { UserResponse, UserPayload, UserListResponse } from '../types/User';

export const userAdminService = {
  // Récupération paginée avec recherche (backend)
  getUsers: async (params: { page?: number; size?: number; keyword?: string }): Promise<UserListResponse> => {
    const page = params.page ?? 0;
    const size = params.size ?? 10;
    const response = await api.get('/admin/users', { params: { ...params, page: page + 1, per_page: size } });
    const d = response.data;
    return {
      content: d.content || d.data || [],
      pageNumber: (d.currentPage ?? d.current_page ?? 1) - 1,
      pageSize: d.pageSize ?? d.per_page ?? size,
      totalElements: d.totalElements ?? d.total ?? 0,
      totalPages: d.totalPages ?? d.last_page ?? 0,
      last: (d.currentPage ?? d.current_page ?? 1) >= (d.totalPages ?? d.last_page ?? 0),
    };
  },

  // Création (à adapter selon votre endpoint)
  createUser: async (payload: UserPayload): Promise<UserResponse> => {
    const response = await api.post<UserResponse>('/admin/users', payload);
    return response.data;
  },

  // Mise à jour
  updateUser: async (id: number, payload: Partial<UserPayload>): Promise<UserResponse> => {
    const response = await api.put<UserResponse>(`/admin/users/${id}`, payload);
    return response.data;
  },

  // Suppression
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },
};