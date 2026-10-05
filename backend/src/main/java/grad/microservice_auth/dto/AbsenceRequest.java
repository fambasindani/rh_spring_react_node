package grad.microservice_auth.dto;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class AbsenceRequest {
    @NotNull private Long idAgent;
    @NotNull private LocalDate dateDebut;
    @NotNull private LocalDate dateFin;
    private String motif;
    private String justification;
    private Boolean statut;
}
