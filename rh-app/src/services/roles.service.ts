// src/services/roles.service.ts
import api from '../types/api';
import type { Role, RolePayload } from '../types/role';

export const roleService = {
  getAllRoles: async (): Promise<Role[]> => {
    const response = await api.get('/roles');
    const d = response.data;
    return Array.isArray(d) ? d : d.data || [];
  },

  createRole: async (payload: RolePayload): Promise<Role> => {
    const response = await api.post('/roles', payload);
    return response.data;
  },

  updateRole: async (id: number, payload: RolePayload): Promise<Role> => {
    const response = await api.put(`/roles/${id}`, payload);
    return response.data;
  },

  deleteRole: async (id: number): Promise<void> => {
    await api.delete(`/roles/${id}`);
  },
};
