package grad.microservice_auth.entities;

import grad.microservice_auth.Enum.TypeSanction;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "sanctions")
public class Sanction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_agent", nullable = false)
    private Agent agent;

    @Enumerated(EnumType.STRING)
    private TypeSanction typeSanction;
    private String motif;
    private LocalDate dateSanction;
    private String reference;
}
