
package grad.microservice_auth.entities;
import grad.microservice_auth.Enum.StatutConge;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;



@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "conges")
public class Conge {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_agent", nullable = false)
    private Agent agent;

    @ManyToOne
    @JoinColumn(name = "id_type_conge", nullable = false)
    private TypeConge typeConge;

    private LocalDate dateDebut;
    private LocalDate dateFin;
    private Integer nombreJours;
    private String motif;
    @Enumerated(EnumType.STRING)
    private StatutConge statut = StatutConge.EN_ATTENTE;
    private String observation;
    private LocalDateTime dateDemande = LocalDateTime.now();
}