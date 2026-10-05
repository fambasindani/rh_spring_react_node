package grad.microservice_auth.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "roles")
@Getter
@Setter
@ToString(exclude = {"roleDroits"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@AllArgsConstructor
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "nom_role", nullable = false, unique = true, length = 100)
    private String nomRole;

    @Column(length = 255)
    private String description;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    @OneToMany(mappedBy = "role", fetch = FetchType.EAGER)
    private Set<RoleDroit> roleDroits = new HashSet<>();

    public Role(String nomRole) {
        this.nomRole = nomRole;
    }
}