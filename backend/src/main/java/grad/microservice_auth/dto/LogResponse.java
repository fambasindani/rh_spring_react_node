package grad.microservice_auth.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LogResponse {
    private Long id;
    private Long userId;
    private String username;
    private String action;
    private String description;
    private String ipAddress;
    private String userAgent;
    private LocalDateTime createdAt;
}
