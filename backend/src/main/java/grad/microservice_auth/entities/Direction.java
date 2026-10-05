package grad.microservice_auth.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "directions", uniqueConstraints = {
        @UniqueConstraint(columnNames = "sigle"),
        @UniqueConstraint(columnNames = "nom")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Direction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String sigle;

    @Column(nullable = false, unique = true)
    private String nom;

    @Column(nullable = false)
    private Boolean statut; // true = actif, false = inactif
}