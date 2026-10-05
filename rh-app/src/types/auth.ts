// src/types/auth.ts

export interface AuthUser {
  username: string;
  roles: string[];
  droits: string[];
  userId: number;
  agentId: number;
}

export interface AuthResponse {
  token: string;
  type: 'Bearer';
  username: string;
  roles: string[];
  droits: string[];
  userId: number;
  agentId: number;
}

