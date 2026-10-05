package grad.microservice_auth.entities;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Entity
@Table(name = "users")   // ou "utilisateurs" selon votre base
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"agent", "userRoles"})
@ToString(exclude = {"agent", "userRoles"})
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "agent_id", nullable = false, unique = true)
    private Agent agent;

    @Column(nullable = false, unique = true, length = 100)
    private String username;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String password;

    private Boolean actif = true;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    private Set<UserRole> userRoles = new HashSet<>();

    // ========== MÉTHODES UserDetails ==========

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();

        for (UserRole userRole : userRoles) {
            authorities.add(new SimpleGrantedAuthority(userRole.getRole().getNomRole()));

            for (RoleDroit roleDroit : userRole.getRole().getRoleDroits()) {
                authorities.add(new SimpleGrantedAuthority(roleDroit.getDroit().getNomDroit()));
            }
        }

        return authorities;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return actif != null && actif;
    }

    // ========== MÉTHODE UTILITAIRE ==========

    public void addRole(Role role, LocalDateTime dateAttribution) {
        UserRole userRole = new UserRole(this, role, dateAttribution);
        userRoles.add(userRole);
    }
}