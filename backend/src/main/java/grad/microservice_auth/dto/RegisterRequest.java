package grad.microservice_auth.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String password;
    private String role; // ex: "ADMIN", "RH", "AGENT", etc.
}