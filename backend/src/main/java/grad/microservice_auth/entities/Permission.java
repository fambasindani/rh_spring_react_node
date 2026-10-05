package grad.microservice_auth.entities;

import grad.microservice_auth.Enum.StatutConge;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "permissions")
public class Permission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_agent", nullable = false)
    private Agent agent;

    private LocalDate datePermission;
    private LocalTime heureSortie;
    private LocalTime heureRetour;
    private String motif;
    @Enumerated(EnumType.STRING)
    private StatutConge statut = StatutConge.EN_ATTENTE; // Réutilisation
}