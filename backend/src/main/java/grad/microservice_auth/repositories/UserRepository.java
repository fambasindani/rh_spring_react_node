package grad.microservice_auth.repositories;

import grad.microservice_auth.entities.Agent;
import grad.microservice_auth.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Recherche par username (qui correspond à l'email de l'agent dans notre cas)
    @EntityGraph(attributePaths = {"agent", "userRoles", "userRoles.role", "userRoles.role.roleDroits", "userRoles.role.roleDroits.droit"})
    Optional<User> findByUsername(String username);

    // Vérifier si un agent possède déjà un compte utilisateur
    Optional<User> findByAgent(Agent agent);

    @EntityGraph(attributePaths = {"agent", "userRoles", "userRoles.role"})
    @Query("SELECT u FROM User u WHERE " +
            "LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.agent.nom) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.agent.prenom) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<User> findUsersByKeyword(@Param("keyword") String keyword);

    @EntityGraph(attributePaths = {"agent", "userRoles", "userRoles.role"})
    List<User> findAll();

    // (Optionnel) Recherche par email de l'agent via une jointure explicite
    @Query("SELECT u FROM User u JOIN FETCH u.agent a WHERE a.email = :email")
    Optional<User> findByAgentEmail(@Param("email") String email);
}
