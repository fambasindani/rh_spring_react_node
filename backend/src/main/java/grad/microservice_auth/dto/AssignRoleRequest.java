package grad.microservice_auth.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignRoleRequest {
    @NotNull(message = "L'ID du rôle est obligatoire")
    private Long roleId;
}