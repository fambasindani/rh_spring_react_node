// src/services/evaluations.service.ts
import api from '../types/api';

export interface Evaluation {
  id: number;
  idAgent: number;
  agentNom?: string;
  agentPrenom?: string;
  dateEvaluation: string;
  note: number;
  appreciation: string;
  evaluateur: string;
}

export interface EvaluationPayload {
  idAgent: number;
  dateEvaluation: string;
  note: number;
  appreciation: string;
  evaluateur: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const evaluationsService = {
  async getAll(page: number = 0, size: number = 10, keyword: string = ''): Promise<PageResponse<Evaluation>> {
    let url = `/evaluations?page=${page + 1}&per_page=${size}`;
    if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
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

  async create(data: EvaluationPayload): Promise<Evaluation> {
    const response = await api.post('/evaluations', data);
    return response.data;
  },

  async update(id: number, data: Partial<EvaluationPayload>): Promise<Evaluation> {
    const response = await api.put(`/evaluations/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/evaluations/${id}`);
  },
};