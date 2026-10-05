package grad.microservice_auth.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRoleDTO {
    private Long userId;
    private Long roleId;
    private String roleName;      // pour info
    private String username;      // pour info
    private LocalDateTime dateAttribution;
}