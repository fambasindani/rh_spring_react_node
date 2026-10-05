package grad.microservice_auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgentDetailsResponse {
    // Informations de base
    private Long id;
    private String matricule;
    private String nom;
    private String postnom;
    private String prenom;
    private String sexe;
    private LocalDate dateNaissance;
    private String email;
    private String telephone;
    private String etatCivil;
    private Boolean statut;
    private String referenceEngagement;
    private LocalDate dateEngagement;
    private String province;
    private String territoire;
    private String village;
    private String photo;

    // Relations principales
    private Long idGrade;
    private String gradeSigle;
    private String gradeNom;
    private Long idFonction;
    private String fonctionNom;
    private Long idDirection;
    private String directionSigle;
    private String directionNom;

    // Listes associées
    private List<AffectationDto> affectations;
    private List<PromotionDto> promotions;
    private List<AffiliationDto> affiliations;
    private List<EtudeDto> etudes;
    private List<DocumentDto> documents;

    // Sous‑DTOs pour les listes
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AffectationDto {
        private Long id;
        private Long idDirection;
        private String directionSigle;
        private String directionNom;
        private LocalDate dateDebut;
        private LocalDate dateFin;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PromotionDto {
        private Long id;
        private Long idGrade;
        private String gradeSigle;
        private String gradeNom;
        private LocalDate dateDebut;
        private LocalDate dateFin;
        private String reference;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AffiliationDto {
        private Long id;
        private String nom;
        private String postnom;
        private String prenom;
        private LocalDate dateNaissance;
        private String lieuNaissance;
        private String etat;
        private String relation;
        private Boolean statut;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EtudeDto {
        private Long id;
        private Integer nombreAnnee;
        private String lieu;
        private String etablissement;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentDto {
        private Long id;
        private String intitule;
        private String cheminFichier;
    }
}