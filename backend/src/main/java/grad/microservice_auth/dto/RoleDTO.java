package grad.microservice_auth.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleDTO {
    private Long id;
    private String nomRole;
    private String description;
    private LocalDateTime dateCreation;



    public RoleDTO(Long id, String nomRole) {
        this.id = id;
        this.nomRole = nomRole;
    }
}

