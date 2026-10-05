package grad.microservice_auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

// CongeResponse.java
@Data
@AllArgsConstructor
public class CongeResponse {
    private Long id;
    private Long idAgent;
    private String agentNom;
    private String agentPrenom;
    private Long idTypeConge;
    private String typeCongeNom;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private Integer nombreJours;
    private String motif;
    private String statut;
    private String observation;
    private LocalDateTime dateDemande;
}
