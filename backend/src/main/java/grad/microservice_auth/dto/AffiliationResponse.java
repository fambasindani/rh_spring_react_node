package grad.microservice_auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class AffiliationResponse {
    private Long id;
    private Long idAgent;
    private String agentNom;
    private String agentPostnom;
    private String agentPrenom;
    private String nom;
    private String postnom;
    private String prenom;
    private LocalDate dateNaissance;
    private String lieuNaissance;
    private String etat;
    private String relation;
    private Boolean statut;
}