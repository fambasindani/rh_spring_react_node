package grad.microservice_auth.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_agent", nullable = false)
    private Agent agent;

    @Column(nullable = false, length = 100)
    private String intitule;

    @Column(nullable = false)
    private String cheminFichier;
}