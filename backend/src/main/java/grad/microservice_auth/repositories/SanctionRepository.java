package grad.microservice_auth.repositories;

import grad.microservice_auth.entities.Sanction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SanctionRepository extends JpaRepository<Sanction, Long> {

    @Query("SELECT s FROM Sanction s WHERE " +
            "(:keyword IS NULL OR LOWER(s.agent.nom) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(s.agent.prenom) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Sanction> findByAgentNomOrPrenomContainingIgnoreCase(@Param("keyword") String keyword, Pageable pageable);
}