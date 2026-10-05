// src/types/role.ts
export interface Role {
  id: number;
  nomRole: string;
  description: string;
  dateCreation: string; // ISO datetime
}

export interface RolePayload {
  nomRole: string;
  description?: string;
}

