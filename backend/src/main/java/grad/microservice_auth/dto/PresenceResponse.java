package grad.microservice_auth.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@AllArgsConstructor
public class PresenceResponse {
    private Long id;
    private Long idAgent;
    private String agentNom;
    private String agentPrenom;
    private LocalDate datePresence;
    private LocalTime heureArrivee;
    private LocalTime heureDepart;
    private String statut;
    private String observation;
}
