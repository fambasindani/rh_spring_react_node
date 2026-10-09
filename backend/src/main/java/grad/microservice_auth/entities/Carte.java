package grad.microservice_auth.entities;

import grad.microservice_auth.Enum.CarteStatut;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "cartes")
public class Carte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "agent_id")
    private Agent agent;

    // Numero de carte fourni par l'entreprise
    private String numeroCarte;

    @Enumerated(EnumType.STRING)
    private CarteStatut statut = CarteStatut.DEMANDE;

    private LocalDate dateDemande = LocalDate.now();

    // Date a laquelle la carte a ete recue (accuse de reception depose)
    private LocalDate dateReception;

    // Date de validation de l'accuse de reception par les RH
    private LocalDate dateValidation;

    // Reference de l'accuse de reception physique
    private String referenceAccuse;

    private LocalDate datePerte;

    @Column(length = 500)
    private String motifPerte;

    @Column(length = 500)
    private String observation;
}
