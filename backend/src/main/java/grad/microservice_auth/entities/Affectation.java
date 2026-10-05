package grad.microservice_auth.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Entity
@Table(name = "affectations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Affectation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_agent", nullable = false)
    private Agent agent;

    @ManyToOne
    @JoinColumn(name = "id_direction", nullable = false)
    private Direction direction;

    @Column(nullable = false)
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateDebut;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateFin; // nullable
}