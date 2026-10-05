package grad.microservice_auth.dto;

import lombok.Data;
import java.util.List;

@Data
public class UserCreateRequest {
    private Long agentId;
    private List<Long> roleIds;
    private Boolean actif;
    private String password;
}