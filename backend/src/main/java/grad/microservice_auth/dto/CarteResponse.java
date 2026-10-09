package grad.microservice_auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class CarteResponse {
    private Long id;
    private Long idAgent;
    private String agentNom;
    private String agentPostnom;
    private String agentPrenom;
    private String agentMatricule;
    private String directionNom;
    private String numeroCarte;
    private String statut;
    private LocalDate dateDemande;
    private LocalDate dateReception;
    private LocalDate dateValidation;
    private String referenceAccuse;
    private LocalDate datePerte;
    private String motifPerte;
    private String observation;
}
