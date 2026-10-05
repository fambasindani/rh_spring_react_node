package grad.microservice_auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
public class PromotionRequest {

    @NotNull(message = "L'ID de l'agent est obligatoire")
    private Long idAgent;

    @NotNull(message = "L'ID du grade est obligatoire")
    private Long idGrade;

    @NotNull(message = "La date de début est obligatoire")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateDebut;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateFin; // peut être null

    @NotBlank(message = "La référence est obligatoire")
    @Size(max = 100, message = "La référence ne peut pas dépasser 100 caractères")
    private String reference;
}