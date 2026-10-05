import api from '../types/api';
import type { Droit, DroitPayload, DroitListResponse } from '../types/droit';
import type { Role } from '../types/role';

export const droitService = {
  getAllDroits: async (): Promise<Droit[]> => {
    const response = await api.get('/droits/all');
    const d = response.data;
    return Array.isArray(d) ? d : d.data || [];
  },

  getDroitsPaginated: async (page: number = 0, size: number = 10): Promise<DroitListResponse> => {
    const response = await api.get(`/droits?page=${page + 1}&per_page=${size}`);
    const d = response.data;
    return {
      content: d.data || [],
      pageNumber: (d.current_page || 1) - 1,
      pageSize: d.per_page || size,
      totalElements: d.total || 0,
      totalPages: d.last_page || 0,
      last: (d.current_page || 1) >= (d.last_page || 0),
    };
  },

  getById: async (id: number): Promise<Droit> => {
    const response = await api.get(`/droits/${id}`);
    return response.data;
  },

  create: async (payload: DroitPayload): Promise<Droit> => {
    const response = await api.post('/droits', payload);
    return response.data;
  },

  update: async (id: number, payload: DroitPayload): Promise<Droit> => {
    const response = await api.put(`/droits/${id}`, payload);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/droits/${id}`);
  },

  assignToRole: async (droitId: number, roleId: number): Promise<void> => {
    await api.post(`/droits/${droitId}/roles`, { roleId });
  },

  unassignFromRole: async (droitId: number, roleId: number): Promise<void> => {
    await api.delete(`/droits/${droitId}/roles/${roleId}`);
  },

  getRolesByDroit: async (droitId: number): Promise<Role[]> => {
    const response = await api.get(`/droits/${droitId}/roles`);
    const d = response.data;
    return Array.isArray(d) ? d : d.data || [];
  },

  getByRoleId: async (roleId: number): Promise<Droit[]> => {
    const response = await api.get(`/droits/role/${roleId}`);
    const d = response.data;
    return Array.isArray(d) ? d : d.data || [];
  },

  bulkAssignToRole: async (roleId: number, droitIds: number[]): Promise<void> => {
    await api.post(`/droits/role/${roleId}/bulk`, droitIds);
  },

  initDefaults: async (): Promise<string> => {
    const response = await api.post('/droits/init', {});
    return response.data?.message || 'Droits initialisés avec succès';
  },
};
