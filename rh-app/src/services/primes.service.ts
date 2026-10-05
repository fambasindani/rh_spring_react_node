// src/services/primes.service.ts
import api from '../types/api';

export interface Prime {
  id: number;
  idAgent: number;
  agentNom?: string;
  agentPrenom?: string;
  libelle: string;
  montant: number;
  datePrime: string;
}

export interface PrimePayload {
  idAgent: number;
  libelle: string;
  montant: number;
  datePrime: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const primesService = {
  async getAll(page: number = 0, size: number = 10, keyword: string = ''): Promise<PageResponse<Prime>> {
    let url = `/primes?page=${page + 1}&per_page=${size}`;
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

  async create(data: PrimePayload): Promise<Prime> {
    const response = await api.post('/primes', data);
    return response.data;
  },

  async update(id: number, data: Partial<PrimePayload>): Promise<Prime> {
    const response = await api.put(`/primes/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/primes/${id}`);
  },
};