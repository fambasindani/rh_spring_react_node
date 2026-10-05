package grad.microservice_auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private Long agentId;
    private String agentEmail;
    private String message;
    private Boolean lu;
    private LocalDateTime dateNotification;
}