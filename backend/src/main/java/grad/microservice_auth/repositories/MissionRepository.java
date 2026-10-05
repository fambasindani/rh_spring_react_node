// MissionRepository.java
package grad.microservice_auth.repositories;

import grad.microservice_auth.entities.Mission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MissionRepository extends JpaRepository<Mission, Long> {
    @Query("SELECT m FROM Mission m WHERE " +
            "(:keyword IS NULL OR LOWER(m.agent.nom) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(m.agent.prenom) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Mission> searchByAgentName(@Param("keyword") String keyword, Pageable pageable);
}