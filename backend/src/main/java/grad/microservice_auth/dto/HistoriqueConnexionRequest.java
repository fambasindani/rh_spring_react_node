package grad.microservice_auth.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class HistoriqueConnexionRequest {
    @NotNull private Long idUser;
    private String adresseIp;
    private String navigateur;
}