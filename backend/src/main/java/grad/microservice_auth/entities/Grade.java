package grad.microservice_auth.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "grades", uniqueConstraints = {
        @UniqueConstraint(columnNames = "sigle"),
        @UniqueConstraint(columnNames = "nom")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Grade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 10)
    private String sigle;

    @Column(nullable = false, unique = true, length = 100)
    private String nom;

    @Column(nullable = false)
    private Boolean statut = true;
}