package grad.microservice_auth.repositories;

import grad.microservice_auth.entities.AgentFormation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AgentFormationRepository extends JpaRepository<AgentFormation, Long> {
    @Query("SELECT af FROM AgentFormation af WHERE " +
            "(:keyword IS NULL OR LOWER(af.agent.nom) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(af.agent.prenom) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(af.formation.intitule) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<AgentFormation> findByAgentNomOrPrenomOrFormationIntitule(@Param("keyword") String keyword, Pageable pageable);
}