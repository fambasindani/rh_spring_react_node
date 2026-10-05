package grad.microservice_auth.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAdminDTO {
    private Long id;
    private String username;
    private Long agentId;
    private String agentNom;
    private String agentPrenom;
    private String agentMatricule;
    private List<RoleDTO> roles;
    private Boolean actif;
    private LocalDateTime dateCreation;
}
