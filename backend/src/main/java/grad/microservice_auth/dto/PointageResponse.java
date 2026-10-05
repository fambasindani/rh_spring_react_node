package grad.microservice_auth.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PointageResponse {
    private Long id;
    private Long agentId;
    private String agentNom;
    private String agentPostnom;
    private String agentPrenom;
    private String agentMatricule;
    private String type;
    private String statut;
    private LocalDateTime horodatage;
    private String message;
    private Integer minutesRetard;
    private String nomZone;
    private Boolean estJourFerie;
    private String motifRejet;
    private String justification;
    private String photoPath;
}
