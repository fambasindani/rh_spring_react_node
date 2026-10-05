package grad.microservice_auth.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "types_conges")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TypeConge {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 100)
    private String nom;
    private Integer nombreJours;
    private String description;
    private Boolean statut = true;
}