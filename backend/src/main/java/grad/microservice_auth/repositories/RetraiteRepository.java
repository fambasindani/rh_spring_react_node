// RetraiteRepository.java
package grad.microservice_auth.repositories;

import grad.microservice_auth.entities.Retraite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RetraiteRepository extends JpaRepository<Retraite, Long> {
    @Query("SELECT r FROM Retraite r WHERE " +
            "(:keyword IS NULL OR LOWER(r.agent.nom) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(r.agent.prenom) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Retraite> searchByAgentName(@Param("keyword") String keyword, Pageable pageable);
}