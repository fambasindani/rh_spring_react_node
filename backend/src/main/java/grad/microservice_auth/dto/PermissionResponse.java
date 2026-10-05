package grad.microservice_auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@AllArgsConstructor
public class PermissionResponse {
    private Long id;
    private Long idAgent;
    private String agentNom;
    private String agentPrenom;
    private LocalDate datePermission;
    private LocalTime heureSortie;
    private LocalTime heureRetour;
    private String motif;
    private String statut;
}