package grad.microservice_auth.entities;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;

@Entity
@Table(name = "agents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Agent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Matricule : nullable, l'unicité est gérée dans le service
    // "NU" peut être dupliqué
    @Column(length = 100)
    private String matricule;

    @ManyToOne
    @JoinColumn(name = "id_grade", nullable = false)
    private Grade grade;

    @ManyToOne
    @JoinColumn(name = "id_fonction", nullable = false)
    private Fonction fonction;

    @ManyToOne
    @JoinColumn(name = "id_direction", nullable = false)
    private Direction direction;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 100)
    private String postnom;

    @Column(nullable = false, length = 100)
    private String prenom;

    @Column(nullable = false, length = 10)
    private String sexe; // M, F

    @Column(nullable = false)
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateNaissance;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 20)
    private String telephone;

    @Column(nullable = false, length = 20)
    private String etatCivil;

    @Column(nullable = false)
    private Boolean statut = true;

    @Column(nullable = false, length = 100)
    private String referenceEngagement;

    @Column(nullable = false)
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateEngagement;

    @Column(nullable = false, length = 100)
    private String province;

    @Column(nullable = false, length = 100)
    private String territoire;

    @Column(nullable = false, length = 100)
    private String village;

    @Column(nullable = false)
    private String photo; // chemin relatif (ex: /uploads/images/xxx.jpg)
}