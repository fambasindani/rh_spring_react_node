package grad.microservice_auth.repositories;

import grad.microservice_auth.entities.Contrat;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ContratRepository extends JpaRepository<Contrat, Long> {

    @Query("SELECT c FROM Contrat c WHERE " +
            "(:keyword IS NULL OR LOWER(c.agent.nom) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(c.agent.prenom) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(c.reference) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Contrat> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
}