// PrimeRepository.java
package grad.microservice_auth.repositories;

import grad.microservice_auth.entities.Prime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PrimeRepository extends JpaRepository<Prime, Long> {
    @Query("SELECT p FROM Prime p WHERE " +
            "(:keyword IS NULL OR LOWER(p.agent.nom) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.agent.prenom) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Prime> searchByAgentName(@Param("keyword") String keyword, Pageable pageable);
}