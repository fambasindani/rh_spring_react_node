package grad.microservice_auth.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "etudes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Etude {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_agent", nullable = false)
    private Agent agent;

    @Column(nullable = false)
    private Integer nombreAnnee; // nombre d'années

    @Column(nullable = false, length = 100)
    private String lieu;

    @Column(nullable = false, length = 100)
    private String etablissement;
}