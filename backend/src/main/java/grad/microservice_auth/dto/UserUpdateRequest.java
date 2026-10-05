package grad.microservice_auth.dto;

import lombok.Data;
import java.util.List;

@Data
public class UserUpdateRequest {
    private Boolean actif;
    private List<Long> roleIds;
    private String password; // optionnel
}