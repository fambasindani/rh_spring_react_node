package grad.microservice_auth.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ContratRequest {
    @NotNull private Long idAgent;
    @NotNull private String typeContrat;
    private String reference;
    @NotNull private LocalDate dateDebut;
    private LocalDate dateFin;
    private String statut;
}