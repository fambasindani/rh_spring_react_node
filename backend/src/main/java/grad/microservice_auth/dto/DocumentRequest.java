package grad.microservice_auth.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data

public class DocumentRequest {

    @NotNull(message = "L'ID de l'agent est obligatoire")
    private Long idAgent;

    @NotBlank(message = "L'intitulé est obligatoire")
    @Size(max = 100, message = "L'intitulé ne peut pas dépasser 100 caractères")
    private String intitule;

    @NotNull(message = "Le fichier est obligatoire")
    private MultipartFile fichier;
}