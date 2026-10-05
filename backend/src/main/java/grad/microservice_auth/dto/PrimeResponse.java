package grad.microservice_auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class PrimeResponse {
    private Long id;
    private Long idAgent;
    private String agentNom;
    private String agentPrenom;
    private String libelle;
    private BigDecimal montant;
    private LocalDate datePrime;
}