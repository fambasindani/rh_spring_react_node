import api from "../types/api";

export interface Etude {
  id: number;
  id_agent: number;
  nombre_annee: number;
  lieu: string;
  etablissement: string;
}

export interface EtudeResponse {
  id: number;
  idAgent: number;
  agentNom: string;
  agentPostnom: string;
  agentPrenom: string;
  nombreAnnee: number;
  lieu: string;
  etablissement: string;
}

export interface EtudePayload {
  id_agent: number;
  nombre_annee: number;
  lieu: string;
  etablissement: string;
}

export const etudeService = {
  // Récupérer toutes les études d'un agent
  getByAgentId: async (agentId: number): Promise<Etude[]> => {
    try {
      const response = await api.get('/etudes/all');
      const allEtudes: EtudeResponse[] = response.data;
      return allEtudes
        .filter(e => e.idAgent === agentId)
        .map(e => ({
          id: e.id,
          id_agent: e.idAgent,
          nombre_annee: e.nombreAnnee,
          lieu: e.lieu,
          etablissement: e.etablissement,
        }));
    } catch (error) {
      console.error('Erreur chargement études', error);
      return [];
    }
  },

  // Créer une étude
  create: async (data: EtudePayload): Promise<Etude> => {
    const response = await api.post('/etudes', {
      id_agent: data.id_agent,
      nombre_annee: data.nombre_annee,
      lieu: data.lieu,
      etablissement: data.etablissement,
    });
    const res: EtudeResponse = response.data;
    return {
      id: res.id,
      id_agent: res.idAgent,
      nombre_annee: res.nombreAnnee,
      lieu: res.lieu,
      etablissement: res.etablissement,
    };
  },

  // Mettre à jour une étude
  update: async (id: number, data: EtudePayload): Promise<Etude> => {
    const response = await api.put(`/etudes/${id}`, {
      id_agent: data.id_agent,
      nombre_annee: data.nombre_annee,
      lieu: data.lieu,
      etablissement: data.etablissement,
    });
    const res: EtudeResponse = response.data;
    return {
      id: res.id,
      id_agent: res.idAgent,
      nombre_annee: res.nombreAnnee,
      lieu: res.lieu,
      etablissement: res.etablissement,
    };
  },

  // Supprimer une étude
  delete: async (id: number): Promise<void> => {
    await api.delete(`/etudes/${id}`);
  },

  // Récupérer toutes les études
  getAll: async (): Promise<Etude[]> => {
    const response = await api.get('/etudes/all');
    const allEtudes: EtudeResponse[] = response.data;
    return allEtudes.map(e => ({
      id: e.id,
      id_agent: e.idAgent,
      nombre_annee: e.nombreAnnee,
      lieu: e.lieu,
      etablissement: e.etablissement,
    }));
  },

  // Récupérer une étude par son ID
  getById: async (id: number): Promise<Etude> => {
    const response = await api.get(`/etudes/${id}`);
    const res: EtudeResponse = response.data;
    return {
      id: res.id,
      id_agent: res.idAgent,
      nombre_annee: res.nombreAnnee,
      lieu: res.lieu,
      etablissement: res.etablissement,
    };
  },
};