package grad.microservice_auth.dto;


import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CongeRequest {
    @NotNull
    private Long idAgent;
    @NotNull
    private Long idTypeConge;
    @NotNull
    private LocalDate dateDebut;
    @NotNull
    private LocalDate dateFin;
    private String motif;
}
