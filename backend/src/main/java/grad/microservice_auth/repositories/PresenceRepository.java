package grad.microservice_auth.repositories;

import grad.microservice_auth.entities.Presence;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface PresenceRepository extends JpaRepository<Presence, Long> {
    @Query("SELECT p FROM Presence p WHERE " +
            "LOWER(p.agent.nom) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.agent.prenom) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Presence> findByAgentNomOrPrenomContainingIgnoreCase(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT COUNT(p) FROM Presence p WHERE p.datePresence = :today")
    long countByDatePresence(@Param("today") LocalDate today);
}