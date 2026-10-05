import api from '../types/api';

export interface PointageResponse {
  id: number;
  agentId: number;
  agentNom: string;
  agentPostnom: string;
  agentPrenom: string;
  agentMatricule: string;
  type: string;
  statut: string;
  horodatage: string;
  message?: string;
  minutesRetard?: number;
  nomZone?: string;
  motifRejet?: string;
  justification?: string;
  photoPath?: string;
}

export interface PresenceDuJour {
  id: number;
  agentId: number;
  agentNom: string;
  agentPostnom: string;
  agentPrenom: string;
  agentMatricule: string;
  datePresence: string;
  heureArrivee: string | null;
  heureDepart: string | null;
  statut: string;
  minutesRetard: number;
  pointageArrivee: PointageResponse | null;
  pointageDepart: PointageResponse | null;
  zone: string | null;
}

export interface AbsenceDuJour {
  id: number;
  agentId: number;
  agentNom: string;
  agentPostnom: string;
  agentPrenom: string;
  agentMatricule: string;
  dateAbsence: string;
  statut: string;
  direction?: string;
  grade?: string;
  fonction?: string;
}

export interface ZoneTravail {
  id: number;
  nom: string;
  adresse: string;
  latitude: number;
  longitude: number;
  rayon: number;
  actif: boolean;
}

export interface HoraireTravail {
  id: number;
  agentId?: number;
  jourSemaine: number;
  heureDebut: string;
  heureFin: string;
  debutFenetrePointage: string;
  finFenetrePointage: string;
  actif: boolean;
}

export interface JourFerie {
  id: number;
  nom: string;
  date: string;
  actif: boolean;
}

const pointagesService = {
  getPresencesDuJour: async (date?: string): Promise<PresenceDuJour[]> => {
    const params = date ? `?date=${date}` : '';
    const response = await api.get(`/pointages/presences-du-jour${params}`);
    const d = response.data;
    return Array.isArray(d) ? d : d.data || [];
  },

  getAbsencesDuJour: async (date?: string): Promise<AbsenceDuJour[]> => {
    const params = date ? `?date=${date}` : '';
    const response = await api.get(`/pointages/absences-du-jour${params}`);
    const d = response.data;
    return Array.isArray(d) ? d : d.data || [];
  },

  getHistorique: async (agentId: number, debut: string, fin: string): Promise<PointageResponse[]> => {
    const response = await api.get(`/pointages/historique/${agentId}?debut=${debut}&fin=${fin}`);
    return response.data;
  },

  // === Zones de travail ===
  getZones: async (): Promise<ZoneTravail[]> => {
    const response = await api.get('/zones-travail');
    const d = response.data;
    return Array.isArray(d) ? d : d.data || [];
  },

  getZonesActives: async (): Promise<ZoneTravail[]> => {
    const response = await api.get('/zones-travail/actives');
    const d = response.data;
    return Array.isArray(d) ? d : d.data || [];
  },

  createZone: async (zone: Omit<ZoneTravail, 'id'>): Promise<ZoneTravail> => {
    const response = await api.post('/zones-travail', zone);
    return response.data;
  },

  updateZone: async (id: number, zone: Partial<ZoneTravail>): Promise<ZoneTravail> => {
    const response = await api.put(`/zones-travail/${id}`, zone);
    return response.data;
  },

  deleteZone: async (id: number): Promise<void> => {
    await api.delete(`/zones-travail/${id}`);
  },

  // === Horaires de travail ===
  getHoraires: async (): Promise<HoraireTravail[]> => {
    const response = await api.get('/horaires-travail');
    const d = response.data;
    return Array.isArray(d) ? d : d.data || [];
  },

  getHorairesAgent: async (agentId: number): Promise<HoraireTravail[]> => {
    const response = await api.get(`/horaires-travail/agent/${agentId}`);
    const d = response.data;
    return Array.isArray(d) ? d : d.data || [];
  },

  createHoraire: async (horaire: Omit<HoraireTravail, 'id'>): Promise<HoraireTravail> => {
    const response = await api.post('/horaires-travail', horaire);
    return response.data;
  },

  updateHoraire: async (id: number, horaire: Partial<HoraireTravail>): Promise<HoraireTravail> => {
    const response = await api.put(`/horaires-travail/${id}`, horaire);
    return response.data;
  },

  deleteHoraire: async (id: number): Promise<void> => {
    await api.delete(`/horaires-travail/${id}`);
  },

  // === Jours fériés ===
  getJoursFeries: async (): Promise<JourFerie[]> => {
    const response = await api.get('/jours-feries');
    const d = response.data;
    return Array.isArray(d) ? d : d.data || [];
  },

  createJourFerie: async (jour: Omit<JourFerie, 'id'>): Promise<JourFerie> => {
    const response = await api.post('/jours-feries', jour);
    return response.data;
  },

  updateJourFerie: async (id: number, jour: Partial<JourFerie>): Promise<JourFerie> => {
    const response = await api.put(`/jours-feries/${id}`, jour);
    return response.data;
  },

  deleteJourFerie: async (id: number): Promise<void> => {
    await api.delete(`/jours-feries/${id}`);
  },
};

export default pointagesService;
