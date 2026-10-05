package grad.microservice_auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private String username;
    private List<String> roles;
    private List<String> droits;
    private Long userId;
    private Long agentId;

    public AuthResponse(String token, String username, List<String> roles, List<String> droits, Long userId, Long agentId) {
        this.token = token;
        this.username = username;
        this.roles = roles;
        this.droits = droits;
        this.userId = userId;
        this.agentId = agentId;
    }
}