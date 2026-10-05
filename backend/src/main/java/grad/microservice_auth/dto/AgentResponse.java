package grad.microservice_auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class AgentResponse {
    private Long id;
    private String matricule;
    private Long idGrade;
    private String gradeSigle;
    private String gradeNom;
    private Long idFonction;
    private String fonctionNom;
    private Long idDirection;
    private String directionSigle;
    private String directionNom;
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
}