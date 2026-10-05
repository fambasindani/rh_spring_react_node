package grad.microservice_auth.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignDroitRequest {
    @NotNull(message = "L'ID du rôle est obligatoire")
    private Long roleId;
}
