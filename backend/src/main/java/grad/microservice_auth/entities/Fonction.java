package grad.microservice_auth.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "fonctions", uniqueConstraints = {
        @UniqueConstraint(columnNames = "nom")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Fonction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String nom;

    @Column(nullable = false)
    private Boolean statut = true; // par défaut active
}