package grad.microservice_auth.repositories;

import grad.microservice_auth.entities.Evaluation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {

    @Query("SELECT e FROM Evaluation e WHERE " +
            "(:keyword IS NULL OR LOWER(e.agent.nom) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(e.agent.prenom) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Evaluation> searchByAgentName(@Param("keyword") String keyword, Pageable pageable);
}