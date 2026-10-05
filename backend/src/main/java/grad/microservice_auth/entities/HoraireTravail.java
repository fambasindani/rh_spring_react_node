package grad.microservice_auth.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "horaires_travail")
public class HoraireTravail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_agent")
    private Agent agent;

    private Integer jourSemaine;

    private LocalTime heureDebut;
    private LocalTime heureFin;

    private LocalTime debutFenetrePointage;
    private LocalTime finFenetrePointage;

    private Boolean actif = true;
}
