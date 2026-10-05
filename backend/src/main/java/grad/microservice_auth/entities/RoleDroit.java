package grad.microservice_auth.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "role_droits")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class RoleDroit {
    @EmbeddedId
    private RoleDroitId id;

    @ManyToOne
    @MapsId("roleId")
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @ManyToOne
    @MapsId("droitId")
    @JoinColumn(name = "droit_id", nullable = false)
    private Droit droit;

    @Column(name = "date_attribution", nullable = false)
    private LocalDateTime dateAttribution = LocalDateTime.now();

    public RoleDroit(Role role, Droit droit) {
        this.id = new RoleDroitId(role.getId(), droit.getId());
        this.role = role;
        this.droit = droit;
    }
}
