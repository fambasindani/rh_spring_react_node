package grad.microservice_auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
public class AffectationRequest {

    @NotNull(message = "L'ID de l'agent est obligatoire")
    @JsonProperty("id_agent")
    private Long idAgent;

    @NotNull(message = "L'ID de la direction est obligatoire")
    @JsonProperty("id_direction")
    private Long idDirection;

    @NotNull(message = "La date de début est obligatoire")
    @JsonProperty("date_debut")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateDebut;

    @JsonProperty("date_fin")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateFin;
}