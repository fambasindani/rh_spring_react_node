package grad.microservice_auth.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class MissionRequest {
    @NotNull private Long idAgent;
    private String lieu;
    private String motif;
    @NotNull private LocalDate dateDepart;
    private LocalDate dateRetour;
    private String reference;
}