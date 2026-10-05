package grad.microservice_auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PrimeRequest {
    @NotNull
    private Long idAgent;

    @NotBlank(message = "Le libellé est obligatoire")
    private String libelle;

    @NotNull
    @Positive
    private BigDecimal montant;

    @NotNull
    private LocalDate datePrime;
}