// src/types/dashboard.ts
export interface DashboardConge {
  id: number;
  agentNom: string;
  agentPrenom: string;
  typeCongeNom: string;
  dateDebut: string;
  dateFin: string;
  nombreJours: number;
  statut: string;
}

export interface DashboardAbsence {
  id: number;
  agentNom: string;
  agentPrenom: string;
  dateDebut: string;
  dateFin: string;
  motif: string;
}

export interface DashboardNotification {
  id: number;
  message: string;
  lu: boolean;
  dateNotification: string;
  agentEmail: string;
}

export interface DashboardStatistics {
  totalAgents: number;
  totalDirections: number;
  totalGrades: number;
  totalFonctions: number;
  agentsByDirection: Record<string, number>;
  agentsByGrade: Record<string, number>;
  agentsByFonction: Record<string, number>;
  agentsByStatut: Record<string, number>;
  agentsBySexe: Record<string, number>;
  hireEvolution: { year: number; count: number }[];
  birthdaysThisYear: { month: number; count: number }[];
  activeAgents: number;
  inactiveAgents: number;
  pendingConges: number;
  todayAbsences: number;
  todayPresences: number;
  todayPresencesRate: number;
  totalSanctions: number;
  unreadNotifications: number;
  recentConges: DashboardConge[];
  recentAbsences: DashboardAbsence[];
  recentNotifications: DashboardNotification[];
}
