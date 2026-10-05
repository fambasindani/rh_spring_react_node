// src/types/user.ts
export interface RoleOption {
  id: number;
  nomRole: string;
}

export interface UserResponse {
  id: number;
  username: string;
  agentId: number;
  agentNom?: string;
  agentPrenom?: string;
  agentMatricule?: string;
  roles: RoleOption[];
  actif: boolean;
  dateCreation: string;
}

export interface UserPayload {
  agentId: number;
  roleIds: number[];
  actif: boolean;
  password?: string; // obligatoire pour la création
}

export interface UserListResponse {
  content: UserResponse[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  last: boolean;
}