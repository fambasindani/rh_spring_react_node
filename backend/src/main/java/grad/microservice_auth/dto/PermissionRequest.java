package grad.microservice_auth.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class PermissionRequest {
    @NotNull private Long idAgent;
    @NotNull private LocalDate datePermission;
    private LocalTime heureSortie;
    private LocalTime heureRetour;
    private String motif;
    private String statut;
}