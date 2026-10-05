package grad.microservice_auth.entities;

import grad.microservice_auth.Enum.StatutPresence;
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
@Table(name = "presences")
public class Presence {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_agent", nullable = false)
    private Agent agent;

    private LocalDate datePresence;
    private LocalTime heureArrivee;
    private LocalTime heureDepart;
    @Enumerated(EnumType.STRING)
    private StatutPresence statut = StatutPresence.PRESENT;
    private String observation;
}
