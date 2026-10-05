package grad.microservice_auth.entities;

import grad.microservice_auth.Enum.StatutPointage;
import grad.microservice_auth.Enum.TypePointage;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "pointages")
public class Pointage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_agent", nullable = false)
    private Agent agent;

    @Enumerated(EnumType.STRING)
    private TypePointage type;

    @Enumerated(EnumType.STRING)
    private StatutPointage statut = StatutPointage.VALIDE;

    private LocalDateTime horodatage;
    private LocalDate datePresence;

    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;

    private Double precision;

    private String cheminPhoto;

    private String infosAppareil;
    private String idAppareil;
    private String adresseIp;

    @ManyToOne
    @JoinColumn(name = "id_zone_travail")
    private ZoneTravail zoneTravail;

    private String motifRejet;
    private String justification;
    private Integer minutesRetard = 0;
}
