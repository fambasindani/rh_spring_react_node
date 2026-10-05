package grad.microservice_auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class ContratResponse {
    private Long id;
    private Long idAgent;
    private String agentNom;
    private String agentPrenom;
    private String typeContrat;
    private String reference;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String statut;
}