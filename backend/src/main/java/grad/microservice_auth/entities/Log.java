package grad.microservice_auth.entities;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Log {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user; // peut être null si utilisateur non connecté

    @Column(nullable = false, length = 50)
    private String action; // ex: LOGIN, LOGOUT, CREATE_USER, UPDATE_USER, DELETE_USER, etc.

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(length = 45)
    private String ipAddress;

    @Column(length = 255)
    private String userAgent;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreatedDate
    private LocalDateTime createdAt;

    // Constructeur pratique
    public Log(User user, String action, String description, String ipAddress, String userAgent) {
        this.user = user;
        this.action = action;
        this.description = description;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
    }
}
