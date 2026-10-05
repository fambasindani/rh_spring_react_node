package grad.microservice_auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class HistoriqueConnexionResponse {
    private Long id;
    private Long idUser;
    private String userEmail;
    private LocalDateTime dateConnexion;
    private String adresseIp;
    private String navigateur;
}