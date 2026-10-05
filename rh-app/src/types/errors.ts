// src/types/errors.ts
// Type d'erreur renvoyé par le backend (GlobalExceptionHandler / Spring Security).
export interface ApiError {
  status?: number;
  message?: string;
  error?: string;
  errors?: Record<string, string>;
}

// Alias pour compatibilité avec les usages existants.
export type BackendError = ApiError;
export type ErrorResponse = ApiError;
export type ApiErrorResponse = ApiError;
