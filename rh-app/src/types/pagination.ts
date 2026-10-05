// src/types/pagination.ts
// Type de pagination partagé (retourné par les endpoints de liste du backend).
export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  last: boolean;
}
