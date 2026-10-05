package grad.microservice_auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FonctionResponse {
    private Long id;
    private String nom;
    private Boolean statut;
}