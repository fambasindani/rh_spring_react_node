// src/types/agent.ts
export interface Agent {
  id: number;
  matricule: string;
  nom: string;
  postnom: string;
  prenom: string;
  sexe: string;
  dateNaissance: string;
  email: string;
  telephone: string;
  etatCivil: string;
  statut: boolean;
  referenceEngagement: string;
  dateEngagement: string;
  province: string;
  territoire: string;
  village: string;
  photo: string;
  grade: {
    id: number;
    sigle: string;
    nom: string;
  };
  fonction: {
    id: number;
    nom: string;
  };
  direction: {
    id: number;
    sigle: string;
    nom: string;
  };
}

// src/types/agent.ts (ou data.ts)
export interface AgentDetailsResponse {
  id: number;
  matricule: string;
  nom: string;
  postnom: string;
  prenom: string;
  sexe: string;
  dateNaissance: string;
  email: string;
  telephone: string;
  etatCivil: string;
  statut: boolean;
  referenceEngagement: string;
  dateEngagement: string;
  province: string;
  territoire: string;
  village: string;
  photo: string;
  idGrade: number;
  gradeSigle: string;
  gradeNom: string;
  idFonction: number;
  fonctionNom: string;
  idDirection: number;
  directionSigle: string;
  directionNom: string;
  affectations: Array<{
    id: number;
    idDirection: number;
    directionSigle: string;
    directionNom: string;
    dateDebut: string;
    dateFin: string | null;
  }>;
  promotions: Array<{
    id: number;
    idGrade: number;
    gradeSigle: string;
    gradeNom: string;
    dateDebut: string;
    dateFin: string | null;
    reference: string;
  }>;
  affiliations: Array<{
    id: number;
    nom: string;
    postnom: string;
    prenom: string;
    dateNaissance: string;
    lieuNaissance: string;
    etat: string;
    relation: string;
    statut: boolean;
  }>;
  etudes: Array<{
    id: number;
    nombreAnnee: number;
    lieu: string;
    etablissement: string;
  }>;
  documents: Array<{
    id: number;
    intitule: string;
    cheminFichier: string;
  }>;
}