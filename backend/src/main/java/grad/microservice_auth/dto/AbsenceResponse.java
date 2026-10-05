package grad.microservice_auth.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class AbsenceResponse {
    private Long id;
    private Long idAgent;
    private String agentNom;
    private String agentPrenom;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String motif;
    private String justification;
    private Boolean statut;
}
