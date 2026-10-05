export interface Droit {
  id: number;
  nomDroit: string;
  description: string;
  module: string;
  dateCreation: string;
}

export interface DroitPayload {
  nomDroit: string;
  description?: string;
  module?: string;
}

export interface DroitListResponse {
  content: Droit[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  last: boolean;
}
