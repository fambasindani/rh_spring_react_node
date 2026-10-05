package grad.microservice_auth.dto;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class PresenceRequest {
    @NotNull
    private Long idAgent;

    @NotNull
    private LocalDate datePresence;

    private LocalTime heureArrivee;
    private LocalTime heureDepart;

    private String statut; // "PRESENT", "ABSENT", "RETARD", "MISSION"
    private String observation;
}
