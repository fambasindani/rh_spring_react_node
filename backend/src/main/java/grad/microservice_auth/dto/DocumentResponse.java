package grad.microservice_auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DocumentResponse {
    private Long id;
    private Long idAgent;
    private String agentNom;
    private String agentPostnom;
    private String agentPrenom;
    private String intitule;
    private String cheminFichier;
}