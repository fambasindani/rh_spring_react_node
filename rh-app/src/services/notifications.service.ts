// src/services/notifications.service.ts
import api from '../types/api';

export interface Notification {
  id: number;
  agentId?: number;      // ← ID de l'agent destinataire
  agentEmail?: string;   // ← Email de l'agent (pour affichage)
  message: string;
  lu: boolean;
  dateNotification: string;
}

export interface NotificationPayload {
  agentId?: number;      // ← ID de l'agent
  message: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const notificationsService = {
  // Récupère toutes les notifications (sans pagination) – pour admin ou filtrage global
  async getAllNotifications(): Promise<Notification[]> {
    const response = await api.get('/notifications/all');
    const d = response.data;
    return Array.isArray(d) ? d : d.data || [];
  },

  // Récupère les notifications d'un agent spécifique (pour "Mes notifications")
  async getByAgent(agentId: number): Promise<Notification[]> {
    const response = await api.get(`/notifications/agent/${agentId}`);
    const d = response.data;
    return Array.isArray(d) ? d : d.data || [];
  },

  // Récupération paginée (pour admin) avec recherche
  async getAll(page: number = 0, size: number = 10, keyword: string = ''): Promise<PageResponse<Notification>> {
    let url = `/notifications?page=${page + 1}&per_page=${size}`;
    if (keyword) url += `&search=${encodeURIComponent(keyword)}`;
    const response = await api.get(url);
    const d = response.data;
    if (d.data) {
      return {
        content: d.data || [],
        pageNumber: (d.current_page ?? 1) - 1,
        pageSize: d.per_page ?? size,
        totalElements: d.total ?? 0,
        totalPages: d.last_page ?? 0,
        last: d.current_page >= d.last_page,
      };
    }
    return d;
  },

  async getById(id: number): Promise<Notification> {
    const response = await api.get(`/notifications/${id}`);
    return response.data;
  },

  async create(data: NotificationPayload): Promise<Notification> {
    const response = await api.post('/notifications', data);
    return response.data;
  },

  async update(id: number, data: Partial<NotificationPayload>): Promise<Notification> {
    const response = await api.put(`/notifications/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },

  async markAsRead(id: number): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },
};