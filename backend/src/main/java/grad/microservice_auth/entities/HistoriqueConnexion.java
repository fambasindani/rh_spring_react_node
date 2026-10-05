package grad.microservice_auth.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "historiques_connexions")
public class HistoriqueConnexion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_user", nullable = false)
    private User user;

    private LocalDateTime dateConnexion = LocalDateTime.now();
    private String adresseIp;
    private String navigateur;
}
