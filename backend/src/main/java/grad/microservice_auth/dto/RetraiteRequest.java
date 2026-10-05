package grad.microservice_auth.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class RetraiteRequest {
    @NotNull private Long idAgent;
    @NotNull private LocalDate dateRetraite;
    private String reference;
    private String observation;
}