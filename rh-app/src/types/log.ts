export interface LogResponse {
  id: number;
  userId: number | null;
  username: string;
  action: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string; // ISO datetime
}

export interface LogListResponse {
  content: LogResponse[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  last: boolean;
}