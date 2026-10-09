package grad.microservice_auth.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class CarteRequest {
    private Long idAgent;
    private String numeroCarte;
    private String referenceAccuse;
    private String observation;
    private String motifPerte;
    private LocalDate datePerte;
}
