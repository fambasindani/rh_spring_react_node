package grad.microservice_auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DirectionResponse {
    private Long id;
    private String sigle;
    private String nom;
    private Boolean statut;
}