package grad.microservice_auth.dto;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class SanctionRequest {
    @NotNull private Long idAgent;
    @NotNull private String typeSanction;
    @NotNull private String motif;
    @NotNull private LocalDate dateSanction;
    private String reference;
}
