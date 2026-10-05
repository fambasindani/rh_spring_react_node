package grad.microservice_auth.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NotificationRequest {
    private Long agentId;
    @NotNull private String message;
}