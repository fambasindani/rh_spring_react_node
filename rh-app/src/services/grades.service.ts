import api from "../types/api";

export interface Grade {
  id?: number;
  sigle: string;
  nom: string;
  statut: number | boolean;
}

export interface GradeResponse {
  id: number;
  sigle: string;
  nom: string;
  statut: boolean;
}

export interface GradePayload {
  sigle: string;
  nom: string;
  statut: boolean;
}

// ✅ Pagination
export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  last: boolean;
}

export const gradeService = {

  // ✅ CORRIGÉ ICI (plus de /paginated)
  getAllPaginated: async (
    page: number,
    size: number
  ): Promise<PageResponse<GradeResponse>> => {

    const response = await api.get('/grades', {
      params: { page: page + 1, per_page: size }
    });

    const d = response.data;

    return {
      content: d.content || d.data || [],
      pageNumber: (d.currentPage ?? d.current_page ?? 1) - 1,
      pageSize: d.pageSize ?? d.per_page ?? size,
      totalPages: d.totalPages ?? d.last_page ?? 0,
      totalElements: d.totalElements ?? d.total ?? 0,
      last: (d.currentPage ?? d.current_page ?? 1) >= (d.totalPages ?? d.last_page ?? 0),
    };
  },

  // ✅ Création
  create: async (data: GradePayload): Promise<GradeResponse> => {
    const response = await api.post('/grades', data);
    return response.data;
  },

  // ✅ Mise à jour
  update: async (id: number, data: GradePayload): Promise<GradeResponse> => {
    const response = await api.put(`/grades/${id}`, data);
    return response.data;
  },

  // ✅ Suppression
  delete: async (id: number): Promise<void> => {
    await api.delete(`/grades/${id}`);
  },

  // ⚠️ OPTIONNEL : liste simple (non paginée)
  getAll: async (): Promise<GradeResponse[]> => {
    const response = await api.get('/grades/all');
    const d = response.data;
    return Array.isArray(d) ? d : d.data || [];
  },

  // ✅ Détail
  getById: async (id: number): Promise<GradeResponse> => {
    const response = await api.get(`/grades/${id}`);
    return response.data;
  },

  // ✅ Recherche
  search: async (
    keyword: string,
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<GradeResponse>> => {
    const response = await api.post('/grades/search', {
      keyword,
      page: page + 1,
      per_page: size,
    });
    const d = response.data;
    if (Array.isArray(d)) {
      return { content: d, pageNumber: 0, pageSize: size, totalPages: 1, totalElements: d.length, last: true };
    }
    return {
      content: d.content || d.data || [],
      pageNumber: (d.currentPage ?? d.current_page ?? 1) - 1,
      pageSize: d.pageSize ?? d.per_page ?? size,
      totalPages: d.totalPages ?? d.last_page ?? 0,
      totalElements: d.totalElements ?? d.total ?? 0,
      last: (d.currentPage ?? d.current_page ?? 1) >= (d.totalPages ?? d.last_page ?? 0),
    };
  },
};