package grad.microservice_auth.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Entity
@Table(name = "affiliations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Affiliation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_agent", nullable = false)
    private Agent agent;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 100)
    private String postnom;

    @Column(length = 100)
    private String prenom;

    @Column(nullable = false)
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateNaissance;

    @Column(nullable = false, length = 100)
    private String lieuNaissance;

    @Column(nullable = false, length = 10)
    private String etat; // "vivant" ou "mort"

    @Column(nullable = false, length = 100)
    private String relation;

    @Column(nullable = false)
    private Boolean statut = true;
}