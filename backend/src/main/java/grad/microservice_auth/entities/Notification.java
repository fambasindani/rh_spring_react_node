package grad.microservice_auth.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "agent_id") // ← colonne en base : agent_id (ou id_agent selon votre schéma)
    private Agent agent;           // ← au lieu de User

    private String message;
    private Boolean lu = false;
    private LocalDateTime dateNotification = LocalDateTime.now();
}