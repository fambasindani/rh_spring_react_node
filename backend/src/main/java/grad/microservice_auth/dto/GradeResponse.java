package grad.microservice_auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GradeResponse {
    private Long id;
    private String sigle;
    private String nom;
    private Boolean statut;
}