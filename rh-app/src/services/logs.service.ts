import api from '../types/api';
import type { LogResponse, LogListResponse } from '../types/log';

export const logsService = {
  getLogs: async (params: { page?: number; size?: number; keyword?: string }): Promise<LogListResponse> => {
    const page = params.page ?? 0;
    const size = params.size ?? 10;
    const response = await api.get('/admin/logs', { params: { ...params, page: page + 1, per_page: size } });
    const d = response.data;
    const content = (d.data || []).map((item: any): LogResponse => ({
      id: item.id,
      userId: item.user?.id ?? item.user_id ?? null,
      username: item.user?.username ?? item.username ?? '-',
      action: item.action ?? '',
      description: item.description ?? '',
      ipAddress: item.ip_address ?? '',
      userAgent: item.user_agent ?? '',
      createdAt: item.created_at ?? '',
    }));
    return {
      content,
      pageNumber: (d.current_page ?? 1) - 1,
      pageSize: d.per_page ?? size,
      totalElements: d.total ?? 0,
      totalPages: d.last_page ?? 0,
      last: (d.current_page ?? 1) >= (d.last_page ?? 1),
    };
  }
};